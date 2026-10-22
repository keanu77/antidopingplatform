import { SITE_URL } from "../data/routeMeta";
export function applyPageMeta({ title, description, path, noindex = false }) {
  document.title = title;
  for (const [key, value] of Object.entries({ description, "og:title": title, "og:description": description, "og:url": `${SITE_URL}${path}`, "twitter:title": title, "twitter:description": description, robots: noindex ? "noindex, follow" : "index, follow" })) {
    const attr = key.startsWith("og:") ? "property" : "name";
    let element = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!element) { element = document.createElement("meta"); element.setAttribute(attr, key); document.head.append(element); }
    element.content = value || "";
  }
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
  canonical.href = `${SITE_URL}${path}`;
}
