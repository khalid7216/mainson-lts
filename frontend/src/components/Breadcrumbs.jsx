import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = ({ customPath }) => {
  const location = useLocation();
  
  // Use provided custom path items or parse from the URL
  let pathnames = [];
  
  if (customPath) {
    pathnames = customPath;
  } else {
    // Drop the empty string before the first slash
    const parts = location.pathname.split("/").filter((x) => x);
    pathnames = parts.map((part, index) => {
      const href = "/" + parts.slice(0, index + 1).join("/");
      return {
        name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
        href
      };
    });
  }

  // Always prepend Home
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    ...pathnames
  ];

  return (
    <nav style={{ marginBottom: 16 }}>
      <ul style={{ 
        display: "flex", 
        listStyle: "none", 
        padding: 0, 
        margin: 0, 
        fontSize: 12, 
        letterSpacing: ".1em", 
        textTransform: "uppercase",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center"
      }}>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isLast ? (
                <span style={{ color: "var(--gold)" }}>{item.name}</span>
              ) : (
                <>
                  <Link 
                    to={item.href} 
                    style={{ 
                      color: "var(--muted)", 
                      textDecoration: "none",
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
                  >
                    {item.name}
                  </Link>
                  <span style={{ color: "var(--border2)" }}>/</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
