import { banDurationCategory } from "../../../functions/_lib/case-outcome.mjs";

// Preserve the distribution chart colors, keyed by category rather than rank.
export const banDurationColors = {
  "4年以上": "#2563eb",
  "1-2年": "#059669",
  "2-4年": "#9333ea",
  "1-6個月": "#d97706",
  "無禁賽／處分撤銷": "#e11d48",
  "7-12個月": "#0891b2",
  "終身／無限期": "#4f46e5",
  "暫時禁賽（非最終處分）": "#65a30d",
};
export const banDurationColor = (category) => banDurationColors[category] ?? "#64748b";
export function caseDurationStyle(caseData) {
  const color = banDurationColor(banDurationCategory(caseData));
  return { "--case-accent": color, "--case-tint": `${color}18`, "--case-wash": `${color}09` };
}
