import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

function NotFound() {
  useEffect(() => {
    document.title = "頁面未找到 | 乾淨運動從你我開始";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <AlertTriangle className="h-16 w-16 text-gray-400" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-2">找不到此頁面</p>
      <p className="text-gray-500 mb-8">
        您所尋找的頁面可能已移除、更名或暫時無法使用。
      </p>
      <Link
        to="/"
        className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        <Home className="h-5 w-5 mr-2" />
        返回首頁
      </Link>
    </div>
  );
}

export default NotFound;
