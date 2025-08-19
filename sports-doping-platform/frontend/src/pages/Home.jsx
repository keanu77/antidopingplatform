import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BarChart3, GraduationCap, AlertTriangle, Users, Trophy, Calendar } from 'lucide-react';
import { statsAPI } from '../services/api';

function Home() {
  const [stats, setStats] = useState({
    totalCases: 0,
    totalSports: 0,
    totalCountries: 0,
    recentCases: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsAPI.getOverview();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const features = [
    {
      icon: Search,
      title: '案例搜尋',
      description: '快速查找國際運動禁藥案例，支援多條件篩選',
      link: '/cases',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: BarChart3,
      title: '數據視覺化',
      description: '透過圖表了解禁藥案例趨勢與分布',
      link: '/statistics',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: GraduationCap,
      title: '教育專區',
      description: '學習禁藥知識，參與互動測驗',
      link: '/education',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white mb-8">
        <div className="flex items-center mb-4">
          <h1 className="text-4xl font-bold">運動禁藥相關案例資料庫</h1>
        </div>
        <p className="text-xl mb-6 text-primary-100">
          整理國際運動禁藥案例，提供檢索與教育功能，增進對運動禁藥問題的認識
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">總案例數</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
            </div>
            <div className="bg-danger-100 p-3 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-danger-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">涵蓋運動項目</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSports}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Trophy className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">涉及國家</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCountries}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <Link key={index} to={feature.link} className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Cases */}
      {stats.recentCases.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">相關案例</h2>
          <div className="space-y-3">
            {stats.recentCases.map((case_item) => (
              <Link 
                key={case_item._id} 
                to={`/cases/${case_item._id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
              >
                <div className="flex items-center">
                  <div className="bg-danger-100 p-2 rounded-lg mr-4">
                    <AlertTriangle className="h-5 w-5 text-danger-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{case_item.athleteName}</p>
                    <p className="text-sm text-gray-500">{case_item.sport}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">{case_item.year}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/cases" className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-medium">
            查看所有案例 →
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;