import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pageAPI } from "../services/api";

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
        navigate("/404"); // Fallback if page doesn't exist
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)" }}>Loading page...</p>
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="fu" style={{ maxWidth: 960, margin: "0 auto", padding: "100px clamp(20px, 5vw, 40px)", minHeight: "80vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: 60, fontSize: "clamp(36px, 5vw, 56px)" }}>{page.title}</h1>
      
      {/* We use dangerouslySetInnerHTML trusting our admin source */}
      <div 
        className="dynamic-content"
        style={{ color: "var(--text)", lineHeight: 1.8, fontSize: 16 }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
};

export default DynamicPage;
