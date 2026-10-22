import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { routesMeta, SITE_NAME } from "../data/routeMeta";
import { applyPageMeta } from "../utils/pageMeta";
export default function PageMetadata() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const path = pathname.replace(/\/$/, "") || "/";
    const known = routesMeta.find((route) => route.path === path);
    applyPageMeta(known || { path, title: `${path.startsWith("/cases/") ? "案例詳情" : "頁面未找到"} | ${SITE_NAME}`, description: "查看教學案例、資料查核範圍與官方來源。", noindex: true });
  }, [pathname]);
  return null;
}
