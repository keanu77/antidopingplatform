import { Tag, CalendarClock } from "lucide-react";
import { listLabelGuide, annualChanges } from "../data/prohibitedList";

// 禁用清單頁底部：特定物質／濫用物質／監控計畫與年度變更說明
function ListLabelsGuide() {
  return (
    <section className="mt-10 space-y-4" aria-labelledby="list-labels-heading">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-emerald-600" />
        <h2 id="list-labels-heading" className="text-lg font-bold text-gray-900">
          清單上的標籤怎麼讀？
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {listLabelGuide.map((item) => (
          <article key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
            <p className="text-xs text-gray-400 mt-2">依據：{item.source}</p>
          </article>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <CalendarClock className="h-5 w-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900">近年重要變更</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">{annualChanges.note}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {annualChanges.years.map((y) => (
            <div key={y.year}>
              <p className="text-sm font-bold text-emerald-700 mb-1">{y.year} 年版</p>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {y.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ListLabelsGuide;
