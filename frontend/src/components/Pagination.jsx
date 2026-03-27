import { Btn } from "./UI";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      marginTop: 64,
      marginBottom: 32
    }}>
      <Btn 
        v={currentPage === 1 ? "ghost" : "outline"} 
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
      >
        Prev
      </Btn>
      
      <div style={{ display: "flex", gap: 8 }}>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: currentPage === page ? "var(--gold)" : "transparent",
              color: currentPage === page ? "var(--void)" : "var(--text)",
              border: `1px solid ${currentPage === page ? "var(--gold)" : "var(--border2)"}`,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {page}
          </button>
        ))}
      </div>

      <Btn 
        v={currentPage === totalPages ? "ghost" : "outline"} 
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
      >
        Next
      </Btn>
    </div>
  );
};

export default Pagination;
