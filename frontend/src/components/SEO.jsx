// frontend/src/components/SEO.jsx
// ══════════════════════════════════════════════════════════
//  Reusable SEO component — fetches from DB, injects <head>
//  Usage: <SEO pageName="home" />
//         <SEO pageName="shop" />
//         <SEO pageName="product" title="Override Title" />
// ══════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { seoAPI } from "../services/api";

// ── Default fallback values (prevents flicker on first load)
const DEFAULTS = {
  title: "Maison Élite — Luxury Fashion",
  description:
    "Discover Maison Élite's curated luxury fashion collections. Timeless elegance crafted from the finest materials.",
  keywords: ["luxury fashion", "maison elite", "designer clothing"],
  ogImage: "",
  noIndex: false,
};

// ── Pages that search engines should NOT index
const NOINDEX_PAGES = ["cart", "checkout", "profile", "settings", "admin", "login", "signup"];

const SEO = ({
  pageName,
  // Optional overrides — useful for dynamic pages like products
  title: titleOverride,
  description: descOverride,
  ogImage: ogOverride,
  canonical: canonicalOverride,
}) => {
  const [seo, setSeo] = useState({
    ...DEFAULTS,
    pageName,
    // Apply overrides immediately so there's zero flicker
    title: titleOverride || DEFAULTS.title,
    description: descOverride || DEFAULTS.description,
    ogImage: ogOverride || DEFAULTS.ogImage,
    canonical: canonicalOverride || "",
    noIndex: NOINDEX_PAGES.includes(pageName),
  });

  useEffect(() => {
    if (!pageName) return;

    // Quick local cache so navigating back doesn't re-fetch
    const cacheKey = `seo_${pageName}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setSeo({
        ...parsed,
        // Still apply manual overrides on top of cached
        title: titleOverride || parsed.title,
        description: descOverride || parsed.description,
        ogImage: ogOverride || parsed.ogImage,
        canonical: canonicalOverride || parsed.canonical,
        noIndex: NOINDEX_PAGES.includes(pageName) || parsed.noIndex,
      });
      return;
    }

    seoAPI
      .getByPage(pageName)
      .then((res) => {
        const data = res.seo;
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setSeo({
          ...data,
          title: titleOverride || data.title,
          description: descOverride || data.description,
          ogImage: ogOverride || data.ogImage,
          canonical: canonicalOverride || data.canonical,
          noIndex: NOINDEX_PAGES.includes(pageName) || data.noIndex,
        });
      })
      .catch(() => {
        // Silently keep defaults on failure — never crash user's page
      });
  }, [pageName, titleOverride, descOverride, ogOverride, canonicalOverride]);

  const siteUrl = window.location.origin;
  const currentUrl = window.location.href;
  const resolvedOgImage =
    seo.ogImage ||
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80";

  return (
    <Helmet>
      {/* ── Primary ─────────────────────────────────── */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords?.length > 0 && (
        <meta name="keywords" content={seo.keywords.join(", ")} />
      )}

      {/* ── Robots ──────────────────────────────────── */}
      {seo.noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* ── Canonical ───────────────────────────────── */}
      <link rel="canonical" href={seo.canonical || currentUrl} />

      {/* ── Open Graph (Facebook, WhatsApp, LinkedIn) ─ */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Maison Élite" />

      {/* ── Twitter Card ────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* ── Extra ───────────────────────────────────── */}
      <meta name="author" content="Maison Élite" />
      <meta name="theme-color" content="#0a0a0a" />
    </Helmet>
  );
};

export default SEO;
