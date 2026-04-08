import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { pageAPI } from "../services/api";
import { IoLogoInstagram, IoLogoTwitter, IoLogoPinterest } from "react-icons/io5";

const DynamicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await pageAPI.getPageBySlug(slug);
        setPage(res.data);
      } catch (err) {
        console.error(err);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug, navigate]);

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 72 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40,
            border: "2px solid var(--border)",
            borderTopColor: "var(--gold)",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Loading page...</p>
        </div>
      </div>
    );
  }

  if (!page) return null;

  // Process content: convert newlines to <br> if content doesn't already contain HTML block tags
  const processContent = (content) => {
    if (!content) return "";
    // If content has HTML block tags, render as-is
    const hasBlockTags = /<(div|p|h[1-6]|ul|ol|li|table|section|article|blockquote|pre|hr)/i.test(content);
    if (hasBlockTags) return content;
    // Otherwise convert newlines to <br>
    return content.replace(/\n/g, "<br />");
  };

  return (
    <div style={{ paddingTop: 72 }}>
      <style>{`
        .dynamic-content {
          text-align: center;
        }
        .dynamic-content h1,
        .dynamic-content h2,
        .dynamic-content h3,
        .dynamic-content h4,
        .dynamic-content h5,
        .dynamic-content h6 {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          margin: 2em 0 0.8em;
          color: var(--text);
          line-height: 1.3;
        }
        .dynamic-content h1 { font-size: clamp(28px, 4vw, 42px); }
        .dynamic-content h2 { font-size: clamp(22px, 3vw, 32px); color: var(--gold2); }
        .dynamic-content h3 { font-size: clamp(18px, 2.5vw, 24px); }
        .dynamic-content h4 { font-size: 18px; }
        .dynamic-content p {
          margin-bottom: 1.2em;
          color: var(--muted);
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        .dynamic-content ul, .dynamic-content ol {
          text-align: left;
          max-width: 600px;
          margin: 1em auto 1.5em;
          padding-left: 1.5em;
        }
        .dynamic-content li {
          margin-bottom: 0.6em;
          color: var(--muted);
        }
        .dynamic-content a {
          color: var(--gold);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color .2s;
        }
        .dynamic-content a:hover {
          color: var(--gold2);
        }
        .dynamic-content strong, .dynamic-content b {
          color: var(--text);
          font-weight: 600;
        }
        .dynamic-content blockquote {
          border-left: 3px solid var(--gold);
          padding: 16px 24px;
          margin: 2em auto;
          max-width: 600px;
          background: rgba(201,168,76,.04);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: var(--muted);
          text-align: left;
        }
        .dynamic-content img {
          max-width: 100%;
          border-radius: 12px;
          margin: 2em auto;
          display: block;
        }
        .dynamic-content hr {
          border: none;
          height: 1px;
          background: var(--border);
          margin: 3em auto;
          max-width: 200px;
        }
        .dynamic-content table {
          width: 100%;
          max-width: 700px;
          margin: 2em auto;
          border-collapse: collapse;
          text-align: left;
        }
        .dynamic-content th, .dynamic-content td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }
        .dynamic-content th {
          color: var(--gold);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .1em;
        }
      `}</style>

      {/* Page Header */}
      <section
        style={{
          padding: "80px clamp(20px, 5vw, 60px) 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,.08) 0%, transparent 60%)",
        }} />
        <p style={{
          fontSize: 10, letterSpacing: ".4em", textTransform: "uppercase",
          color: "var(--gold)", marginBottom: 20, position: "relative",
        }}>
          Maison Élite
        </p>
        <h1
          className="fu"
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 300,
            lineHeight: 1.1,
            marginBottom: 16,
            position: "relative",
          }}
        >
          {page.title}
        </h1>
        <div style={{
          width: 60, height: 1, background: "var(--gold)",
          margin: "24px auto 0", opacity: 0.5,
        }} />
      </section>

      {/* Page Content */}
      <div
        className="fu"
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "20px clamp(20px, 5vw, 40px) 80px",
          minHeight: "40vh",
        }}
      >
        <div
          className="dynamic-content"
          style={{ color: "var(--text)", lineHeight: 1.9, fontSize: 15 }}
          dangerouslySetInnerHTML={{ __html: processContent(page.content) }}
        />
      </div>

      {/* Footer */}
      <footer
        className="app-footer"
        style={{
          background: "var(--void)",
          borderTop: "1px solid var(--border)",
          padding: "64px clamp(24px, 8vw, 60px) 32px",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 48,
              marginBottom: 56,
            }}
            className="grid-2-col"
          >
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 16 }}>
                MAISON<span className="gold-text">·ÉLITE</span>
              </h3>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.85, maxWidth: 260, marginBottom: 24 }}>
                A curated fashion house for the discerning woman. Where luxury meets purpose.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                {[<IoLogoInstagram size={16} />, <IoLogoTwitter size={16} />, <IoLogoPinterest size={16} />].map((icon, i) => (
                  <button
                    key={i}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: "1px solid var(--border2)", background: "none",
                      color: "var(--dim)", cursor: "pointer", fontSize: 14,
                      transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--dim)"; }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {[
              { t: "Shop", l: [
                { label: "New Arrivals", to: "/shop?badge=New" },
                { label: "Dresses", to: "/shop?search=Dresses" },
                { label: "Outerwear", to: "/shop?search=Outerwear" },
                { label: "Accessories", to: "/shop?category=Accessories" },
                { label: "Sale", to: "/shop?badge=Sale" },
              ]},
              { t: "Help", l: [
                { label: "Sizing Guide", to: "/page/sizing-guide" },
                { label: "Returns", to: "/page/returns" },
                { label: "Shipping", to: "/page/shipping" },{ label: "Track Order", to: "/track-order" },
                { label: "Gift Cards", to: "/page/gift-cards" },
                { label: "Contact", to: "/page/contact" },
              ]},
              { t: "Maison", l: [
                { label: "Our Story", to: "/page/our-story" },
                { label: "Sustainability", to: "/page/sustainability" },
                { label: "Press", to: "/page/press" },
                { label: "Careers", to: "/page/careers" },
                { label: "Stockists", to: "/page/stockists" },
              ]},
            ].map((col) => (
              <div key={col.t}>
                <p style={{ fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 18 }}>
                  {col.t}
                </p>
                {col.l.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    style={{
                      display: "block", color: "var(--muted)", fontSize: 13,
                      marginBottom: 11, textDecoration: "none", transition: "color .2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid var(--border)", paddingTop: 24,
            display: "flex", justifyContent: "space-between",
            fontSize: 12, color: "var(--dim)", flexWrap: "wrap", gap: 12,
          }}>
            <span>© 2026 Maison Élite. All rights reserved.</span>
            <span>Privacy · Terms · Accessibility</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DynamicPage;
