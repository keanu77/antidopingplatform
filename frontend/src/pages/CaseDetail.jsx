import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Ban,
  Medal,
  FileText,
  BookOpen
} from 'lucide-react';
import { casesAPI } from '../services/api';

function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    setLoading(true);
    try {
      const response = await casesAPI.getById(id);
      setCaseData(response.data);
    } catch (error) {
      console.error('Failed to load case:', error);
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

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">案例不存在</p>
        <Link to="/cases" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          返回案例列表
        </Link>
      </div>
    );
  }

  const substanceCategoryColors = {
    '興奮劑': 'bg-red-100 text-red-700 border-red-200',
    '類固醇': 'bg-purple-100 text-purple-700 border-purple-200',
    'EPO': 'bg-blue-100 text-blue-700 border-blue-200',
    '利尿劑': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    '生長激素': 'bg-green-100 text-green-700 border-green-200',
    '血液興奮劑': 'bg-pink-100 text-pink-700 border-pink-200',
    '其他': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const sourceTypeIcons = {
    '新聞': '📰',
    'WADA': '🏛️',
    '官方文件': '📋',
    '其他': '📄'
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        返回
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-danger-600 to-danger-700 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{caseData.athleteName}</h1>
              <div className="flex items-center gap-4 text-danger-100">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {caseData.nationality}
                </span>
                <span className="flex items-center">
                  <Medal className="h-4 w-4 mr-1" />
                  {caseData.sport}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {caseData.year}
                </span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Substance Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">禁用物質</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full border ${substanceCategoryColors[caseData.substanceCategory] || 'bg-gray-100 text-gray-700'}`}>
                  {caseData.substanceCategory}
                </span>
                <span className="text-lg font-medium text-gray-900">{caseData.substance}</span>
              </div>
              {caseData.educationalNotes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <p className="text-sm text-blue-900">{caseData.educationalNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Background */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">事件背景</h2>
            <p className="text-gray-700 leading-relaxed">{caseData.eventBackground}</p>
          </div>

          {/* Punishment */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">處罰結果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Ban className="h-5 w-5 text-danger-600 mr-2" />
                  <span className="font-medium text-gray-900">禁賽期限</span>
                </div>
                <p className="text-2xl font-bold text-danger-600">{caseData.punishment.banDuration}</p>
              </div>
              
              {caseData.punishment.medalStripped && (
                <div className="bg-danger-50 rounded-lg p-4 border border-danger-200">
                  <div className="flex items-center mb-2">
                    <Medal className="h-5 w-5 text-danger-600 mr-2" />
                    <span className="font-medium text-gray-900">獎牌被剝奪</span>
                  </div>
                  <p className="text-danger-600">是</p>
                </div>
              )}
              
              {caseData.punishment.resultsCancelled && (
                <div className="bg-danger-50 rounded-lg p-4 border border-danger-200">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-danger-600 mr-2" />
                    <span className="font-medium text-gray-900">成績被取消</span>
                  </div>
                  <p className="text-danger-600">是</p>
                </div>
              )}
              
              {caseData.punishment.otherPenalties && (
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">其他處罰</span>
                  </div>
                  <p className="text-gray-700">{caseData.punishment.otherPenalties}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {caseData.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">案例摘要</h2>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-gray-700">{caseData.summary}</p>
              </div>
            </div>
          )}

          {/* Sources */}
          {caseData.sourceLinks && caseData.sourceLinks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">資料來源</h2>
              <div className="space-y-2">
                {caseData.sourceLinks.map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{sourceTypeIcons[source.type] || '📄'}</span>
                      <div>
                        <p className="font-medium text-gray-900">{source.title}</p>
                        <p className="text-sm text-gray-500">{source.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Cases */}
          {caseData.relatedCases && caseData.relatedCases.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">相關案例</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseData.relatedCases.map(relatedCase => (
                  <Link
                    key={relatedCase._id}
                    to={`/cases/${relatedCase._id}`}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                  >
                    <h3 className="font-semibold text-gray-900">{relatedCase.athleteName}</h3>
                    <p className="text-sm text-gray-600">{relatedCase.sport}</p>
                    <p className="text-sm text-gray-500 mt-1">{relatedCase.substance} ({relatedCase.year})</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CaseDetail;