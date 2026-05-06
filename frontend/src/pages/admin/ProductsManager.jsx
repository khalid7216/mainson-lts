import { useState, useEffect } from "react";
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../../services/adminService";
import { useToast } from "../../context/ToastContext";

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await getAllProducts(page);
      setProducts(res.products || res.data || []);
      setTotalPages(res.pages || res.totalPages || 1);
    } catch (err) {
      toast("Failed to load products", "err");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      toast("Product deleted", "ok");
      fetchProducts();
    } catch (err) {
      toast("Failed to delete product", "err");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const ProductForm = () => {
    const [formData, setFormData] = useState({
      name: editingProduct?.name || "",
      description: editingProduct?.description || "",
      price: editingProduct?.price || "",
      stock: editingProduct?.stock || "",
      category: editingProduct?.category?._id || editingProduct?.category || "",
    });
    const [images, setImages] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      
      const payload = new FormData();
      Object.keys(formData).forEach(key => payload.append(key, formData[key]));
      
      if (images) {
        for (let i = 0; i < images.length; i++) {
          payload.append("images", images[i]);
        }
      }

      try {
        if (editingProduct) {
          await updateProduct(editingProduct._id || editingProduct.id, payload);
          toast("Product updated", "ok");
        } else {
          await createProduct(payload);
          toast("Product created", "ok");
        }
        setShowForm(false);
        fetchProducts();
      } catch (err) {
        toast(err.response?.data?.message || "Failed to save product", "err");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 24, marginBottom: 24, borderRadius: 6 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 18 }}>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
          <textarea required placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff", minHeight: 80 }} />
          <div style={{ display: "flex", gap: 16 }}>
            <input required type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
            <input required type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
            <input required placeholder="Category ID" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 14 }}>Images</label>
            <input type="file" multiple onChange={e => setImages(e.target.files)} accept="image/*" style={{ color: "#fff" }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "10px 20px", background: "var(--gold)", color: "#000", border: "none", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {submitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, margin: 0, fontFamily: "'Playfair Display', serif" }}>Products Manager</h2>
        {!showForm && (
          <button onClick={openNewForm} style={{ padding: "10px 20px", background: "var(--gold)", color: "#000", border: "none", cursor: "pointer", fontWeight: 600 }}>
            + Add New Product
          </button>
        )}
      </div>

      {showForm && <ProductForm />}

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--muted)" }}>
              <th style={{ padding: 15 }}>Image</th>
              <th style={{ padding: 15 }}>Name</th>
              <th style={{ padding: 15 }}>Category</th>
              <th style={{ padding: 15 }}>Price</th>
              <th style={{ padding: 15 }}>Stock</th>
              <th style={{ padding: 15 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ padding: 20, textAlign: "center" }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: 20, textAlign: "center" }}>No products found</td></tr>
            ) : (
              products.map(p => (
                <tr key={p._id || p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 15 }}>
                    <img src={p.images?.[0]?.url || p.images?.[0] || "/placeholder.jpg"} alt={p.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                  </td>
                  <td style={{ padding: 15 }}>{p.name}</td>
                  <td style={{ padding: 15 }}>{p.category?.name || p.category || "Uncategorized"}</td>
                  <td style={{ padding: 15, color: "var(--gold)" }}>${(p.price || 0).toFixed(2)}</td>
                  <td style={{ padding: 15 }}>{p.stock}</td>
                  <td style={{ padding: 15, display: "flex", gap: 10 }}>
                    <button onClick={() => handleEdit(p)} style={{ padding: "6px 12px", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(p._id || p.id)} style={{ padding: "6px 12px", background: "transparent", color: "#c0392b", border: "1px solid #c0392b", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", cursor: page === 1 ? "not-allowed" : "pointer" }}>Prev</button>
          <span style={{ padding: "8px 0" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;