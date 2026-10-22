import { NavLink } from "react-router-dom";

const categories = [
  { to: "/drug-search", label: "西藥" },
  { to: "/herbal-search", label: "中藥" },
  { to: "/supplement-search", label: "營養品" },
  { to: "/prohibited-list", label: "禁用清單" },
];

export default function CatalogNavigation() {
  return <nav aria-label="藥品與營養品查詢分類" className="mt-5 flex flex-wrap gap-2 text-sm">
    {categories.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-full border px-4 py-2 ${isActive ? "border-emerald-100 bg-emerald-50 font-semibold text-emerald-900" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{label}</NavLink>)}
  </nav>;
}
