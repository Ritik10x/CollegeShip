import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_SEO, getRouteSeoConfig } from "../lib/seo";

const MANAGED_ATTR = "data-managed-seo";
const JSON_LD_ID = "collageship-page-jsonld";

function upsertMeta(attribute, key, content) {
  if (content == null || content === "") return;
  let element = document.head.querySelector(
    `meta[${attribute}="${key}"][${MANAGED_ATTR}="true"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let element = document.head.querySelector(
    `link[rel="${rel}"][${MANAGED_ATTR}="true"]`,
  );
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    element.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function setJsonLd(jsonLd) {
  const existing = document.getElementById(JSON_LD_ID);
  if (existing) existing.remove();
  if (!jsonLd) return;

  const script = document.createElement("script");
  script.id = JSON_LD_ID;
  script.type = "application/ld+json";
  script.setAttribute(MANAGED_ATTR, "true");
  script.textContent = JSON.stringify(
    Array.isArray(jsonLd) && jsonLd.length === 1 ? jsonLd[0] : jsonLd,
  );
  document.head.appendChild(script);
}

function applySeo({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType,
  robots,
}) {
  document.title = title || DEFAULT_SEO.title;
  upsertMeta("name", "description", description || DEFAULT_SEO.description);
  upsertMeta("name", "keywords", keywords || DEFAULT_SEO.keywords);
  upsertMeta("name", "robots", robots || DEFAULT_SEO.robots);
  upsertMeta("name", "author", "CollegeShip");
  upsertMeta("name", "application-name", "CollegeShip");
  upsertMeta("name", "theme-color", "#0A2647");
  upsertMeta("property", "og:title", title || DEFAULT_SEO.title);
  upsertMeta(
    "property",
    "og:description",
    description || DEFAULT_SEO.description,
  );
  upsertMeta("property", "og:type", ogType || DEFAULT_SEO.ogType);
  upsertMeta("property", "og:site_name", "CollegeShip");
  upsertMeta("property", "og:locale", "en_IN");
  upsertMeta(
    "property",
    "og:image",
    ogImage || DEFAULT_SEO.ogImage,
  );
  upsertMeta("property", "og:url", canonical || window.location.href);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title || DEFAULT_SEO.title);
  upsertMeta(
    "name",
    "twitter:description",
    description || DEFAULT_SEO.description,
  );
  upsertMeta(
    "name",
    "twitter:image",
    ogImage || DEFAULT_SEO.ogImage,
  );
  upsertLink("canonical", canonical || window.location.href);
}

export default function PageSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType,
  robots,
  jsonLd,
  noindex = false,
}) {
  useEffect(() => {
    applySeo({
      title,
      description,
      keywords,
      canonical,
      ogImage,
      ogType,
      robots: noindex ? "noindex, nofollow" : robots,
    });
    setJsonLd(jsonLd);

    return () => {
      document.getElementById(JSON_LD_ID)?.remove();
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    ogImage,
    ogType,
    robots,
    jsonLd,
    noindex,
  ]);

  return null;
}

export function SeoManager() {
  const { pathname } = useLocation();
  const config = getRouteSeoConfig(pathname);

  if (!config) return null;

  return (
    <PageSEO
      title={config.title}
      description={config.description}
      keywords={config.keywords}
      canonical={config.canonical}
      ogImage={config.ogImage}
      ogType={config.ogType}
      robots={config.robots}
      jsonLd={config.jsonLd}
      noindex={config.noindex}
    />
  );
}
