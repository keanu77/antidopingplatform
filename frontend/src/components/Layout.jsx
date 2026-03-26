import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  BarChart3,
  GraduationCap,
  FileText,
  Menu,
  X,
  Shield,
  Zap,
  ClipboardList,
  Newspaper,
  Link2,
  ChevronDown,
} from "lucide-react";

function DropdownMenu({ label, items, pathname, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const timeout = useRef(null);

  const isActive = items.some((item) => item.path === pathname);

  const handleEnter = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeout.current = setTimeout(() => {
      setOpen(false);
      setFocusIndex(-1);
    }, 150);
  };

  // P2: 鍵盤方向鍵導航
  const handleKeyDown = (e) => {
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      setOpen(true);
      setFocusIndex(0);
      return;
    }

    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) => (prev + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setFocusIndex(-1);
        break;
      case "Home":
        e.preventDefault();
        setFocusIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusIndex(items.length - 1);
        break;
    }
  };

  useEffect(() => {
    if (open && focusIndex >= 0 && menuRef.current) {
      const links = menuRef.current.querySelectorAll("a");
      links[focusIndex]?.focus();
    }
  }, [focusIndex, open]);

  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-emerald-50 text-emerald-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
        onClick={() => {
          setOpen(!open);
          if (!open) setFocusIndex(0);
        }}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[180px] z-50 animate-fadeIn"
        >
          {items.map(({ path, label: itemLabel, icon: Icon }, index) => (
            <Link
              key={path}
              to={path}
              role="menuitem"
              tabIndex={focusIndex === index ? 0 : -1}
              onClick={() => {
                setOpen(false);
                setFocusIndex(-1);
                onNavigate?.();
              }}
              onKeyDown={handleKeyDown}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname === path
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {itemLabel}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryItems = [
    { path: "/", label: "首頁", icon: Home },
    { path: "/cases", label: "案例搜尋", icon: Search },
    { path: "/statistics", label: "數據統計", icon: BarChart3 },
  ];

  const learnItems = [
    { path: "/prohibited-list", label: "禁用清單", icon: Shield },
    { path: "/quiz", label: "互動測驗", icon: Zap },
    { path: "/testing-process", label: "藥檢流程", icon: ClipboardList },
    { path: "/education", label: "教育專區", icon: GraduationCap },
    { path: "/tue", label: "TUE 專區", icon: FileText },
  ];

  const moreItems = [
    { path: "/news", label: "最新消息", icon: Newspaper },
    { path: "/resources", label: "實用連結", icon: Link2 },
  ];

  const navGroups = [
    { label: "主要", items: primaryItems },
    { label: "學習", items: learnItems },
    { label: "更多", items: moreItems },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-emerald-600 focus:rounded-lg focus:shadow-lg"
      >
        跳至主要內容
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors hidden sm:inline">
                乾淨運動從你我開始
              </span>
              <span className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors sm:hidden">
                Clean Sport
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Primary items shown directly */}
              {primaryItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === path
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Learn dropdown */}
              <DropdownMenu
                label="學習專區"
                items={learnItems}
                pathname={location.pathname}
              />

              {/* More dropdown */}
              <DropdownMenu
                label="更多"
                items={moreItems}
                pathname={location.pathname}
              />
            </nav>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-100 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-3 space-y-4">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">
                    {group.label}
                  </p>
                  {group.items.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        location.pathname === path
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main */}
      <main
        id="main-content"
        className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">乾淨運動從你我開始</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                本平台致力於分享運動禁藥案例與實用知識，幫助選手、教練及醫療人員正確認識風險與規範，打造更安全與公平的運動環境。
              </p>
              <p className="text-gray-500 text-xs">
                資料來源：WADA 2026 Prohibited List、CTADA
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-4 text-gray-300 uppercase tracking-wider">
                快速連結
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.wada-ama.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    WADA 官方網站
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.wada-ama.org/en/prohibited-list"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    WADA 禁用清單
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.antidoping.org.tw/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    CTADA 官方網站
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.check-antidoping.org.tw/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    CTADA 藥物查詢
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-4 text-gray-300 uppercase tracking-wider">
                製作者
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                <a
                  href="https://wycswimming.blogspot.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  吳易澄 醫師
                </a>
              </p>
              <p className="text-gray-500 text-xs">聯新國際醫院 運動醫學科</p>
              <div className="mt-4">
                <p className="text-gray-500 text-xs">
                  本平台資訊僅供參考，若有不足或錯誤之處，歡迎來信：keanu.firefox@gmail.com
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            © 2025 乾淨運動從你我開始 — Your Body, Your Responsibility!
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
