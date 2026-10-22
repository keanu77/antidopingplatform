import { CheckCircle, AlertTriangle, XCircle, Info, HelpCircle } from "lucide-react";
import { summarizeDrug } from "../../utils/tueDecision";

// 判定 tone → Tailwind 色票與圖示（決策工具與查詢結果共用）
export const VERDICT_STYLE = {
  green: { box: "bg-green-50 border-green-200", text: "text-green-800", Icon: CheckCircle },
  amber: { box: "bg-amber-50 border-amber-200", text: "text-amber-800", Icon: AlertTriangle },
  orange: { box: "bg-orange-50 border-orange-200", text: "text-orange-800", Icon: AlertTriangle },
  red: { box: "bg-red-50 border-red-200", text: "text-red-800", Icon: XCircle },
  blue: { box: "bg-blue-50 border-blue-200", text: "text-blue-800", Icon: Info },
  gray: { box: "bg-gray-50 border-gray-200", text: "text-gray-700", Icon: HelpCircle },
};

// 由 /api/tue/check 的回傳推導單筆查詢的判定 tone（供結果卡著色）
export function checkResultVerdict(r) {
  return summarizeDrug(r).verdict;
}
