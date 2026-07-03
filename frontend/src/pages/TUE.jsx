import { useState, useEffect } from "react";
import {
  FileText,
  Info,
  UserCheck,
  Stethoscope,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Users,
  Calendar,
  Pill,
  XCircle,
} from "lucide-react";
import { tueAPI } from "../services/api";
import {
  evaluateDrug,
  availableRoutes,
  requiresSport,
  requiresCompetitionContext,
  ROUTE_LABELS,
  VERDICT_META,
} from "../utils/tueDecision";

// 判定 tone → Tailwind 色票與圖示（決策工具與查詢結果共用）
const VERDICT_STYLE = {
  green: {
    box: "bg-green-50 border-green-200",
    text: "text-green-800",
    Icon: CheckCircle,
  },
  amber: {
    box: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    Icon: AlertTriangle,
  },
  orange: {
    box: "bg-orange-50 border-orange-200",
    text: "text-orange-800",
    Icon: AlertTriangle,
  },
  red: { box: "bg-red-50 border-red-200", text: "text-red-800", Icon: XCircle },
  blue: {
    box: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    Icon: Info,
  },
  gray: {
    box: "bg-gray-50 border-gray-200",
    text: "text-gray-700",
    Icon: HelpCircle,
  },
};

// 由 /api/tue/check 的回傳推導單筆查詢的判定 tone（供結果卡著色）
function checkResultVerdict(r) {
  if (!r || r.matchedKey === null || r.needsTUE === null) return "unknown";
  if (r.needsTUE === true) return "needs-tue";
  if (r.prohibition === "monitored") return "monitored";
  if (r.prohibition === "not-prohibited") return "permitted";
  // 僅賽內禁用（如偽麻黃鹼、古柯鹼）：徽章須與「僅賽內禁用」說明一致，
  // 不可因 needsTUE=false 就顯示綠色「允許」。
  if (r.prohibition === "in-competition") return "in-competition";
  if (r.tueEligible === false) return "prohibited";
  return "permitted";
}

