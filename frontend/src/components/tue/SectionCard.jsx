// TUE 各分頁共用的白底區塊：左側色塊圖示 + 標題 + 內容
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <section className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-2 rounded-lg mr-4 ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          {children}
        </div>
      </div>
    </section>
  );
}

export default SectionCard;
