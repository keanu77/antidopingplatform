import { Link, useLocation } from 'react-router-dom';
import { Search, BarChart3, GraduationCap, FileText, Home } from 'lucide-react';
import PerformanceMonitor from './PerformanceMonitor';

function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首頁', icon: Home },
    { path: '/cases', label: '搜尋案例', icon: Search },
    { path: '/statistics', label: '數據統計', icon: BarChart3 },
    { path: '/education', label: '教育專區', icon: GraduationCap },
    { path: '/tue', label: 'TUE專區', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">運動禁藥相關案例資料庫</span>
            </Link>
            <nav className="hidden md:flex space-x-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">關於本平台</h3>
              <p className="text-gray-400 text-sm">
                本平台致力於分享運動禁藥案例與實用知識，幫助選手、教練及醫療人員正確認識風險與規範，打造更安全與公平的運動環境。
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">免責聲明</h4>
                <p className="text-gray-400 text-xs">
                  本平台資訊僅供參考，若有不足或錯誤之處，誠摯歡迎您來信提供寶貴意見。聯絡信箱：keanu.firefox@gmail.com
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">快速連結</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.wada-ama.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">WADA官方網站</a></li>
                <li><a href="https://www.wada-ama.org/en/prohibited-list" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">WADA禁用清單</a></li>
                <li><a href="https://www.antidoping.org.tw/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">財團法人中華運動禁藥防制基金會(CTADA)</a></li>
                <li><a href="https://taiwan-antidoping.org.tw/index.php" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">台灣運動禁藥管制學會(TADA)</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">運動禁藥查詢諮詢</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.antidoping.org.tw/consult/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">CTADA諮詢</a></li>
                <li><a href="https://taiwan-antidoping.org.tw/index.php/%E9%81%8B%E5%8B%95%E7%A6%81%E8%97%A5%E6%9F%A5%E8%A9%A2" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">TADA查詢</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">製作者</h3>
              <p className="text-gray-400 text-sm">
                <a href="https://wycswimming.blogspot.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  運動醫學科吳易澄醫師
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2025 運動禁藥相關案例資料庫. All rights reserved.
          </div>
        </div>
      </footer>
      
      <PerformanceMonitor />
    </div>
  );
}

export default Layout;