function TUE() {
  const [activeTab, setActiveTab] = useState("basic");

  // P1-10 單筆藥物查詢（改打 /api/tue/check，資料單一來源自 substances.json）
  const [drugCheckQuery, setDrugCheckQuery] = useState("");
  const [drugCheckResult, setDrugCheckResult] = useState(null);
  const [drugCheckLoading, setDrugCheckLoading] = useState(false);
  const [drugCheckError, setDrugCheckError] = useState(null);

  // P1-11 多步決策工具（藥物 × 途徑 × 賽內外 × 運動項目）
  const [substances, setSubstances] = useState(null);
  const [substancesError, setSubstancesError] = useState(null);
  const [decisionKey, setDecisionKey] = useState("");
  const [decisionRoute, setDecisionRoute] = useState("");
  const [decisionInComp, setDecisionInComp] = useState(true);
  const [decisionSport, setDecisionSport] = useState("");

  useEffect(() => {
    document.title = "TUE 治療用途豁免指南 | 乾淨運動從你我開始";
  }, []);

  // 載入結構化物質清單（供決策工具與下拉選單），只需一次
  useEffect(() => {
    let active = true;
    tueAPI
      .getSubstances()
      .then((res) => {
        if (active) setSubstances(res.data?.substances || {});
      })
      .catch(() => {
        if (active) setSubstancesError("無法載入物質清單，請稍後再試");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDrugCheck = async () => {
    if (!drugCheckQuery.trim()) return;
    setDrugCheckLoading(true);
    setDrugCheckError(null);
    try {
      const res = await tueAPI.checkDrugTUE(drugCheckQuery.trim());
      setDrugCheckResult(res.data);
    } catch {
      setDrugCheckError("查詢失敗，請檢查網路連線後再試");
      setDrugCheckResult(null);
    } finally {
      setDrugCheckLoading(false);
    }
  };

  // 切換藥物時重置途徑／運動選擇，避免殘留前一個藥的選項
  const handleDecisionDrugChange = (key) => {
    setDecisionKey(key);
    setDecisionRoute("");
    setDecisionSport("");
  };

  // 決策工具當前選中的物質與即時判定
  const decisionSubstance =
    decisionKey && substances ? substances[decisionKey] : null;
  const decisionRoutes = availableRoutes(decisionSubstance);
  const decisionResult = decisionSubstance
    ? evaluateDrug(decisionSubstance, {
        route: decisionRoute || null,
        inCompetition: decisionInComp,
        sport: decisionSport || null,
      })
    : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          治療用途豁免 (TUE) 專區
        </h1>
        <p className="text-gray-600">
          了解TUE申請流程、獲取專業指引，確保合規用藥
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab("basic")}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "basic"
              ? "bg-white text-primary-600 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Info className="h-4 w-4 mr-2 inline" />
          基礎知識
        </button>
        <button
          onClick={() => setActiveTab("application")}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "application"
              ? "bg-white text-primary-600 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <UserCheck className="h-4 w-4 mr-2 inline" />
          申請指引
        </button>
        <button
          onClick={() => setActiveTab("diseases")}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "diseases"
              ? "bg-white text-primary-600 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Stethoscope className="h-4 w-4 mr-2 inline" />
          疾病分類
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "tools"
              ? "bg-white text-primary-600 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Search className="h-4 w-4 mr-2 inline" />
          實用工具
        </button>
      </div>

      {/* Basic Knowledge Tab */}
      {activeTab === "basic" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg mr-4">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  什麼是TUE？
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  運動員如因治療病症而必須使用到禁用清單上的禁用物質或方法時，須申請治療用途豁免（Therapeutic
                  Use Exemption,
                  TUE），申請案件將由醫師組成的TUE審查委員會進行審查。運動員取得TUE核可後方得使用該禁用物質或方法，而不受違反運動禁藥管制規則之處分。
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    TUE可查詢來源
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• 禁用清單</li>
                    <li>• 運動禁藥諮詢平台</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  TUE核准標準
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  依2023年ISTUE第4.2條，以下四項核可條件皆須同時符合，方能取得核可：
                </p>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      1. 清楚的醫療診斷（ISTUE 4.2a）
                    </h4>
                    <p className="text-gray-700">
                      運動員有清楚的醫療診斷，治療該疾病/症狀必須使用禁用物質或方法
                    </p>
                  </div>
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      2. 不會額外提升運動表現（ISTUE 4.2b）
                    </h4>
                    <p className="text-gray-700">
                      依機率權衡，治療用的物質或方法將不會產生超出回復正常健康狀態的額外運動表現提升
                    </p>
                  </div>
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      3. 無其他合理替代方法（ISTUE 4.2c）
                    </h4>
                    <p className="text-gray-700">
                      除了該禁用物質或方法之外，沒有其他合理可行的治療替代方法（不以先試用其他方法並失敗為要件）
                    </p>
                  </div>
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      4. 非基於先前違規使用（ISTUE 4.2d）
                    </h4>
                    <p className="text-gray-700">
                      必須使用該禁用物質或方法的原因，不得為用於治療先前違規使用禁用物質或方法所致之疾患
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  申請對象分類
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      國際級運動員
                    </h4>
                    <p className="text-gray-700 text-sm mb-2">
                      向國際單項運動總會申請
                    </p>
                    <p className="text-gray-600 text-xs">
                      常見包含：需填報行蹤之TP/RTP運動員、參與總會舉辦特定賽事之運動員
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      國家級運動員及非國家級運動員
                    </h4>
                    <p className="text-gray-700 text-sm">
                      向中華運動禁藥防制基金會申請
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      參與國際賽事運動員
                    </h4>
                    <p className="text-gray-700 text-sm">
                      依據賽事競賽規程辦理（如：亞運、奧運、世界錦標賽）
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  申請時間規定
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-amber-300 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      隨時禁用物質（S0~S5、M1~M3）
                    </h4>
                    <p className="text-gray-700">
                      無論賽內或賽外皆禁用，無論是否參賽，應儘速提出申請
                    </p>
                  </div>
                  <div className="border-l-4 border-amber-300 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      賽內禁用物質（S6~S9）
                    </h4>
                    <p className="text-gray-700">
                      依賽事主辦單位訂定之申請日期為原則，一般為賽前30天
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      賽內期：指運動員表定參賽之前一日23:59起算直到比賽與檢體採集流程結束為止
                    </p>
                  </div>
                  <div className="border-l-4 border-amber-300 pl-4">
                    <h4 className="font-semibold text-gray-900">
                      特定運動禁用（P1 β阻斷劑）
                    </h4>
                    <p className="text-gray-700">
                      僅在特定運動禁用，並非全部項目。射箭、射擊為賽內與賽外皆禁用（應比照隨時禁用儘速申請）；其餘特定項目（如高爾夫、飛鏢、部分滑雪／滑雪板項目）僅賽內禁用。
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      申請時程依該運動屬「賽內外皆禁」或「僅賽內禁」而定，請對照最新版禁用清單
                      P1 適用運動。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  特殊情況申請
                </h3>
                <p className="text-gray-700 mb-4">
                  下列「特殊情況」得於使用後提出回溯性申請或申請截止日期後提出，但仍須符合所有核可條件：
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">緊急醫療</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      無充足時間於接受藥檢前提出申請
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      非國家級運動員接受檢測
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      於賽外使用「賽內禁用物質」
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg mr-4">
                <HelpCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  審查時程
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      審查結果原則上將於收到完整申請資料起21個日曆天(calendar
                      days)內通知
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      因特殊情況於賽事前30天後申請時，如距賽事少於21天，不保證於賽事前完成審查
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      非國家級運動員：任何情況皆無須於使用前申請，如出現不利檢測報告時，可提出回溯性TUE申請
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Guide Tab */}
      {activeTab === "application" && (
        <div className="space-y-6">
          {/* Who Needs to Apply */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">
                誰需要申請TUE？
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-blue-300 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">申請對象</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• 國際級運動員：向國際單項運動總會申請</li>
                  <li>• 國家級運動員：向所屬反禁藥組織申請</li>
                  <li>• 國際賽事：向賽事組織委員會申請</li>
                  <li>• 業餘運動員：可申請回溯性TUE</li>
                </ul>
              </div>
              <div className="border-l-4 border-green-300 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">申請時機</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• 原則上：使用禁用物質前申請</li>
                  <li>• 至少比賽前30天提出申請</li>
                  <li>• 緊急醫療情況可事後申請</li>
                  <li>• 審查委員會21個日曆天內回覆</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">申請流程步驟</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    醫療診斷確認
                  </h4>
                  <p className="text-gray-700 mb-3">
                    由合格醫師進行完整診斷，確認需要使用禁用物質或方法
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      所需文件:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 詳細病史記錄</li>
                      <li>• 相關檢驗報告</li>
                      <li>• 醫師診斷證明</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    填寫申請表格
                  </h4>
                  <p className="text-gray-700 mb-3">
                    運動員與醫師共同完成TUE申請表，提供詳細醫療資訊
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      申請表內容包含:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 運動員基本資料</li>
                      <li>• 醫療診斷說明</li>
                      <li>• 治療方案詳述</li>
                      <li>• 醫師專業意見</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    提交申請文件
                  </h4>
                  <p className="text-gray-700 mb-3">
                    向適當的審查機構提交完整申請文件
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold">4</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    等待審查結果
                  </h4>
                  <p className="text-gray-700">
                    審查委員會將在21個日曆天內完成審查並通知結果
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Retroactive Applications */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">回溯性TUE申請</h3>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium mb-2">
                以下情況可申請回溯性TUE：
              </p>
              <ul className="text-red-700 space-y-1">
                <li>• 緊急醫療治療情況</li>
                <li>• 來不及事前申請的急性疾病</li>
                <li>• 非國際級或國家級運動員</li>
                <li>• 賽外期間使用僅在比賽時禁用的物質</li>
              </ul>
            </div>
            <p className="text-gray-700">
              <strong>重要提醒：</strong>
              回溯性TUE僅在特殊情況下被接受，不應作為常規申請方式。
            </p>
          </div>
        </div>
      )}

      {/* Disease Guides Tab */}
      {activeTab === "diseases" && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              運動員TUE疾病建議
            </h3>
            <p className="text-blue-800 text-sm">
              列出各項病症於申請TUE（治療用藥豁免）時應檢附的資料，建議運動員與醫師共同評估申請的必要性，以確保符合
              TUE 國際標準，相關檢查表自財團法人中華運動禁藥防制基金會連結下載。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ADHD */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">
                    專注力失調及過度活躍症 (ADHD)
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      哌醋甲酯 (Methylphenidate)
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      安非他命衍生物 (Amphetamine derivatives)
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_ADHD.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2023-12/tue_physician_guidelines_adhd_-_version_7.1_-_october_2023.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Adrenal Insufficiency */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">腎上腺機能不全</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    糖化皮質類固醇和礦物質皮質類固醇
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Adrenal-insufficiency.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_adrenal_insufficiency_6.0_0.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Anaphylaxis */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">過敏性休克</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    糖化皮質類固醇
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Anaphylaxis.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_anaphylaxis_version3.0.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Asthma */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">氣喘</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    乙二型擬交感作用劑 (Beta-2-agonists)
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://drive.google.com/file/d/1Rjj4UUwNOreLpdyicLfucNf4kHQPHzvz/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2023-02/tue_physician_guidelines_asthma_february_2023.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Cardiovascular Conditions */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">心血管疾病</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    乙型交感神經阻斷劑 (Beta-blockers)
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Cardiovascular-conditions.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_cardiovascularbetablockers_version2.2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Diabetes */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">糖尿病</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    胰島素 (Insulin)
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Diabetes.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_diabetes_version4.2_en.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* IBD */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">發炎性大腸疾病</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    糖化皮質類固醇
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Inflammatory-Bowel-Disease.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_inflammatory_bowel_final_november_2021.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* IV Infusions */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Download className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">靜脈輸注</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質/方法
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    容量 &gt; 每12小時100毫升
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Intravenous-infusions.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2023-10/tue_physician_guidelines_iv_infusion_october_2023.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Male Hypogonadism */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Users className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">男性性腺功能低下症</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      睪固酮
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      人類絨毛膜性腺激素
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Male-Hypogonadism.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2023-03/tue_physician_guidelines_male_hypogonadism_march_2023.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Musculoskeletal */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">骨骼肌肉問題</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      全身性糖化皮質類固醇
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      麻醉劑
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Musculoskeletal-conditions.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2023-10/tue_physician_guidelines_-_musculoskeletal_conditions_-_version_5.1_october_2023_2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Neuropathic Pain */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">神經病變痛</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      麻醉劑
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      大麻
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Neuropathic-pain.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_neuropathicpain_version2.0.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Renal Transplantation */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">腎臟移植</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      全身性糖化皮質類固醇、EPO
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      利尿劑、β阻斷劑、HIF抑制劑
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Renal-transplantation.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/wada_tpg_renal_transplantation_3.0_en.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Sinusitis */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Search className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">鼻竇炎</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      偽麻黃鹼
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      糖化皮質類固醇
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Sinusitis.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_sinusitis_rhinosinusitis_final_november_2021.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Sleep Disorders */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Clock className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">內因性睡眠障礙</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    興奮劑
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Sleep-disorder-Intrinsic.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_intrinsicsleepdisorder_version4.0.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Transgender Athletes */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Users className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">跨性別運動員</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      睪固酮
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      螺內酯
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Transgender-Athletes.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2022-01/TUE%20Physician%20Guidelines_Transgender%20Athletes_Final%20%28January%202022%29.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Female Infertility */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Users className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">女性不孕症</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      clomiphene
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      letrozole
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/女性不孕症（Female-Infertility）_female_infertility_final_november_2021.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_female_infertility_final_november_2021.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* GHD */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">生長激素不足 (GHD)</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    生長激素
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/生長激素不足GHD_growth_hormone_deficiency_child_and_adult_final_november_2022.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2022-11/tue_physician_guidelines_growth_hormone_deficiency_children_and_adolescent_final_november_2022_0.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* PCOS */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Users className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">多囊性卵巢症候群</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      clomiphene
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      letrozole
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/PCOS_pcos_final_november_2021.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_pcos_final_november_2021.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Pain Management */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">疼痛管理</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      麻醉劑 (賽內禁用)
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      大麻素
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/TUE申請檢查表_pain_management_december_2021.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2022-01/tue_physician_guidelines_pain_management.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>

            {/* Kidney Failure */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">腎衰竭和腎臟移植</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    禁用物質
                  </h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      糖化皮質類固醇、EPO、利尿劑
                    </span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      β阻斷劑、HIF抑制劑
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/TUE申請檢查表_Kidney-Failure-and-Kidney-Transplantation.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center"
                  >
                    下載檢查表
                  </a>
                  <a
                    href="https://www.wada-ama.org/sites/default/files/2023-07/tue_physician_guideline_kidney_failure_and_kidney_transplantation_final.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center"
                  >
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === "tools" && (
        <div className="space-y-6">
          {/* P1-10 藥物 TUE 快速查詢（資料來源：/api/tue/check，單一來源 substances.json） */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Search className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">
                藥物 TUE 快速查詢
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              輸入藥物名稱（中英文皆可，如 salbutamol、胰島素、利他能），查詢
              WADA 分類與是否需要 TUE。
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={drugCheckQuery}
                onChange={(e) => setDrugCheckQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDrugCheck()}
                placeholder="輸入藥物名稱後按查詢"
                aria-label="藥物名稱"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleDrugCheck}
                disabled={drugCheckLoading || !drugCheckQuery.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {drugCheckLoading ? "查詢中…" : "查詢"}
              </button>
            </div>

            {drugCheckError && (
              <p className="mt-3 text-sm text-red-600">{drugCheckError}</p>
            )}

            {drugCheckResult &&
              !drugCheckError &&
              (() => {
                const verdict = checkResultVerdict(drugCheckResult);
                const meta = VERDICT_META[verdict];
                const style = VERDICT_STYLE[meta.tone];
                const { Icon } = style;
                return (
                  <div
                    className={`mt-4 rounded-lg border p-4 ${style.box}`}
                    role="status"
                  >
                    <div
                      className={`flex items-center font-bold ${style.text}`}
                    >
                      <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
                      {drugCheckResult.displayName || drugCheckResult.drugName}
                      <span className="ml-2">— {meta.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      分類：{drugCheckResult.wadaCategory}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {drugCheckResult.explanation}
                    </p>
                  </div>
                );
              })()}
          </div>

          {/* P1-11 多步決策工具（途徑 × 賽內外 × 運動項目） */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Pill className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">
                這個藥要不要 TUE？— 多步決策工具
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              依「給藥途徑 × 賽內／賽外 ×
              運動項目」逐步判定。同一藥物在不同條件下結果可能不同（如糖皮質激素賽內注射需
              TUE、吸入允許）。
            </p>

            {substancesError && (
              <p className="text-sm text-red-600">{substancesError}</p>
            )}
            {!substances && !substancesError && (
              <p className="text-sm text-gray-500">載入物質清單中…</p>
            )}

            {substances && (
              <div className="space-y-4">
                {/* 步驟 1：選藥物 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    選擇藥物
                  </label>
                  <select
                    value={decisionKey}
                    onChange={(e) => handleDecisionDrugChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">請選擇藥物</option>
                    {Object.entries(substances)
                      .sort((a, b) =>
                        a[1].displayName.localeCompare(
                          b[1].displayName,
                          "zh-Hant",
                        ),
                      )
                      .map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.displayName}（{info.categoryLabel}）
                        </option>
                      ))}
                  </select>
                </div>

                {/* 步驟 2：給藥途徑（僅有途徑差異的藥顯示） */}
                {decisionSubstance && decisionRoutes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      給藥途徑
                    </label>
                    <select
                      value={decisionRoute}
                      onChange={(e) => setDecisionRoute(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">請選擇給藥途徑</option>
                      {decisionRoutes.map((rk) => (
                        <option key={rk} value={rk}>
                          {ROUTE_LABELS[rk] || rk}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 步驟 3：賽內／賽外（僅賽內或全時段禁用的藥顯示） */}
                {decisionSubstance &&
                  requiresCompetitionContext(decisionSubstance) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        使用時機（賽內／賽外）
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDecisionInComp(true)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium border transition ${
                            decisionInComp
                              ? "bg-primary-600 text-white border-primary-600"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          賽內（比賽期間）
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecisionInComp(false)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium border transition ${
                            !decisionInComp
                              ? "bg-primary-600 text-white border-primary-600"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          賽外（訓練期間）
                        </button>
                      </div>
                    </div>
                  )}

                {/* 步驟 4：運動項目（僅 P1 Beta 阻斷劑顯示） */}
                {decisionSubstance && requiresSport(decisionSubstance) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      運動項目
                    </label>
                    <select
                      value={decisionSport}
                      onChange={(e) => setDecisionSport(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">請選擇運動項目</option>
                      {(decisionSubstance.sportRestricted || []).map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                      <option value="其他運動項目">
                        其他運動項目（非精準運動）
                      </option>
                    </select>
                  </div>
                )}

                {/* 判定結果 */}
                {decisionResult && (
                  <div
                    className={`rounded-lg border p-4 ${VERDICT_STYLE[VERDICT_META[decisionResult.verdict].tone].box}`}
                    role="status"
                  >
                    {(() => {
                      const meta = VERDICT_META[decisionResult.verdict];
                      const style = VERDICT_STYLE[meta.tone];
                      const { Icon } = style;
                      return (
                        <div
                          className={`flex items-center font-bold text-lg ${style.text}`}
                        >
                          <Icon className="h-6 w-6 mr-2 flex-shrink-0" />
                          {meta.label}
                        </div>
                      );
                    })()}
                    <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                      {decisionResult.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                    {decisionResult.threshold && (
                      <p className="mt-2 text-sm font-medium text-gray-800">
                        閾值：{decisionResult.threshold}
                      </p>
                    )}
                    {decisionResult.washout && (
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        停藥（washout）參考：{decisionResult.washout}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 border-t pt-3">
                  本工具僅供教育參考，實際比賽用藥合規性請以 WADA 官方禁用清單與{" "}
                  <a
                    href="https://www.globaldro.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 underline"
                  >
                    Global DRO
                  </a>{" "}
                  查詢，並諮詢醫療與反禁藥專業人員。
                </p>
              </div>
            )}
          </div>

          {/* Application Checklist */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">
                TUE申請檢查清單
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  aria-label="確認醫療診斷"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">確認醫療診斷</p>
                  <p className="text-sm text-gray-600">
                    由合格醫師進行完整診斷，確認醫療需求
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  aria-label="準備醫療文件"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">準備醫療文件</p>
                  <p className="text-sm text-gray-600">
                    收集病史、檢驗報告及醫師診斷證明
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  aria-label="評估替代治療"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">評估替代治療</p>
                  <p className="text-sm text-gray-600">
                    確認沒有其他獲准的替代治療方法
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  aria-label="完成申請表格"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">完成申請表格</p>
                  <p className="text-sm text-gray-600">
                    與醫師共同填寫詳細的TUE申請表
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  aria-label="確認申請對象"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">確認申請對象</p>
                  <p className="text-sm text-gray-600">
                    向正確的審查機構提出申請
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  aria-label="提前申請時間"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">提前申請時間</p>
                  <p className="text-sm text-gray-600">
                    至少在比賽前30天提出申請
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Resources */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <ExternalLink className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">重要資源連結</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.antidoping.org.tw/faq/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">
                    中華運動禁藥防制基金會 FAQ
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  完整的TUE申請指南與常見問題
                </p>
              </a>

              <a
                href="https://www.wada-ama.org/en/prohibited-list"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-900">WADA禁用清單</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  最新的世界反禁藥機構禁用物質清單
                </p>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TUE;
