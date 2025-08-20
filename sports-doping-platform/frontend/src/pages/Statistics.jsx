import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, Clock, Trophy, Users, AlertTriangle } from 'lucide-react';
import { statisticsAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Statistics() {
  const [sportDistribution, setSportDistribution] = useState([]);
  const [substanceDistribution, setSubstanceDistribution] = useState([]);
  const [banDurationDistribution, setBanDurationDistribution] = useState([]);
  const [punishmentStats, setPunishmentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    setLoading(true);
    try {
      const [sport, substance, punishment, banDuration] = await Promise.all([
        statisticsAPI.getSportDistribution(),
        statisticsAPI.getSubstanceDistribution(),
        statisticsAPI.getPunishmentStats(),
        statisticsAPI.getBanDurationDistribution()
      ]);

      setSportDistribution(sport.data);
      setSubstanceDistribution(substance.data);
      setPunishmentStats(punishment.data);
      setBanDurationDistribution(banDuration.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
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

  // Chart configurations
  const sportDistributionData = {
    labels: sportDistribution.map(item => item.sport),
    datasets: [
      {
        label: '案例數量',
        data: sportDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(100, 116, 139, 0.8)',
          'rgba(217, 119, 6, 0.8)'
        ]
      }
    ]
  };

  const substanceDistributionData = {
    labels: substanceDistribution.map(item => item.category),
    datasets: [
      {
        data: substanceDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(100, 116, 139, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(217, 119, 6, 0.8)'
        ]
      }
    ]
  };

  const banDurationData = {
    labels: banDurationDistribution.map(item => item.category),
    datasets: [
      {
        label: '案例數量',
        data: banDurationDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // 無處罰 - 綠色
          'rgba(251, 191, 36, 0.8)',  // 3個月內 - 黃色
          'rgba(251, 146, 60, 0.8)',  // 3-12個月 - 橘色
          'rgba(168, 85, 247, 0.8)',  // 1-2年 - 紫色
          'rgba(59, 130, 246, 0.8)',  // 2-4年 - 藍色
          'rgba(239, 68, 68, 0.8)',   // 4年以上 - 紅色
          'rgba(75, 85, 99, 0.8)'     // 終身 - 深灰色
        ],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 1)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // 重大禁藥事件時間軸
  const majorEvents = [
    {
      year: 1988,
      title: '漢城奧運Ben Johnson事件',
      description: '100公尺金牌得主被發現使用類固醇，震驚全世界',
      impact: '奧運史上最著名的禁藥醜聞',
      icon: Trophy,
      color: 'bg-red-500'
    },
    {
      year: 1999,
      title: 'WADA成立',
      description: '世界反禁藥機構成立，統一全球反禁藥標準',
      impact: '現代反禁藥體系的開始',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      year: 2003,
      title: 'BALCO醜聞爆發',
      description: '美國多名頂級運動員涉及設計類固醇THG',
      impact: '揭露了系統性的禁藥使用網絡',
      icon: AlertTriangle,
      color: 'bg-orange-500'
    },
    {
      year: 2012,
      title: 'Lance Armstrong承認使用禁藥',
      description: '自行車傳奇人物承認職業生涯使用EPO等禁藥',
      impact: '7屆環法冠軍被剝奪，運動史上最大醜聞',
      icon: Trophy,
      color: 'bg-yellow-500'
    },
    {
      year: 2014,
      title: '俄羅斯索契冬奧醜聞',
      description: '俄羅斯被發現系統性國家層面的禁藥計畫',
      impact: '導致俄羅斯在多屆奧運受到制裁',
      icon: Users,
      color: 'bg-red-500'
    },
    {
      year: 2016,
      title: 'Meldonium大規模檢出',
      description: '包括Sharapova在內的多名運動員檢出新禁用藥物',
      impact: '凸顯禁用清單更新對運動員的影響',
      icon: AlertTriangle,
      color: 'bg-purple-500'
    },
    {
      year: 2022,
      title: 'Kamila Valieva北京冬奧爭議',
      description: '15歲花式滑冰選手的禁藥檢測引發未成年人保護討論',
      impact: '推動對年輕運動員的保護政策改革',
      icon: Trophy,
      color: 'bg-pink-500'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">資料庫案例數據統計</h1>
        <p className="text-gray-600 mb-2">透過數據視覺化，清晰了解運動禁藥相關案例的樣貌</p>
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
          ⚠️ 資料並非涵蓋所有案例，請以審慎態度解讀
        </p>
      </div>

      {/* Punishment Stats Cards */}
      {punishmentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">獎牌被剝奪</h3>
              <div className="bg-danger-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-danger-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-danger-600">{punishmentStats.medalStripped}</p>
            <p className="text-sm text-gray-500 mt-1">案例</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">成績被取消</h3>
              <div className="bg-primary-100 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-primary-600">{punishmentStats.resultsCancelled}</p>
            <p className="text-sm text-gray-500 mt-1">案例</p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sport Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
            運動項目分布（前10名）
          </h2>
          <div style={{ height: '350px' }}>
            <Bar data={sportDistributionData} options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, legend: { display: false } }
            }} />
          </div>
        </div>

        {/* Substance Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-primary-600" />
            WADA禁藥類型分布
          </h2>
          <div style={{ height: '350px' }}>
            <Doughnut data={substanceDistributionData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'right',
                  labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                      size: 11
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Ban Duration Distribution */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
            禁賽期限分布統計
          </h2>
          <div style={{ height: '350px' }}>
            <Bar data={banDurationData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    afterLabel: function(context) {
                      const item = banDurationDistribution[context.dataIndex];
                      return `${item.percentage}% (${item.count}/${banDurationDistribution.reduce((a, b) => a + b.count, 0)} 案例)`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 5
                  },
                  title: {
                    display: true,
                    text: '案例數量'
                  }
                }
              }
            }} />
          </div>
          
          {/* Legend/Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {banDurationDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2"
                    style={{ 
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(75, 85, 99, 0.8)'
                      ][index] 
                    }}
                  />
                  <span className="text-sm text-gray-700">{item.category}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 重大事件時間軸 */}
      {showTimeline && (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">重大運動禁藥事件時間軸</h2>
            </div>
            <button
              onClick={() => setShowTimeline(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ×
            </button>
          </div>
          
          <div className="relative">
            {/* 時間軸線 */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-8">
              {majorEvents.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <div key={event.year} className="relative flex items-start">
                    {/* 時間軸點 */}
                    <div className={`flex-shrink-0 w-16 h-16 ${event.color} rounded-full flex items-center justify-center text-white relative z-10`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    
                    {/* 事件內容 */}
                    <div className="ml-6 bg-gray-50 rounded-lg p-4 flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl font-bold text-primary-600 mr-3">{event.year}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-2">{event.description}</p>
                      <p className="text-sm text-gray-600 font-medium">影響：{event.impact}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              這些重大事件塑造了現代反禁藥體系，每個案例都是重要的教育資源
            </p>
          </div>
        </div>
      )}

      {!showTimeline && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowTimeline(true)}
            className="flex items-center mx-auto text-primary-600 hover:text-primary-700 transition"
          >
            <Clock className="h-5 w-5 mr-2" />
            顯示重大事件時間軸
          </button>
        </div>
      )}
    </div>
  );
}

export default Statistics;