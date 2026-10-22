import EvidenceLinks from "../EvidenceLinks";
import { S5_EXCEPTIONS_NOTE } from "../../data/s5Rule";
import { useState, useEffect } from "react";
import { Pill } from "lucide-react";
import { tueAPI } from "../../services/api";
import {
  evaluateDrug,
  availableRoutes,
  requiresSport,
  requiresCompetitionContext,
  requiresS5Check,
  ROUTE_LABELS,
  VERDICT_META,
} from "../../utils/tueDecision";
import { decisionScenarios } from "../../data/tueGuide";
import { VERDICT_STYLE } from "./verdictStyle";

const SELECT_CLASS =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500";

const EMPTY_SELECTION = { drug: "", route: "", inCompetition: true, sport: "", s5Concomitant: "unknown" };

function toggleClass(active) {
  return `flex-1 px-4 py-2 rounded-lg font-medium border transition ${
    active
      ? "bg-primary-600 text-white border-primary-600"
      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
  }`;
}

function DecisionResult({ result }) {
  const meta = VERDICT_META[result.verdict];
  const style = VERDICT_STYLE[meta.tone];
  return (
    <div className={`rounded-lg border p-4 ${style.box}`} role="status">
      <div className={`flex items-center font-bold text-lg ${style.text}`}>
        <style.Icon className="h-6 w-6 mr-2 flex-shrink-0" />
        {meta.label}
      </div>
      <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
        {result.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <EvidenceLinks evidenceId={result.evidence?.evidenceId} />
      {result.threshold && (
        <p className="mt-2 text-sm font-medium text-gray-800">閾值：{result.threshold}</p>
      )}
      {result.washout && (
        <p className="mt-1 text-sm font-medium text-gray-800">
          停藥（washout）參考：{result.washout}
        </p>
      )}
    </div>
  );
}

// 多步決策工具（藥物 × 途徑 × 賽內外 × 運動項目）
function DecisionTool() {
  const [substances, setSubstances] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [selection, setSelection] = useState(EMPTY_SELECTION);

  useEffect(() => {
    let active = true;
    tueAPI
      .getSubstances()
      .then((res) => {
        if (active) setSubstances(res.data?.substances || {});
      })
      .catch(() => {
        if (active) setLoadError("無法載入物質清單，請稍後再試");
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (patch) => setSelection((prev) => ({ ...prev, ...patch }));
  // 切換藥物時重置途徑／運動選擇，避免殘留前一個藥的選項
  const selectDrug = (drug) => update({ drug, route: "", sport: "", s5Concomitant: "unknown" });

  const substance = selection.drug && substances ? substances[selection.drug] : null;
  const routes = availableRoutes(substance);
  const result = substance
    ? evaluateDrug(substance, {
        route: selection.route || null,
        inCompetition: selection.inCompetition,
        sport: selection.sport || null,
        s5Concomitant: selection.s5Concomitant,
      })
    : null;

  const sortedEntries = substances
    ? Object.entries(substances).sort((a, b) =>
        a[1].displayName.localeCompare(b[1].displayName, "zh-Hant"),
      )
    : [];

  return (
    <section id="tue-decision" tabIndex={-1} className="bg-white rounded-lg shadow-lg p-6 scroll-mt-24">
      <div className="flex items-center mb-2">
        <Pill className="h-6 w-6 text-primary-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-900">這個藥要不要 TUE？— 多步決策工具</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        依「給藥途徑 × 賽內／賽外 × 運動項目」逐步判定。同一藥物在不同條件下結果可能不同（如糖皮質激素賽內注射需
        TUE、吸入允許）。
      </p>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}
      {!substances && !loadError && <p className="text-sm text-gray-500">載入物質清單中…</p>}

      {substances && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">先試試看：三個常見情境</p>
            <div className="flex flex-col gap-2">
              {decisionScenarios
                .filter((s) => substances[s.preset.drug])
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelection({ ...EMPTY_SELECTION, ...s.preset })}
                    className="text-left text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:text-primary-700 transition"
                  >
                    {s.question}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label htmlFor="tue-decision-drug" className="block text-sm font-medium text-gray-700 mb-1">
              選擇藥物
            </label>
            <select
              id="tue-decision-drug"
              value={selection.drug}
              onChange={(e) => selectDrug(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">請選擇藥物</option>
              {sortedEntries.map(([key, info]) => (
                <option key={key} value={key}>
                  {info.displayName}（{info.categoryLabel}）
                </option>
              ))}
            </select>
          </div>

          {substance && routes.length > 0 && (
            <div>
              <label htmlFor="tue-decision-route" className="block text-sm font-medium text-gray-700 mb-1">
                給藥途徑
              </label>
              <select
                id="tue-decision-route"
                value={selection.route}
                onChange={(e) => update({ route: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="">請選擇給藥途徑</option>
                {routes.map((rk) => (
                  <option key={rk} value={rk}>
                    {ROUTE_LABELS[rk] || rk}
                  </option>
                ))}
              </select>
            </div>
          )}

          {substance && requiresCompetitionContext(substance) && (
            <div>
              <p id="tue-competition-label" className="block text-sm font-medium text-gray-700 mb-1">
                使用時機（賽內／賽外）
              </p>
              <div className="flex gap-2" role="group" aria-labelledby="tue-competition-label">
                <button
                  type="button"
                  aria-pressed={selection.inCompetition}
                  onClick={() => update({ inCompetition: true })}
                  className={toggleClass(selection.inCompetition)}
                >
                  賽內（比賽期間）
                </button>
                <button
                  type="button"
                  aria-pressed={!selection.inCompetition}
                  onClick={() => update({ inCompetition: false })}
                  className={toggleClass(!selection.inCompetition)}
                >
                  賽外（訓練期間）
                </button>
              </div>
            </div>
          )}

          {substance && requiresSport(substance) && (
            <div>
              <label htmlFor="tue-decision-sport" className="block text-sm font-medium text-gray-700 mb-1">
                運動項目
              </label>
              <select
                id="tue-decision-sport"
                value={selection.sport}
                onChange={(e) => update({ sport: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="">請選擇運動項目</option>
                {(substance.sportRestricted || []).map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
                <option value="其他運動項目">其他運動項目（未列於 P1）</option>
              </select>
            </div>
          )}

          {substance && requiresS5Check(substance) && (
            <div>
              <label htmlFor="tue-decision-s5" className="block text-sm font-medium text-gray-700 mb-1">
                是否併用 S5 利尿劑／掩蔽劑？
              </label>
              <select id="tue-decision-s5" value={selection.s5Concomitant} onChange={(e) => update({ s5Concomitant: e.target.value })} aria-describedby="tue-s5-help" className={SELECT_CLASS}>
                <option value="unknown">尚未確認／不確定</option>
                <option value="none">已確認未併用</option>
                <option value="prohibited">有併用禁用的 S5 藥物（含已持有其 TUE）</option>
                <option value="exception">已確認僅使用下列 S5 例外成分及途徑</option>
              </select>
              <p id="tue-s5-help" className="mt-2 text-sm text-gray-600">
                常見禁用例子：furosemide、hydrochlorothiazide、spironolactone。{S5_EXCEPTIONS_NOTE}
              </p>
            </div>
          )}

          {result && <DecisionResult result={result} />}

          <p className="text-xs text-gray-500 border-t pt-3">
            本工具僅供衛教參考，無法取代醫師診察與個別用藥評估。實際比賽用藥合規性請以 WADA
            官方禁用清單與{" "}
            <a
              href="https://www.globaldro.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 underline"
            >
              Global DRO
            </a>{" "}
            （不含台灣購藥）或 <a href="https://www.check-antidoping.org.tw/" target="_blank" rel="noopener noreferrer" className="text-primary-700 underline">TADA 藥物查詢系統</a>為準，並諮詢醫療與運動禁藥防制專業人員。
          </p>
        </div>
      )}
    </section>
  );
}

export default DecisionTool;
