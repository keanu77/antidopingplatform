import { useState, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
  ShieldAlert,
  FileSearch,
  Calculator,
  Scale,
  Gavel,
  ListChecks,
  Award,
  Sparkles,
} from "lucide-react";
import { educationAPI, casesAPI } from "../services/api";
import { Link } from "react-router-dom";
import CaseReviewNotice from "../components/CaseReviewNotice";
import SupplementsTab from "../components/education/SupplementsTab";
import TopicTabs from "../components/TopicTabs";
import useTopicTab from "../utils/useTopicTab";

const TABS = [
  { id: "substances", label: "禁藥知識" },
  { id: "commonMistakes", label: "常見誤區" },
  { id: "violationTypes", label: "違規類型" },
  { id: "supplements", label: "補充劑安全" },
  { id: "caseLearning", label: "案例學習" },
  { id: "specialties", label: "各科專區" },
];

const LEARNING_CASE_IDS = ["3", "8", "26", "48", "sun-yang-2018", "sia-peter-bol-2023"];

function Education() {
  const [activeTab, setActiveTab] = useTopicTab(TABS.map(tab => tab.id), "substances");
  const [wadaCategories, setWadaCategories] = useState([]);
  const [medicalSpecialties, setMedicalSpecialties] = useState([]);
  const [adrv, setAdrv] = useState(null);
  const [adrvLoading, setAdrvLoading] = useState(true);
  const [adrvError, setAdrvError] = useState(null);
  const [adrvRetryCount, setAdrvRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [learningCases, setLearningCases] = useState([]);
  const [learningError, setLearningError] = useState(false);

  useEffect(() => {

    loadEducationalContent();
  }, []);

  useEffect(() => {
    let active = true;
    setAdrvLoading(true);
    setAdrvError(null);
    educationAPI.getAdrv()
      .then((response) => {
        if (active) setAdrv(response.data);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to load ADRV content:", error);
        setAdrvError("載入違規類型失敗，請檢查網路連線後再試。");
      })
      .finally(() => {
        if (active) setAdrvLoading(false);
      });
    return () => { active = false; };
  }, [adrvRetryCount]);

  useEffect(() => {
    if (activeTab !== "caseLearning") return;
    let active = true;
    Promise.all(LEARNING_CASE_IDS.map(id => casesAPI.getById(id)))
      .then(responses => {
        if (active) {
          setLearningCases(responses.map(response => response.data));
          setLearningError(false);
        }
      })
      .catch(() => { if (active) setLearningError(true); });
    return () => { active = false; };
  }, [activeTab]);

  const loadEducationalContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await educationAPI.getAll();

      setWadaCategories(response.data.substances || []);
      setMedicalSpecialties(response.data.specialties || []);
    } catch (error) {
      console.error("Failed to load educational content:", error);
      setError("載入教育內容失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }

  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">教育專區</h1>
        <p className="text-gray-600">學習運動禁藥相關知識，提升運動禁藥防制意識</p>
        <Link className="inline-block mt-3 text-emerald-800 underline" to="/learning">依選手、教練或醫護角色安排學習</Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
        <p>站內練習提供逐題來源與錯題複習，不核發官方證明。舊 API 題庫 69 題待逐題核對，暫停答案評分。</p>
        <div className="mt-2 flex flex-wrap gap-4"><Link to="/quiz" className="text-primary-700 underline">前往有來源的互動測驗</Link><Link to="/case-learning" className="text-primary-700 underline">30 案教學與證據待辦</Link></div>
      </div>
      <TopicTabs tabs={TABS} active={activeTab} onChange={setActiveTab} prefix="education" label="教育主題" />

      <div role="tabpanel" id="education-panel-substances" aria-labelledby="education-tab-substances" tabIndex={0} hidden={activeTab !== "substances"}>
      {/* WADA Categories Tab */}
      {activeTab === "substances" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wadaCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4">
                <div className="flex items-center text-white">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold">{category.wadaCode}</h3>
                    <p className="text-sm opacity-90">{category.category}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">{category.description}</p>

                {category.mechanism && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      作用機制
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {category.mechanism}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-danger-600" />
                    健康風險
                  </h4>
                  <p className="text-sm text-danger-600 bg-danger-50 p-3 rounded-lg">
                    {category.risks}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">常見例子</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {category.examples}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>

      <div role="tabpanel" id="education-panel-commonMistakes" aria-labelledby="education-tab-commonMistakes" tabIndex={0} hidden={activeTab !== "commonMistakes"}>
      {/* Common Mistakes Tab */}
      {activeTab === "commonMistakes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "感冒藥",
              mistake: "我只是吃感冒藥，不可能含有禁藥",
              fact: "許多感冒藥含有偽麻黃鹼（興奮劑），可能導致陽性反應",
              prevention: "選手應使用不含禁藥成分的藥物，用藥前諮詢團隊醫師",
              severity: "high",
            },
            {
              title: "營養補充品",
              mistake: "天然營養品應該很安全",
              fact: "營養補充品可能受到污染或含有未標示的禁藥成分",
              prevention: "先評估使用必要性；批次檢驗可降低風險，但不能保證零污染",
              severity: "high",
            },
            {
              title: "TUE申請時機",
              mistake: "可以先用藥，之後再申請TUE",
              fact: "通常應事先申請；追溯性申請另有條件，不應把事後補件當成保證",
              prevention: "提前了解並規劃TUE申請流程",
              severity: "medium",
            },
            {
              title: "中藥與草藥",
              mistake: "中藥是天然的，不會有問題",
              fact: "部分中藥含有禁藥成分或受到西藥成分污染",
              prevention: "避免使用來源不明的中藥，必要時進行檢測",
              severity: "high",
            },
            {
              title: "靜脈輸液",
              mistake: "生病脫水打點滴很正常",
              fact: "任何 12 小時超過 100mL 屬 M2.2 規範；合法醫院治療、外科手術與臨床診斷程序有方法例外，物質仍須另查",
              prevention: "了解靜脈輸液的規定，必要時申請TUE",
              severity: "medium",
            },
            {
              title: "賽外檢測",
              mistake: "非比賽期間可以放鬆用藥",
              fact: "許多物質在賽外期間也是禁止的（如合成代謝類固醇）",
              prevention: "全年遵守運動禁藥防制規定，定期更新行蹤資料",
              severity: "high",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div
                className={`p-4 ${
                  item.severity === "high" ? "bg-red-500" : "bg-amber-500"
                } text-white`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    常見誤解
                  </h4>
                  <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                    "{item.mistake}"
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    事實真相
                  </h4>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                    {item.fact}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                    預防建議
                  </h4>
                  <p className="text-gray-700 bg-amber-50 p-3 rounded-lg">
                    {item.prevention}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>

      <div role="tabpanel" id="education-panel-violationTypes" aria-labelledby="education-tab-violationTypes" tabIndex={0} hidden={activeTab !== "violationTypes"}>
      {/* Violation Types (ADRV) Tab */}
      {activeTab === "violationTypes" && (
        <div>
          {adrvLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : adrvError || !adrv ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700" role="alert">
                {adrvError || "目前沒有可顯示的違規類型資料。"}
              </p>
              <button
                type="button"
                onClick={() => setAdrvRetryCount((count) => count + 1)}
                className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                重新載入
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* ADRV 十一類 */}
              <section>
                <div className="flex items-center mb-4">
                  <Scale className="h-6 w-6 mr-2 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    十一類違反運動禁藥管制規則（ADRV）
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  依《世界運動禁藥管制規範》（World Anti-Doping Code 2021）第 2.1–2.11
                  條，違規並不限於「藥檢陽性」，共有十一種型態。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adrv.adrvTypes.map((type) => (
                    <div
                      key={type.code}
                      className="bg-white rounded-lg shadow overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center">
                            <Gavel className="h-5 w-5 mr-2" />
                            <span className="text-lg font-bold">
                              第 {type.code} 條
                            </span>
                          </div>
                          {type.isNew2021 && (
                            <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-semibold rounded-full">
                              2021 新增
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {type.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">
                          {type.nameEn}
                        </p>
                        <p className="text-sm text-gray-700">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 運動精神十二項價值 */}
              <section>
                <div className="flex items-center mb-4">
                  <Sparkles className="h-6 w-6 mr-2 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    運動精神的十二項價值
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  運動禁藥防制的核心是守護「運動精神」（The Spirit of Sport）。2021
                  年版規範新增「運動員權利」，共十二項價值。
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {adrv.spiritValues.map((v) => (
                    <div
                      key={v.valueEn}
                      className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-primary-600 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">
                            {v.value}
                          </span>
                        </div>
                        {v.isNew2021 && (
                          <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-semibold rounded-full flex-shrink-0">
                            2021 新增
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{v.valueEn}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 禁用清單三層結構 */}
              <section>
                <div className="flex items-center mb-4">
                  <ListChecks className="h-6 w-6 mr-2 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    禁用清單的三層結構
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    adrv.listStructure.allTimes,
                    adrv.listStructure.inCompetition,
                    adrv.listStructure.particularSports,
                  ].map((layer, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-semibold rounded-full mb-3">
                        {layer.label}
                      </span>
                      <p className="font-bold text-gray-900 mb-2">
                        {layer.categories}
                      </p>
                      <p className="text-sm text-gray-600">{layer.note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      「賽內」如何認定？
                    </h4>
                    <p className="text-sm text-blue-800">
                      {adrv.listStructure.inCompetitionDefinition}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      </div>

      <div role="tabpanel" id="education-panel-supplements" aria-labelledby="education-tab-supplements" tabIndex={0} hidden={activeTab !== "supplements"}>
      {activeTab === "supplements" && <SupplementsTab />}

      </div>

      <div role="tabpanel" id="education-panel-caseLearning" aria-labelledby="education-tab-caseLearning" tabIndex={0} hidden={activeTab !== "caseLearning"}>
      {/* Case Learning Tab: shares the audited case records and their sources. */}
      {activeTab === "caseLearning" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">從已查核案例認識不同裁決結果，包括違規處分、合法 TUE 與未提出違規指控。</p>
          {learningError && <p role="alert" className="text-red-700">案例載入失敗，請重新切換分頁再試。</p>}
          {!learningError && learningCases.length === 0 && <p role="status">載入案例中…</p>}
          {learningCases.map(caseItem => (
            <div key={caseItem.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{caseItem.athleteName}</h3>
                  <p className="text-gray-600">{caseItem.sport} • {caseItem.year}年</p>
                </div>
                <FileSearch className="h-8 w-8 text-primary-600 shrink-0" />
              </div>
              <CaseReviewNotice review={caseItem.review} compact />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">相關物質／行為</h4>
                  <p className="text-red-700">{caseItem.substance}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">處理結果</h4>
                  <p className="text-amber-700">{caseItem.punishment.banDuration}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{caseItem.eventBackground}</p>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-primary-600" />教學重點
                </h4>
                <p className="text-gray-700 bg-primary-50 p-3 rounded-lg">{caseItem.educationalNotes}</p>
              </div>
              <Link to={`/cases/${caseItem.id}`} className="text-primary-700 underline">閱讀個案與官方來源</Link>
            </div>
          ))}
        </div>
      )}

      </div>

      <div role="tabpanel" id="education-panel-specialties" aria-labelledby="education-tab-specialties" tabIndex={0} hidden={activeTab !== "specialties"}>
      {/* Medical Specialties Tab: use the same reviewed data as the API. */}
      {activeTab === "specialties" && <p className="mb-4 text-sm text-gray-600">用藥選擇須依診斷與病情由醫師決定，請勿自行停藥；替代方向不等於個人治療建議或自動符合運動禁藥防制規定。禁用分類與例外依 <a className="underline text-primary-700" href="https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf" target="_blank" rel="noopener noreferrer">2026 WADA 清單</a>核對。</p>}
      {activeTab === "specialties" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medicalSpecialties.map((specialty) => ({
            ...specialty,
            conditions: specialty.medications.map((medication) => ({
              disease: medication.category,
              substances: medication.substances,
              category: medication.wadaCategory,
              notes: medication.notes,
              alternatives: medication.alternatives,
            })),
          })).map((specialty, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{specialty.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {specialty.specialty}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {specialty.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {specialty.conditions.map((condition, condIndex) => (
                    <div
                      key={condIndex}
                      className="border-l-4 border-primary-200 pl-4"
                    >
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {condition.disease}
                        </h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {condition.substances.map((substance, subIndex) => (
                            <span
                              key={subIndex}
                              className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                            >
                              {substance}
                            </span>
                          ))}
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                          {condition.category}
                        </span>
                      </div>

                      <div className="mb-3">
                        <h5 className="flex items-center text-sm font-semibold text-gray-800 mb-1">
                          <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />
                          注意事項
                        </h5>
                        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-red-400">
                          {condition.notes}
                        </p>
                      </div>

                      <div>
                        <h5 className="flex items-center text-sm font-semibold text-gray-800 mb-1">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          與醫師討論的治療方向
                        </h5>
                        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-green-400">
                          {condition.alternatives}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

    </div>
  );
}

export default Education;
