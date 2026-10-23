// Retired catalogs must not fall through to previously cached static assets.
export function onRequest() {
  return new Response(JSON.stringify({ error: "此商品查詢服務已停止提供" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
