import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  ChevronRight,
  Stethoscope,
  ShieldAlert,
  FileSearch,
  Calculator
} from 'lucide-react';
import { educationAPI } from '../services/api';

function Education() {
  const [activeTab, setActiveTab] = useState('substances');
  const [wadaCategories, setWadaCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [medicalSpecialties, setMedicalSpecialties] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEducationalContent();
  }, []);

  const loadEducationalContent = async () => {
    setLoading(true);
    try {
      const response = await educationAPI.getAll();
      
      setWadaCategories(response.data.substances || []);
      // 隨機選擇5題測驗
      const allQuizzes = response.data.quizzes || [];
      const selectedQuizzes = allQuizzes.sort(() => Math.random() - 0.5).slice(0, 5);
      setQuizzes(selectedQuizzes);
      setMedicalSpecialties(response.data.specialties || []);
    } catch (error) {
      console.error('Failed to load educational content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuizData = quizzes[currentQuiz];
    const isCorrect = selectedAnswer === currentQuizData.correctAnswer;
    
    setQuizResult({
      correct: isCorrect,
      correctAnswer: currentQuizData.correctAnswer,
      explanation: currentQuizData.explanation
    });
    
    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }
  };

  const nextQuiz = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setQuizResult(null);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setSelectedAnswer(null);
    setQuizResult(null);
    setQuizScore(0);
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
        <p className="text-gray-600">學習運動禁藥相關知識，提升反禁藥意識</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('substances')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'substances'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          禁藥知識
        </button>
        <button
          onClick={() => setActiveTab('commonMistakes')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'commonMistakes'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          常見誤區
        </button>
        <button
          onClick={() => setActiveTab('caseLearning')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'caseLearning'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          案例學習
        </button>
        <button
          onClick={() => setActiveTab('riskAssessment')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'riskAssessment'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          風險評估
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'quiz'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          互動測驗
        </button>
        <button
          onClick={() => setActiveTab('specialties')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'specialties'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          各科專區
        </button>
      </div>

      {/* WADA Categories Tab */}
      {activeTab === 'substances' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wadaCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                    <h4 className="font-semibold text-gray-900 mb-2">作用機制</h4>
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

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto">
          {currentQuiz < quizzes.length ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    問題 {currentQuiz + 1} / {quizzes.length}
                  </h3>
                  <div className="text-sm text-gray-600">
                    得分: {quizScore} / {currentQuiz + (quizResult ? 1 : 0)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuiz + 1) / quizzes.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {quizzes[currentQuiz].question}
                </h2>
                
                <div className="space-y-3">
                  {quizzes[currentQuiz].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !quizResult && setSelectedAnswer(index)}
                      disabled={quizResult !== null}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedAnswer === index
                          ? quizResult
                            ? quizResult.correct && quizResult.correctAnswer === index
                              ? 'border-green-500 bg-green-50'
                              : quizResult.correctAnswer === index
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-primary-500 bg-primary-50'
                          : quizResult && quizResult.correctAnswer === index
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {quizResult && (
                          <>
                            {quizResult.correctAnswer === index && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {selectedAnswer === index && !quizResult.correct && (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {quizResult && (
                <div className={`p-4 rounded-lg mb-6 ${
                  quizResult.correct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
                }`}>
                  <p className={`font-semibold mb-2 ${
                    quizResult.correct ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    {quizResult.correct ? '✅ 答對了！' : '❌ 答錯了'}
                  </p>
                  <p className="text-gray-700 text-sm">{quizResult.explanation}</p>
                </div>
              )}

              <div className="flex justify-between">
                {!quizResult ? (
                  <button
                    onClick={handleQuizAnswer}
                    disabled={selectedAnswer === null}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    提交答案
                  </button>
                ) : currentQuiz < quizzes.length - 1 ? (
                  <button
                    onClick={nextQuiz}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center"
                  >
                    下一題
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-12 w-12 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">測驗完成！</h2>
                <p className="text-gray-600">
                  您的得分：<span className="text-3xl font-bold text-primary-600 mx-2">{quizScore}</span>/ {quizzes.length}
                </p>
              </div>
              
              <div className="mb-6">
                <div className="text-5xl mb-2">
                  {quizScore === quizzes.length ? '🏆' : quizScore >= quizzes.length * 0.7 ? '🥈' : '💪'}
                </div>
                <p className="text-gray-700">
                  {quizScore === quizzes.length 
                    ? '太棒了！全部答對！' 
                    : quizScore >= quizzes.length * 0.7 
                    ? '表現不錯，繼續加油！' 
                    : '還有進步空間，再試一次吧！'}
                </p>
              </div>
              
              <button
                onClick={resetQuiz}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                重新測驗
              </button>
            </div>
          )}
        </div>
      )}

      {/* Common Mistakes Tab */}
      {activeTab === 'commonMistakes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "感冒藥",
              mistake: "我只是吃感冒藥，不可能含有禁藥",
              fact: "許多感冒藥含有偽麻黃鹼（興奮劑），可能導致陽性反應",
              prevention: "選手應使用不含禁藥成分的藥物，用藥前諮詢團隊醫師",
              severity: "high"
            },
            {
              title: "營養補充品",
              mistake: "天然營養品應該很安全",
              fact: "營養補充品可能受到污染或含有未標示的禁藥成分",
              prevention: "只使用經過第三方檢驗認證的產品",
              severity: "high"
            },
            {
              title: "TUE申請時機",
              mistake: "可以先用藥，之後再申請TUE",
              fact: "TUE必須在用藥前申請並獲得批准（緊急情況除外）",
              prevention: "提前了解並規劃TUE申請流程",
              severity: "medium"
            },
            {
              title: "中藥與草藥",
              mistake: "中藥是天然的，不會有問題",
              fact: "部分中藥含有禁藥成分或受到西藥成分污染",
              prevention: "避免使用來源不明的中藥，必要時進行檢測",
              severity: "high"
            },
            {
              title: "靜脈輸液",
              mistake: "生病脫水打點滴很正常",
              fact: "靜脈輸液超過100ml在12小時內是禁止的",
              prevention: "了解靜脈輸液的規定，必要時申請TUE",
              severity: "medium"
            },
            {
              title: "賽外檢測",
              mistake: "非比賽期間可以放鬆用藥",
              fact: "許多物質在賽外期間也是禁止的（如合成代謝類固醇）",
              prevention: "全年遵守反禁藥規定，定期更新行蹤資料",
              severity: "high"
            }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className={`p-4 ${
                item.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
              } text-white`}>
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

      {/* Case Learning Tab */}
      {activeTab === 'caseLearning' && (
        <div className="space-y-6">
          {[
            {
              athlete: "莎拉波娃 (Maria Sharapova)",
              year: 2016,
              sport: "網球",
              substance: "Meldonium",
              lesson: "禁藥清單每年更新，運動員有責任了解最新規定",
              consequence: "禁賽15個月",
              keyPoints: [
                "Meldonium於2016年1月加入禁藥清單",
                "運動員聲稱不知道藥物已被禁用",
                "強調定期檢查禁藥清單的重要性"
              ]
            },
            {
              athlete: "孫楊",
              year: 2020,
              sport: "游泳",
              substance: "拒絕藥檢",
              lesson: "配合藥檢是運動員的基本義務，拒絕檢測等同使用禁藥",
              consequence: "禁賽4年3個月",
              keyPoints: [
                "破壞血液樣本導致無法檢測",
                "質疑檢測人員資格不是拒絕檢測的理由",
                "程序問題應事後申訴而非當場拒絕"
              ]
            },
            {
              athlete: "班強森 (Ben Johnson)",
              year: 1988,
              sport: "田徑",
              substance: "Stanozolol",
              lesson: "使用合成代謝類固醇的嚴重後果",
              consequence: "剝奪奧運金牌，終身禁賽",
              keyPoints: [
                "奧運史上最大醜聞之一",
                "促進了更嚴格的藥檢制度",
                "對運動生涯的毀滅性影響"
              ]
            }
          ].map((caseItem, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {caseItem.athlete}
                  </h3>
                  <p className="text-gray-600">
                    {caseItem.sport} • {caseItem.year}年
                  </p>
                </div>
                <FileSearch className="h-8 w-8 text-primary-600" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">違規物質/行為</h4>
                  <p className="text-red-700">{caseItem.substance}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">處罰結果</h4>
                  <p className="text-amber-700">{caseItem.consequence}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-primary-600" />
                  關鍵教訓
                </h4>
                <p className="text-gray-700 bg-primary-50 p-3 rounded-lg font-medium">
                  {caseItem.lesson}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">要點分析</h4>
                <ul className="space-y-2">
                  {caseItem.keyPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start text-gray-700">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Assessment Tab */}
      {activeTab === 'riskAssessment' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Calculator className="h-8 w-8 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">用藥風險評估工具</h2>
              </div>
              <p className="text-gray-600">
                回答以下問題，評估您的用藥風險等級
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  question: "您是否定期檢查WADA禁藥清單更新？",
                  options: ["每年檢查", "偶爾檢查", "從未檢查"],
                  weights: [0, 1, 3]
                },
                {
                  question: "使用藥物或補充品前，是否諮詢專業人員？",
                  options: ["總是諮詢", "有時諮詢", "很少諮詢"],
                  weights: [0, 1, 3]
                },
                {
                  question: "您使用的營養補充品是否有第三方認證？",
                  options: ["全部都有", "部分有", "都沒有或不確定"],
                  weights: [0, 2, 4]
                },
                {
                  question: "是否了解TUE申請流程？",
                  options: ["完全了解", "部分了解", "不了解"],
                  weights: [0, 1, 2]
                },
                {
                  question: "是否保留所有用藥記錄？",
                  options: ["詳細記錄", "部分記錄", "沒有記錄"],
                  weights: [0, 1, 3]
                }
              ].map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {index + 1}. {item.question}
                  </h3>
                  <div className="space-y-2">
                    {item.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          className="mr-3 text-primary-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                計算風險等級
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">風險等級說明</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• 低風險（0-3分）：良好的反禁藥意識</p>
                <p>• 中風險（4-8分）：需要加強某些方面</p>
                <p>• 高風險（9分以上）：建議立即改善用藥管理</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Specialties Tab */}
      {activeTab === 'specialties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              specialty: "精神科 / 神經科",
              icon: "🧠",
              description: "處理精神疾病和神經系統疾病相關的用藥需求",
              conditions: [
                {
                  disease: "專注力失調及過度活躍症 (ADHD)",
                  substances: ["哌醋甲酯 (Methylphenidate)", "安非他命衍生物 (Amphetamine derivatives)"],
                  category: "S6: 興奮劑",
                  notes: "需要申請TUE，詳細記錄治療必要性和劑量",
                  alternatives: "非藥物治療：行為療法、認知行為治療、生活型態調整"
                },
                {
                  disease: "內因性睡眠障礙 (Intrinsic Sleep Disorders)",
                  substances: ["興奮劑 (Stimulants)"],
                  category: "S6: 興奮劑",
                  notes: "須評估治療必要性，避免影響比賽表現",
                  alternatives: "睡眠衛生、光照治療、褪黑激素療法"
                }
              ]
            },
            {
              specialty: "內分泌科",
              icon: "⚗️",
              description: "內分泌系統疾病的荷爾蒙替代治療",
              conditions: [
                {
                  disease: "腎上腺機能不全 (Adrenal Insufficiency)",
                  substances: ["糖化皮質類固醇", "礦物質皮質類固醇"],
                  category: "S9: 糖皮質激素",
                  notes: "生命必須治療，需要醫療緊急證明",
                  alternatives: "無替代治療，為生命必需用藥"
                },
                {
                  disease: "糖尿病 (Diabetes)",
                  substances: ["胰島素 (Insulin)"],
                  category: "允許使用",
                  notes: "胰島素不在禁藥清單中，但需注意血糖監控",
                  alternatives: "口服降血糖藥物、飲食控制"
                },
                {
                  disease: "男性性腺功能低下症候群 (Male Hypogonadism)",
                  substances: ["睪固酮 (Testosterone)", "人類絨毛膜性腺激素 (hCG)"],
                  category: "S1: 合成代謝劑 / S2: 促紅血球生成素類",
                  notes: "需要嚴格的TUE申請和監控",
                  alternatives: "生活型態改善、營養補充、克洛米芬治療"
                },
                {
                  disease: "生長激素不足 (GHD)",
                  substances: ["生長激素 (Growth Hormone)"],
                  category: "S2: 生長激素",
                  notes: "成人和兒童轉換期需要特別評估",
                  alternatives: "營養支持、運動治療（需醫師評估）"
                }
              ]
            },
            {
              specialty: "內科 / 急診 / 各科",
              icon: "🏥",
              description: "一般內科和急診常見的禁藥使用情況",
              conditions: [
                {
                  disease: "過敏性休克 (Anaphylaxis)",
                  substances: ["糖化皮質類固醇 (Glucocorticoids)"],
                  category: "S9: 糖皮質激素",
                  notes: "緊急救命用藥，可事後申請追認TUE",
                  alternatives: "無替代治療，為緊急救命用藥"
                },
                {
                  disease: "靜脈輸注 (Intravenous Infusions)",
                  substances: ["容量 > 每12小時100毫升"],
                  category: "M2: 化學和物理操作",
                  notes: "超過100ml/12小時需要TUE申請",
                  alternatives: "口服補充、少量分次靜脈注射"
                },
                {
                  disease: "疼痛管理 (Pain Management)",
                  substances: ["麻醉劑 (Narcotics)", "大麻 (Cannabinoids)"],
                  category: "S7: 麻醉劑 / S8: 大麻類",
                  notes: "需要詳細疼痛評估和治療計畫",
                  alternatives: "非類鴉片止痛劑、物理治療、針灸"
                }
              ]
            },
            {
              specialty: "骨科 / 復健 / 疼痛",
              icon: "🦴",
              description: "骨骼肌肉系統疾病的治療用藥",
              conditions: [
                {
                  disease: "骨骼肌肉問題 (Musculoskeletal Conditions)",
                  substances: ["全身性糖化皮質類固醇", "麻醉劑 (Narcotics)"],
                  category: "S9: 糖皮質激素 / S7: 麻醉劑",
                  notes: "局部注射較全身性用藥風險低",
                  alternatives: "物理治療、局部注射、非類固醇抗發炎藥"
                },
                {
                  disease: "神經病變痛 (Neuropathic Pain)",
                  substances: ["麻醉劑 (Narcotics)", "大麻 (Cannabinoids)"],
                  category: "S7: 麻醉劑 / S8: 大麻類",
                  notes: "需要神經科專科醫師評估",
                  alternatives: "抗癲癇藥物、抗憂鬱藥物、神經阻斷術"
                }
              ]
            },
            {
              specialty: "胸腔科 / 心臟科",
              icon: "❤️",
              description: "呼吸系統和心血管疾病相關用藥",
              conditions: [
                {
                  disease: "氣喘 (Asthma)",
                  substances: ["乙二型擬交感作用劑 (Beta-2-agonists)"],
                  category: "S3: Beta-2激動劑",
                  notes: "吸入型通常允許，口服或注射型需TUE",
                  alternatives: "吸入型類固醇、白三烯受體拮抗劑"
                },
                {
                  disease: "心血管疾病 (Cardiovascular Conditions)",
                  substances: ["乙型交感神經阻斷劑 (Beta-blockers)"],
                  category: "P1: Beta阻斷劑",
                  notes: "特定運動項目禁用（射箭、撞球等）",
                  alternatives: "鈣通道阻斷劑、ACE抑制劑、生活型態調整"
                }
              ]
            },
            {
              specialty: "腸胃科 / 腎臟科",
              icon: "🫁",
              description: "消化系統和泌尿系統疾病治療",
              conditions: [
                {
                  disease: "發炎性大腸疾病 (IBD)",
                  substances: ["糖化皮質類固醇 (Glucocorticoids)"],
                  category: "S9: 糖皮質激素",
                  notes: "需要腸胃科專科醫師診斷證明",
                  alternatives: "5-ASA類藥物、免疫調節劑、生物製劑"
                },
                {
                  disease: "腎臟移植 / 腎衰竭",
                  substances: ["全身性糖化皮質類固醇", "紅血球生成素 (EPO)", "利尿劑", "乙型阻斷劑"],
                  category: "多重分類",
                  notes: "移植患者需要綜合評估，多重用藥TUE申請",
                  alternatives: "需要腎臟科醫師個別評估"
                }
              ]
            },
            {
              specialty: "耳鼻喉科",
              icon: "👂",
              description: "耳鼻喉相關疾病的治療用藥",
              conditions: [
                {
                  disease: "鼻竇炎 (Sinusitis/Rhinosinusitis)",
                  substances: ["偽麻黃鹼 (Pseudoephedrine)", "糖化皮質類固醇"],
                  category: "S6: 興奮劑 / S9: 糖皮質激素",
                  notes: "偽麻黃鹼在尿液濃度>150μg/mL時違規",
                  alternatives: "鼻腔沖洗、局部血管收縮劑、抗組織胺"
                }
              ]
            },
            {
              specialty: "婦產科",
              icon: "🤱",
              description: "女性生殖系統疾病相關治療",
              conditions: [
                {
                  disease: "女性不孕症 (Female Infertility)",
                  substances: ["clomiphene", "letrozole"],
                  category: "S4.4: 代謝調節劑",
                  notes: "需要生殖醫學專科醫師診斷和追蹤",
                  alternatives: "生活型態調整、手術治療、輔助生殖技術"
                },
                {
                  disease: "多囊性卵巢症候群 (PCOS)",
                  substances: ["clomiphene", "letrozole"],
                  category: "S4.4: 代謝調節劑",
                  notes: "需要內分泌科或婦產科醫師長期追蹤",
                  alternatives: "metformin、生活型態調整、手術治療"
                }
              ]
            }
          ].map((specialty, index) => (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{specialty.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{specialty.specialty}</h3>
                    <p className="text-sm text-gray-600">{specialty.description}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {specialty.conditions.map((condition, condIndex) => (
                    <div key={condIndex} className="border-l-4 border-primary-200 pl-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 mb-1">{condition.disease}</h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {condition.substances.map((substance, subIndex) => (
                            <span key={subIndex} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
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
                          建議替代方案
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
  );
}

export default Education;