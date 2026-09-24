/**
 * 靜態資料層 — 取代原本的 MongoDB。
 *
 * 全部資料在 build 期就編進 Worker bundle；研究待查檔不會編入。
 * 查詢／篩選／統計一律在記憶體中完成，因此沒有資料庫容器、沒有連線延遲。
 * 回應格式逐一對齊原 backend/routes/*.js，前端不需修改。
 */
import cases from "../../data/cases.json";
// Only the alias map is bundled; research quarantine records stay outside the API.
import caseAliases from "../../data/case-aliases.json";
import { hasBan, banDurationCategory } from "./case-outcome.mjs";
import { topWithRemainder, reviewSummary, isCountryPending } from "./case-statistics.mjs";
import wadaCategories from "../../backend/data/wada-categories.json";
import quizzes from "../../backend/data/quizzes.json";
import specialties from "../../backend/data/medical-specialties.json";
import adrv from "../../backend/data/adrv-categories.json";
import substancesData from "../../backend/data/substances.json";
import tueContent from "../../data/tue-content.json";

export { cases, wadaCategories, quizzes, specialties, adrv, substancesData, tueContent };

/** 對齊 casesFixed.js 的 escapeRegex，避免使用者輸入被當成正規表達式。 */
export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const lower = (v) => String(v ?? "").toLowerCase();

/** 對齊原本 punishmentType 的 $switch 分支語意。 */
function matchesPunishmentType(c, type) {
  const ban = String(c.punishment?.banDuration ?? "");
  const other = String(c.punishment?.otherPenalties ?? "");
  switch (type) {
    case "禁賽":
      return hasBan(c);
    case "獎牌剝奪":
      return c.punishment?.medalStripped === true;
    case "成績取消":
      return c.punishment?.resultsCancelled === true;
    case "罰款":
      return /罰款|罰金/i.test(other) || /罰款|罰金/i.test(ban);
    case "警告":
      return /警告|告誡|公開警告/i.test(ban) || /警告|告誡/i.test(other);
    case "其他":
      return other !== "" || /其他|特殊/i.test(ban);
    default:
      return true;
  }
}

/** 列表查詢：篩選 → 依年份降序 → 分頁。回傳格式同原 GET /api/cases。 */
export function queryCases({ sport, nationality, year, substanceCategory, punishmentType, search, page = 1, limit = 12 }) {
  let out = cases;

  if (sport) out = out.filter((c) => c.sport === sport);
  if (nationality) out = out.filter((c) => c.nationality === nationality);
  if (year) out = out.filter((c) => c.year === Number(year));
  if (substanceCategory) out = out.filter((c) => c.substanceCategory === substanceCategory);
  if (punishmentType) out = out.filter((c) => matchesPunishmentType(c, punishmentType));

  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    out = out.filter(
      (c) => re.test(c.athleteName) || re.test(c.sport) || re.test(c.nationality) || re.test(c.substance),
    );
  }

  const total = out.length;
  const sorted = [...out].sort((a, b) => (b.year || 0) - (a.year || 0));
  const start = (page - 1) * limit;

  // 對齊原本的 listProjection：列表只回必要欄位
  const list = sorted.slice(start, start + limit).map((c) => ({
    _id: c.id,
    id: c.id,
    athleteName: c.athleteName,
    sport: c.sport,
    nationality: c.nationality,
    year: c.year,
    substance: c.substance,
    substanceCategory: c.substanceCategory,
    punishment: {
      banDuration: c.punishment?.banDuration,
      medalStripped: c.punishment?.medalStripped,
      resultsCancelled: c.punishment?.resultsCancelled,
    },
    summary: c.summary,
    review: c.review,
  }));

  return { cases: list, totalCases: total, currentPage: page, totalPages: Math.ceil(total / limit), limit };
}

export function getCaseById(id) {
  const canonicalId = caseAliases[String(id)] ?? String(id);
  const c = cases.find((x) => String(x.id) === canonicalId);
  return c ? { ...c, _id: c.id } : null;
}

export function getFilterOptions() {
  const uniq = (fn) => [...new Set(cases.map(fn).filter(Boolean))];
  return {
    sports: uniq((c) => c.sport).sort(),
    nationalities: uniq((c) => c.nationality).sort(),
    substanceCategories: uniq((c) => c.substanceCategory).sort(),
    years: uniq((c) => c.year).sort((a, b) => b - a),
  };
}

function countBy(keyFn) {
  const m = new Map();
  for (const c of cases) {
    const k = keyFn(c);
    if (k === undefined || k === null || k === "") continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([key, count]) => ({ key, count }));
}

export const stats = {
  reviewSummary() {
    return reviewSummary(cases);
  },
  overview() {
    const uniq = (fn) => new Set(cases.map(fn).filter(Boolean)).size;
    const sports = uniq((c) => c.sport);
    const countries = uniq((c) => c.nationality);
    return {
      totalCases: cases.length,
      uniqueSports: sports,
      uniqueCountries: countries,
      uniqueSubstances: uniq((c) => c.substance),
      totalSports: sports,
      totalCountries: countries,
    };
  },
  yearlyTrends() {
    return countBy((c) => c.year)
      .sort((a, b) => a.key - b.key)
      .map(({ key, count }) => ({ year: key, count }));
  },
  sportDistribution() {
    return countBy((c) => c.sport)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ key, count }) => ({ sport: key, count }));
  },
  substanceDistribution() {
    return topWithRemainder(countBy((c) => {
      const label = c.substanceCategory?.trim();
      // Exclude unknown classifications before grouping the remainder.
      return !label || /未.*核對|未標示/.test(label) ? null : label;
    }))
      .map(({ key, count }) => ({ category: key, count }));
  },
  nationalityDistribution() {
    return countBy((c) => c.nationality)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
      .map(({ key, count }) => ({ name: key, value: count }));
  },
  countryDistribution() {
    return countBy((c) => c.nationality)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
      .map(({ key, count }) => {
        const pending = cases.filter((c) => c.nationality === key && isCountryPending(c)).length;
        return { country: key, count, confirmed: count - pending, pending };
      });
  },
  punishmentStats() {
    return {
      medalStripped: cases.filter((c) => c.punishment?.medalStripped === true).length,
      resultsCancelled: cases.filter((c) => c.punishment?.resultsCancelled === true).length,
    };
  },
  banDurationDistribution() {
    const rows = countBy(banDurationCategory).sort((a, b) => b.count - a.count);
    const total = rows.reduce((a, r) => a + r.count, 0) || 1;
    return rows.map(({ key, count }) => ({
      category: key,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  },
};

/** 對齊 tue.js 的 lookupSubstance：先查鍵，再比對 aliases / displayName。 */
export function lookupSubstance(query) {
  const wada = substancesData.substances || {};
  const q = lower(query).trim();
  if (Object.hasOwn(wada, q)) return { key: q, info: wada[q] };
  for (const [key, info] of Object.entries(wada)) {
    const aliases = (info.aliases || []).map((a) => lower(a));
    if (aliases.includes(q) || lower(info.displayName) === q) return { key, info };
  }
  return null;
}
