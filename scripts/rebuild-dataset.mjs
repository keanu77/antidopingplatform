#!/usr/bin/env node
/**
 * rebuild-dataset.mjs — 從 repo 內的權威文件重建案例資料集。
 *
 * 背景（2026-09-19）：Zeabur 專案 antidoping-platform 連同其 MongoDB 被刪除，
 * 且 Zeabur 為硬刪除、無備份，網路封存館亦無紀錄。本腳本從 git 內留存的資料重建。
 *
 * ── 為什麼以「運動禁藥案例資料庫_完整清單.md」為唯一基底 ──
 * 該檔由 backend/export_cases_to_md.js 從當時的正式資料庫匯出（commit c3b96e5,
 * 2025-08-24，171 筆），且「移除所有虛構案例」的清理 commit(78858dd, 2025-08-22)
 * 發生在匯出之前，因此這 171 筆是清理後、逐筆有來源連結的版本。
 *
 * ── 為什麼不直接合併 backend/ 下的種子腳本 ──
 * 那些腳本共可抽出約 500 筆，但：
 *   1. loadCompleteDatabase.js 曾以 Math.random() 生成約 163 筆虛構案例
 *      （見 clean-fabricated-cases.js 檔頭），這些在執行期生成，無法靠靜態掃描辨識；
 *   2. verify_and_clean_cases.js / remove_suspicious_cases.js / curate_cases.js
 *      內的陣列是「保留白名單」與「待刪名單」，不是待新增資料；
 *   3. 無法確定生產環境實際執行過哪些腳本、順序為何
 *      （import-to-zeabur.js 只列 9 支，但資料庫內另有 add_famous_athletes.js、
 *        add_tue_cases.js、add_mlb_nba_cases.js 才有的條目）。
 * 本站逐筆指名真實運動員涉及禁藥，寧可少收錄，不可收錄無法查證者。
 *
 * ── 在基底之上套用 backend/curate_cases.js 的已審定勘誤 ──
 * 該腳本經 Codex Pass1 + Claude Pass2 對抗驗證，內含 11 筆欄位更正、6 筆重複刪除、
 * 3 筆新增。以姓名比對套用（原腳本用 MongoDB _id，資料庫已不存在）。
 * 基底中不存在的目標一律略過並列出，不臆測。
 *
 * 用法：node scripts/rebuild-dataset.mjs [--out <path>]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MD = join(ROOT, "運動禁藥案例資料庫_完整清單.md");
const outArg = process.argv.indexOf("--out");
const OUT = outArg !== -1 ? resolve(process.argv[outArg + 1]) : join(ROOT, "data", "cases.json");

// ── 1) 解析 markdown 基底 ────────────────────────────────────────────
function parseMarkdown(src) {
  const body = src.slice(src.indexOf("## 詳細案例清單"));
  const blocks = body.split(/\n### \d+\. /).slice(1);

  const field = (b, label) => {
    const m = b.match(new RegExp(`\\*\\*${label}\\*\\*:?\\s*(.+)`));
    return m ? m[1].trim() : "";
  };
  const section = (b, label) => {
    const m = b.match(new RegExp(`\\*\\*${label}\\*\\*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n---|$)`));
    return m ? m[1].trim() : "";
  };

  return blocks.map((b) => {
    const head = b.split("\n")[0].trim();
    const hm = head.match(/^(.*?)\s*\((\d{4})\)\s*$/);
    const sourceLinks = [...b.matchAll(/- \[([^\]]+)\]\(([^)]+)\)(?:\s*\(([^)]*)\))?/g)].map(
      (m) => ({ title: m[1], url: m[2], type: m[3] || "" }),
    );
    return {
      athleteName: hm ? hm[1].trim() : head,
      year: hm ? Number(hm[2]) : Number(field(b, "年份")) || null,
      sport: field(b, "運動項目"),
      nationality: field(b, "國籍"),
      substance: field(b, "禁用物質"),
      substanceCategory: field(b, "WADA分類"),
      eventBackground: section(b, "事件背景"),
      punishment: {
        banDuration: field(b, "禁賽期限"),
        resultsCancelled: field(b, "成績取消") === "是",
        medalStripped: field(b, "獎牌剝奪") === "是",
        otherPenalties: field(b, "其他處罰"),
      },
      summary: section(b, "案例摘要"),
      educationalNotes: section(b, "教育重點"),
      sourceLinks,
    };
  });
}

// ── 2) curate_cases.js 的勘誤，改以姓名比對 ──────────────────────────
// 每筆都保留原始 why，方便日後稽核。
const FIXES = [
  { match: "Alberto Contador", set: { substanceCategory: "S1.2: 合成代謝劑（其他合成代謝劑）" },
    why: "Clenbuterol 屬 S1.2（substances.json 確認），非 S6" },
  { match: "Canelo Alvarez", set: { substanceCategory: "S1.2: 合成代謝劑（其他合成代謝劑）" },
    why: "Clenbuterol 屬 S1.2；原標的 S4 為誤" },
  { match: "Sun Yang", year: 2014, set: { substanceCategory: "S4.4: 代謝調節劑" },
    why: "Trimetazidine 屬 S4.4，非 S6" },
  { match: "Brock Lesnar", set: { substanceCategory: "S4.2: 抗雌激素物質" },
    why: "Clomiphene 為抗雌激素 SERM 屬 S4.2，非 S4.4" },
  { match: "Simone Biles", set: { substance: "Methylphenidate (派醋甲酯／利他能)" },
    why: "原中文『甲基苯丙胺』為 methamphetamine 之誤；S6 分類正確" },
  { match: "Jannik Sinner", set: { "punishment.banDuration": "3個月（2025 WADA 案件和解）" },
    why: "2025-02 WADA 和解處 3 個月禁賽；原『無禁賽』已過時" },
  { match: "Paul Pogba", set: { "punishment.banDuration": "18個月（CAS 2024 減刑，原判 4 年）" },
    why: "CAS 2024-10 減為 18 個月；原『調查中』已過時" },
  { match: "Asafa Powell", set: { "punishment.banDuration": "6個月（CAS 減刑，原判 18 個月）" },
    why: "CAS 將 oxilofrine 案由 18 個月減為 6 個月" },
  { match: "Ryan Lochte", set: { substance: "靜脈輸注（禁用方法，非利尿劑）",
      substanceCategory: "M2: 化學和物理操作" },
    why: "2018 違規為禁止的靜脈輸注（>100mL），非 furosemide/S5" },
  { match: "Chris Froome",
    set: { "punishment.banDuration": "無處罰（2018 UCI/WADA 結案，認定非 AAF；非 TUE）" },
    why: "沙丁胺醇案經證據審查結案，非以 TUE 證明清白" },
  { match: "Andre Agassi",
    set: { "punishment.banDuration": "無正式禁賽（ATP 接受誤服說法；非 TUE）" },
    why: "1997 甲基安非他命案 ATP 接受其說法未處分，非 TUE" },
];

// 重複條目：以「可辨識特徵」指定要刪的那筆，keepHint 為原腳本標示保留者。
const DELETES = [
  { match: "Alex Rodriguez", contains: "211", keepHint: "162場/2014",
    why: "A-Rod 最終裁罰為 162 場；211 場為仲裁前原判，重複" },
];

// curate_cases.js 的 3 筆新增；依 athleteName 關鍵字 + year 去重（基底已有者略過）。
const INSERTS = [
  { dedupeKey: { name: "Valieva", year: 2022 }, case: {
      athleteName: "Kamila Valieva (卡米拉·瓦利耶娃)", nationality: "俄羅斯", sport: "花式滑冰",
      substance: "Trimetazidine", substanceCategory: "S4.4: 代謝調節劑", year: 2022,
      eventBackground: "俄羅斯花式滑冰選手瓦利耶娃於 2021 年 12 月的樣本檢出心臟藥物 trimetazidine（TMZ），在 2022 年北京冬奧期間曝光。國際體育仲裁法庭（CAS）於 2024 年 1 月裁定 4 年禁賽，追溯自 2021 年 12 月 25 日，並取消其自該日起的所有成績。",
      punishment: { banDuration: "4年（CAS 2024 判決，追溯自 2021 年 12 月）", resultsCancelled: true,
        medalStripped: true, otherPenalties: "俄羅斯奧會（ROC）2022 北京冬奧團體賽金牌遭取消，美國遞補金牌、日本銀牌" },
      sourceLinks: [
        { title: "CAS Media Release – Valieva", url: "https://www.tas-cas.org/", type: "CAS官方" },
        { title: "WADA Statement", url: "https://www.wada-ama.org/", type: "WADA" },
        { title: "ISU Decision", url: "https://www.isu.org/", type: "ISU" }],
      summary: "2022 北京冬奧最受矚目的禁藥案，凸顯未成年『受保護人員』的用藥責任與團隊監督問題。",
      educationalNotes: "Trimetazidine 屬 S4.4 代謝調節劑，全時段禁用。本案涉及未成年受保護人員的責任認定，以及成績追溯取消對團體獎牌的連帶影響。" } },
  { dedupeKey: { name: "Halep", year: 2022 }, case: {
      athleteName: "Simona Halep (西蒙娜·哈勒普)", nationality: "羅馬尼亞", sport: "網球",
      substance: "Roxadustat（併生物護照異常）",
      substanceCategory: "S2: 肽類激素、生長因子及相關物質（HIF 活化劑）", year: 2022,
      eventBackground: "前世界第一哈勒普於 2022 年美國網球公開賽期間檢出低劑量 roxadustat（缺氧誘導因子 HIF 活化劑），另有生物護照（ABP）異常。ITIA 於 2023 年判處 4 年禁賽；CAS 於 2024 年 3 月大幅減為 9 個月（認定與受污染補充劑有關），哈勒普已服滿並復出。",
      punishment: { banDuration: "9個月（CAS 2024 由 4 年減刑）", resultsCancelled: false,
        medalStripped: false, otherPenalties: "禁賽期間排名積分歸零" },
      sourceLinks: [
        { title: "CAS Decision – Halep", url: "https://www.tas-cas.org/", type: "CAS官方" },
        { title: "ITIA Statement", url: "https://www.itia.tennis/", type: "ITIA" }],
      summary: "由 4 年大幅減為 9 個月的知名減刑案，凸顯補充劑污染舉證與生物護照證據的爭點。",
      educationalNotes: "Roxadustat 為口服 HIF-PH 抑制劑（臨床用於腎性貧血），作用類似 EPO、提升攜氧能力，屬 S2 類。本案顯示運動員若能舉證污染來源與程度，可影響裁罰幅度。" } },
  { dedupeKey: { name: "Ryan Garcia", year: 2024 }, case: {
      athleteName: "Ryan Garcia (瑞恩·加西亞)", nationality: "美國", sport: "拳擊",
      substance: "Ostarine (SARM)", substanceCategory: "S1.2: 合成代謝劑（其他合成代謝劑）", year: 2024,
      eventBackground: "美國拳擊手 Ryan Garcia 在 2024 年 4 月對戰 Devin Haney 的賽事前後，經 VADA 檢出 ostarine（一種 SARM）陽性。紐約州運動委員會（NYSAC）判處 1 年禁賽（追溯自 2024 年 4 月 20 日）並處罰金，其對 Haney 的勝場改判為『無效判定』（No Contest）。",
      punishment: { banDuration: "1年（NYSAC，追溯自 2024 年 4 月 20 日）", resultsCancelled: true,
        medalStripped: false, otherPenalties: "對 Haney 之勝場改判無效判定（NC），並處罰金" },
      sourceLinks: [
        { title: "NYSAC Ruling", url: "https://dos.ny.gov/athletic-commission", type: "NYSAC" },
        { title: "VADA", url: "https://www.vada-testing.org/", type: "VADA" }],
      summary: "SARM（ostarine）在職業拳擊的近期案例，凸顯賽果改判與商業拳賽藥檢的爭議。",
      educationalNotes: "Ostarine（enobosarm）為選擇性雄激素受體調節劑（SARM），屬 S1.2 其他合成代謝劑，微量亦可能來自受污染補充劑。" } },
];

function setPath(obj, key, value) {
  if (!key.includes(".")) { obj[key] = value; return; }
  const parts = key.split(".");
  let cur = obj;
  for (const p of parts.slice(0, -1)) { cur[p] ??= {}; cur = cur[p]; }
  cur[parts.at(-1)] = value;
}

const norm = (s) => String(s || "").toLowerCase().replace(/[\s."'’`-]/g, "");

// ── 主流程 ───────────────────────────────────────────────────────────
const log = { applied: [], skipped: [], deleted: [], inserted: [], dedupedInsert: [] };
let cases = parseMarkdown(readFileSync(MD, "utf8"));
const baseCount = cases.length;

for (const d of DELETES) {
  const idx = cases.findIndex(
    (c) => norm(c.athleteName).includes(norm(d.match)) &&
           (!d.contains || JSON.stringify(c).includes(d.contains)),
  );
  if (idx === -1) { log.skipped.push(`DELETE 略過（找不到）: ${d.match} / ${d.contains ?? ""}`); continue; }
  log.deleted.push(`${cases[idx].athleteName}（${cases[idx].year}）— ${d.why}；保留 ${d.keepHint}`);
  cases.splice(idx, 1);
}

for (const f of FIXES) {
  const hits = cases.filter(
    (c) => norm(c.athleteName).includes(norm(f.match)) && (!f.year || c.year === f.year),
  );
  if (!hits.length) { log.skipped.push(`FIX 略過（基底無此人）: ${f.match} — ${f.why}`); continue; }
  for (const c of hits) {
    for (const [k, v] of Object.entries(f.set)) setPath(c, k, v);
    log.applied.push(`${c.athleteName}: ${Object.keys(f.set).join(", ")} — ${f.why}`);
  }
}

for (const ins of INSERTS) {
  const exists = cases.some(
    (c) => norm(c.athleteName).includes(norm(ins.dedupeKey.name)) && c.year === ins.dedupeKey.year,
  );
  if (exists) { log.dedupedInsert.push(`${ins.dedupeKey.name}（${ins.dedupeKey.year}）已存在於基底，略過新增`); continue; }
  cases.push(ins.case);
  log.inserted.push(`${ins.case.athleteName}｜${ins.case.sport}｜${ins.case.year}`);
}

cases.sort((a, b) => (b.year || 0) - (a.year || 0) || a.athleteName.localeCompare(b.athleteName));
cases = cases.map((c, i) => ({ id: String(i + 1), ...c }));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(cases, null, 1));

const line = (t, arr) => { if (!arr.length) return; console.log(`\n${t}（${arr.length}）`); for (const x of arr) console.log("  - " + x); };
console.log(`基底（完整清單.md 匯出）: ${baseCount} 筆`);
line("已刪除重複條目", log.deleted);
line("已套用欄位勘誤", log.applied);
line("已新增案例", log.inserted);
line("新增時去重略過", log.dedupedInsert);
line("略過的勘誤（基底不含該條目，不臆測）", log.skipped);
console.log(`\n最終: ${cases.length} 筆 → ${OUT}`);
const missing = (f) => cases.filter((c) => !c[f] || (Array.isArray(c[f]) && !c[f].length)).length;
console.log(`欄位缺漏檢查: 姓名 ${missing("athleteName")}、年份 ${missing("year")}、運動 ${missing("sport")}、國籍 ${missing("nationality")}、物質 ${missing("substance")}、分類 ${missing("substanceCategory")}、來源 ${missing("sourceLinks")}`);
