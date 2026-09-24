import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";
import { evaluateDrug } from "../frontend/src/utils/tueDecision.js";
import { prohibitedList } from "../frontend/src/data/prohibitedList.js";
import { scenarioQuestions, knowledgeQuestions } from "../frontend/src/data/quiz.js";

// Exercise the actual Pages API and decision engine against WADA 2026 rule boundaries.
// Sources and scope are recorded in docs/reviews/2026-09-23-site-audit/content-sources.md.
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../functions/api/[[path]].js", import.meta.url))],
  bundle: true, write: false, platform: "node", format: "esm",
});
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

async function api(path, body) {
  const request = new Request(`https://rules.invalid/api/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const response = await onRequest({ request, env: {}, params: { path: path.split("/") } });
  assert.equal(response.status, 200);
  return response.json();
}

const { substances } = await api("tue/substances");
const question = (id) => [...scenarioQuestions, ...knowledgeQuestions].find((item) => item.id === id);
const category = (id) => prohibitedList.find((item) => item.id === id);

test("S3: formoterol carries both delivered-dose limits through lookup and decision output", async () => {
  const found = await api("tue/check", { drugName: "formoterol" });
  const result = evaluateDrug(found, { route: "inhaled" });
  assert.equal(result.verdict, "permitted-threshold");
  assert.match(result.threshold, /24.*54/);
  assert.match(result.threshold, /12.*36/);
  assert.match(result.routeNote, /delivered dose/);
  assert.equal(evaluateDrug(found, { route: "oral" }).verdict, "needs-tue");

  const asthma = (await api("tue/diseases")).find((item) => /Asthma/.test(item.name));
  const limits = asthma.tuePoints.find((point) => point.includes("Formoterol"));
  assert.match(limits, /Formoterol[^）]*54[^）]*12h[^）]*36/);
  assert.match(limits, /Salmeterol[^）]*200[^）]*8h[^）]*100/);
});

test("P1: actual API sports drive the new CMAS and mini-golf competition decisions", () => {
  for (const key of ["propranolol", "atenolol"]) {
    const drug = substances[key];
    for (const sport of ["自由潛水（CMAS）", "魚槍捕魚（CMAS）", "水下標靶射擊（CMAS）"]) {
      assert.ok(drug.sportRestricted.includes(sport));
      assert.equal(evaluateDrug(drug, { sport, inCompetition: false }).verdict, "needs-tue");
      assert.equal(evaluateDrug(drug, { sport, inCompetition: true }).verdict, "needs-tue");
    }
    assert.equal(evaluateDrug(drug, { sport: "迷你高爾夫", inCompetition: true }).verdict, "needs-tue");
    assert.equal(evaluateDrug(drug, { sport: "迷你高爾夫", inCompetition: false }).verdict, "permitted");
    assert.ok(!drug.sportRestricted.some((sport) => /滑雪|雪板/.test(sport)));
    assert.equal(evaluateDrug(drug, { sport: "滑雪／雪板（部分項目）", inCompetition: true }).verdict, "permitted");
  }
});

test("testosterone lookup allows medical TUE review and does not promise eligibility approval", async () => {
  const drug = await api("tue/check", { drugName: "testosterone" });
  assert.equal(drug.needsTUE, true);
  assert.equal(drug.tueEligible, true);
  assert.equal(evaluateDrug(drug).verdict, "needs-tue");
  assert.match(drug.explanation, /TUEC 個案審查/);
  assert.match(drug.explanation, /體質性青春期延遲/);
  assert.match(drug.explanation, /並非自動核准/);
});

test("S9: out-of-competition permission preserves residual and retroactive TUE caveats", () => {
  for (const key of ["prednisolone", "dexamethasone", "hydrocortisone"]) {
    const drug = substances[key];
    const result = evaluateDrug(drug, { route: "injection", inCompetition: false });
    assert.equal(result.verdict, "permitted");
    assert.match(result.reasons.join(" "), /賽內檢體殘留/);
    assert.match(result.reasons.join(" "), /回溯 TUE/);
    assert.doesNotMatch(result.reasons.join(" "), /不需 TUE/);
    assert.match(result.washout, /最後一劑.*賽內期間開始/);
    assert.match(result.washout, /並非保證/);
    assert.equal(evaluateDrug(drug, { route: "injection", inCompetition: true }).verdict, "needs-tue");
    assert.equal(evaluateDrug(drug, { route: "inhaled", inCompetition: true }).verdict, "permitted");
  }
  assert.match(category("s9").description, /至少 60 天/);
  assert.doesNotMatch(category("s9").description, /最長.*60/);
});

test("S4/S6 cannot be labeled as wholly specified; subgroup distinctions remain visible", () => {
  for (const id of ["s4", "s6"]) {
    assert.equal(category(id).specifiedStatus, "mixed");
    assert.notEqual(category(id).isSpecified, true);
    assert.match(category(id).specifiedDetail, /非特定物質/);
  }
  assert.match(category("s4").specifiedDetail, /S4\.1、S4\.2.*特定.*S4\.3、S4\.4.*非特定/);
  assert.match(category("s6").specifiedDetail, /S6\.A.*非特定.*S6\.B.*特定/);
});

test("M2 teaching preserves all three medical exceptions and separates infused substances", () => {
  for (const text of [category("m2").description, question("sc5").explanation]) {
    assert.match(text, /12.*100mL/);
    for (const exception of ["醫院治療", "外科手術", "臨床診斷"]) assert.ok(text.includes(exception));
    assert.match(text, /不符合.*例外.*TUE/);
    assert.match(text, /物質/);
  }
});

test("quiz does not equate any cold medicine or excess inhaled dose with an automatic violation", () => {
  assert.match(question("sc8").explanation, /150µg\/mL/);
  assert.match(question("sc8").explanation, /不能.*判定違規/);
  assert.match(question("sc6").explanation, /8.*600/);
  assert.match(question("sc6").explanation, /超出.*TUE.*可能/);
  assert.doesNotMatch(question("sc6").explanation, /超過則視為違規/);
});

test("sanction and minor-sampling lessons retain case-specific qualifications", () => {
  assert.match(question("kn2").question, /初次.*故意.*基準/);
  assert.match(question("kn2").explanation, /無過失.*減免/);
  assert.match(question("kn5").explanation, /不需證明故意/);
  assert.match(question("kn5").explanation, /免除或減輕禁賽/);
  assert.match(question("kn7").options[question("kn7").correctIndex], /可要求代表陪同/);
  assert.match(question("kn7").explanation, /不等於必須直接觀看排尿/);
});

test("home facts retain 2026 monitoring status and avoid broad IV or sanction claims", () => {
  const home = readFileSync(new URL("../frontend/src/pages/Home.jsx", import.meta.url), "utf8");
  const facts = home.slice(home.indexOf("const facts = ["), home.indexOf("const navCards"));
  assert.match(facts, /2026.*semaglutide.*tirzepatide.*尚未列入禁用清單/);
  assert.doesNotMatch(facts, /2028|因為涉及靜脈內操作|不能成為躲避處罰/);
  assert.match(facts, /M1\.3.*物理方式.*血液/);
  assert.match(facts, /不需證明故意或過失.*個別評估/);
  assert.match(facts, /8 小時.*600/);
});
