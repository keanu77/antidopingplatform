import { useState } from 'react';
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
  Calendar
} from 'lucide-react';

function TUE() {
  const [activeTab, setActiveTab] = useState('basic');
  const [drugCheckQuery, setDrugCheckQuery] = useState('');
  const [drugCheckResult, setDrugCheckResult] = useState(null);

  const handleDrugCheck = () => {
    if (!drugCheckQuery.trim()) return;
    
    // 簡單的藥物查詢邏輯（實際應用中應連接到專業資料庫）
    const query = drugCheckQuery.toLowerCase().trim();
    
    const prohibitedDrugs = {
      'methylphenidate': { needsTUE: true, category: 'S6: 興奮劑', explanation: 'ADHD治療用藥，需要申請TUE' },
      'salbutamol': { needsTUE: false, category: 'S3: Beta-2激動劑', explanation: '吸入型允許使用，但有濃度限制' },
      'testosterone': { needsTUE: true, category: 'S1: 合成代謝劑', explanation: '激素替代治療需要嚴格的TUE申請' },
      'insulin': { needsTUE: false, category: '允許使用', explanation: '胰島素不在禁藬清單中' },
      'prednisolone': { needsTUE: true, category: 'S9: 糖皮質激素', explanation: '全身性類固醇需要TUE申請' }
    };
    
    const result = prohibitedDrugs[query] || {
      needsTUE: null,
      explanation: '未找到該藥物資訊，請諮詢醫療專業人員或查詢WADA禁薬清單'
    };
    
    setDrugCheckResult(result);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">治療用途豁免 (TUE) 專區</h1>
        <p className="text-gray-600">了解TUE申請流程、獲取專業指引，確保合規用藥</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'basic'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Info className="h-4 w-4 mr-2 inline" />
          基礎知識
        </button>
        <button
          onClick={() => setActiveTab('application')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'application'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UserCheck className="h-4 w-4 mr-2 inline" />
          申請指引
        </button>
        <button
          onClick={() => setActiveTab('diseases')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'diseases'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Stethoscope className="h-4 w-4 mr-2 inline" />
          疾病分類
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'tools'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search className="h-4 w-4 mr-2 inline" />
          實用工具
        </button>
      </div>

      {/* Basic Knowledge Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg mr-4">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">什麼是TUE？</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  運動員如因治療病症而必須使用到禁用清單上的禁用物質或方法時，須申請治療用途豁免（Therapeutic Use Exemption, TUE），申請案件將由醫師組成的TUE審查委員會進行審查。運動員取得TUE核可後方得使用該禁用物質或方法，而不受違反運動禁藥管制規則之處分。
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">TUE可查詢來源</h4>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">TUE核准標準</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  以下核可條件皆須符合，方能取得核可：
                </p>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">1. 清楚的醫療診斷</h4>
                    <p className="text-gray-700">運動員有清楚的醫療診斷，治療該疾病/症狀必須使用禁用物質或方法</p>
                  </div>
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">2. 不會重大提升運動表現</h4>
                    <p className="text-gray-700">治療用的物質或方法將不會重大地提升運動員表現，使其超出正常健康狀況下之運動表現</p>
                  </div>
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">3. 無其他合理替代方法</h4>
                    <p className="text-gray-700">除了該禁用物質或方法之外，沒有其他合理可行的治療替代方法</p>
                  </div>
                  <div className="border-l-4 border-green-300 pl-4">
                    <h4 className="font-semibold text-gray-900">4. 非基於先前違規使用</h4>
                    <p className="text-gray-700">必須使用該禁用物質或方法的原因，不得為用於治療先前違規使用禁用物質或方法所致之疾患</p>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">申請對象分類</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">國際級運動員</h4>
                    <p className="text-gray-700 text-sm mb-2">向國際單項運動總會申請</p>
                    <p className="text-gray-600 text-xs">常見包含：需填報行蹤之TP/RTP運動員、參與總會舉辦特定賽事之運動員</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">國家級運動員及非國家級運動員</h4>
                    <p className="text-gray-700 text-sm">向中華運動禁藥防制基金會申請</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">參與國際賽事運動員</h4>
                    <p className="text-gray-700 text-sm">依據賽事競賽規程辦理（如：亞運、奧運、世界錦標賽）</p>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">申請時間規定</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-amber-300 pl-4">
                    <h4 className="font-semibold text-gray-900">隨時禁用物質（S0~S5、M1~M3、P1）</h4>
                    <p className="text-gray-700">無論是否參賽，應儘速提出申請</p>
                  </div>
                  <div className="border-l-4 border-amber-300 pl-4">
                    <h4 className="font-semibold text-gray-900">賽內禁用物質（S6~S9、P1）</h4>
                    <p className="text-gray-700">依賽事主辦單位訂定之申請日期為原則，一般為賽前30天</p>
                    <p className="text-gray-600 text-sm mt-1">賽內期：指運動員表定參賽之前一日23:59起算直到比賽與檢體採集流程結束為止</p>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">特殊情況申請</h3>
                <p className="text-gray-700 mb-4">下列「特殊情況」得於使用後提出回溯性申請或申請截止日期後提出，但仍須符合所有核可條件：</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">緊急醫療</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">無充足時間於接受藥檢前提出申請</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">非國家級運動員接受檢測</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">於賽外使用「賽內禁用物質」</span>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">審查時程</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">審查結果原則上將於收到完整申請資料起21天內通知</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">因特殊情況於賽事前30天後申請時，如距賽事少於21天，不保證於賽事前完成審查</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">非國家級運動員：任何情況皆無須於使用前申請，如出現不利檢測報告時，可提出回溯性TUE申請</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Guide Tab */}
      {activeTab === 'application' && (
        <div className="space-y-6">
          {/* Who Needs to Apply */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">誰需要申請TUE？</h3>
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
                  <li>• 審查委員會21天內回覆</li>
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
                  <h4 className="font-semibold text-gray-900 mb-2">醫療診斷確認</h4>
                  <p className="text-gray-700 mb-3">由合格醫師進行完整診斷，確認需要使用禁用物質或方法</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-900 mb-2">所需文件:</p>
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
                  <h4 className="font-semibold text-gray-900 mb-2">填寫申請表格</h4>
                  <p className="text-gray-700 mb-3">運動員與醫師共同完成TUE申請表，提供詳細醫療資訊</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-900 mb-2">申請表內容包含:</p>
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
                  <h4 className="font-semibold text-gray-900 mb-2">提交申請文件</h4>
                  <p className="text-gray-700 mb-3">向適當的審查機構提交完整申請文件</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold">4</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">等待審查結果</h4>
                  <p className="text-gray-700">審查委員會將在21天內完成審查並通知結果</p>
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
              <p className="text-red-800 font-medium mb-2">以下情況可申請回溯性TUE：</p>
              <ul className="text-red-700 space-y-1">
                <li>• 緊急醫療治療情況</li>
                <li>• 來不及事前申請的急性疾病</li>
                <li>• 非國際級或國家級運動員</li>
                <li>• 賽外期間使用僅在比賽時禁用的物質</li>
              </ul>
            </div>
            <p className="text-gray-700">
              <strong>重要提醒：</strong>回溯性TUE僅在特殊情況下被接受，不應作為常規申請方式。
            </p>
          </div>
        </div>
      )}

      {/* Disease Guides Tab */}
      {activeTab === 'diseases' && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">運動員TUE疾病建議</h3>
            <p className="text-blue-800 text-sm">
              列出各項病症於申請TUE（治療用藥豁免）時應檢附的資料，建議運動員與醫師共同評估申請的必要性，以確保符合 TUE 國際標準，相關檢查表自財團法人中華運動禁藥防制基金會連結下載。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ADHD */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center text-white">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <h3 className="text-base font-bold">專注力失調及過度活躍症 (ADHD)</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">哌醋甲酯 (Methylphenidate)</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">安非他命衍生物 (Amphetamine derivatives)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_ADHD.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2023-12/tue_physician_guidelines_adhd_-_version_7.1_-_october_2023.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">糖化皮質類固醇和礦物質皮質類固醇</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Adrenal-insufficiency.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_adrenal_insufficiency_6.0_0.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">糖化皮質類固醇</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Anaphylaxis.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_anaphylaxis_version3.0.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">乙二型擬交感作用劑 (Beta-2-agonists)</span>
                </div>
                <div className="space-y-2">
                  <a href="https://drive.google.com/file/d/1Rjj4UUwNOreLpdyicLfucNf4kHQPHzvz/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2023-02/tue_physician_guidelines_asthma_february_2023.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">乙型交感神經阻斷劑 (Beta-blockers)</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Cardiovascular-conditions.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_cardiovascularbetablockers_version2.2.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">胰島素 (Insulin)</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Diabetes.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_diabetes_version4.2_en.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">糖化皮質類固醇</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Inflammatory-Bowel-Disease.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_inflammatory_bowel_final_november_2021.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質/方法</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">容量 &gt; 每12小時100毫升</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Intravenous-infusions.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2023-10/tue_physician_guidelines_iv_infusion_october_2023.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">睪固酮</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">人類絨毛膜性腺激素</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Male-Hypogonadism.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2023-03/tue_physician_guidelines_male_hypogonadism_march_2023.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">全身性糖化皮質類固醇</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">麻醉劑</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Musculoskeletal-conditions.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2023-10/tue_physician_guidelines_-_musculoskeletal_conditions_-_version_5.1_october_2023_2.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">麻醉劑</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">大麻</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Neuropathic-pain.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_neuropathicpain_version2.0.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">全身性糖化皮質類固醇、EPO</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">利尿劑、β阻斷劑、HIF抑制劑</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Renal-transplantation.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/wada_tpg_renal_transplantation_3.0_en.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">偽麻黃鹼</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">糖化皮質類固醇</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Sinusitis.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_sinusitis_rhinosinusitis_final_november_2021.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">興奮劑</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Sleep-disorder-Intrinsic.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tuec_intrinsicsleepdisorder_version4.0.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">睪固酮</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">螺內酯</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2021/03/TUE申請檢查表_Transgender-Athletes.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2022-01/TUE%20Physician%20Guidelines_Transgender%20Athletes_Final%20%28January%202022%29.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">clomiphene</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">letrozole</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/女性不孕症（Female-Infertility）_female_infertility_final_november_2021.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_female_infertility_final_november_2021.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <span className="block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">生長激素</span>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/生長激素不足GHD_growth_hormone_deficiency_child_and_adult_final_november_2022.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2022-11/tue_physician_guidelines_growth_hormone_deficiency_children_and_adolescent_final_november_2022_0.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">clomiphene</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">letrozole</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/PCOS_pcos_final_november_2021.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/resources/files/tue_physician_guidelines_pcos_final_november_2021.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">麻醉劑 (賽內禁用)</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">大麻素</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/TUE申請檢查表_pain_management_december_2021.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2022-01/tue_physician_guidelines_pain_management.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
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
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">禁用物質</h4>
                  <div className="text-xs space-y-1">
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">糖化皮質類固醇、EPO、利尿劑</span>
                    <span className="block px-2 py-1 bg-gray-100 text-gray-700 rounded">β阻斷劑、HIF抑制劑</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="https://www.antidoping.org.tw/wp-content/uploads/2023/11/TUE申請檢查表_Kidney-Failure-and-Kidney-Transplantation.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 block text-center">
                    下載檢查表
                  </a>
                  <a href="https://www.wada-ama.org/sites/default/files/2023-07/tue_physician_guideline_kidney_failure_and_kidney_transplantation_final.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 block text-center">
                    閱讀醫師指引
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* Application Checklist */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">TUE申請檢查清單</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">確認醫療診斷</p>
                  <p className="text-sm text-gray-600">由合格醫師進行完整診斷，確認醫療需求</p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">準備醫療文件</p>
                  <p className="text-sm text-gray-600">收集病史、檢驗報告及醫師診斷證明</p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">評估替代治療</p>
                  <p className="text-sm text-gray-600">確認沒有其他獲准的替代治療方法</p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">完成申請表格</p>
                  <p className="text-sm text-gray-600">與醫師共同填寫詳細的TUE申請表</p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">確認申請對象</p>
                  <p className="text-sm text-gray-600">向正確的審查機構提出申請</p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-gray-900">提前申請時間</p>
                  <p className="text-sm text-gray-600">至少在比賽前30天提出申請</p>
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
              <a href="https://www.antidoping.org.tw/faq/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">中華運動禁藥防制基金會 FAQ</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">完整的TUE申請指南與常見問題</p>
              </a>
              
              <a href="https://www.wada-ama.org/en/prohibited-list" target="_blank" rel="noopener noreferrer" className="block p-4 bg-red-50 rounded-lg hover:bg-red-100 transition">
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-900">WADA禁用清單</span>
                </div>
                <p className="text-sm text-red-700 mt-1">最新的世界反禁藥機構禁用物質清單</p>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TUE;