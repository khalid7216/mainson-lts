import { useState } from "react";
import { Btn, Spinner } from "../../components/UI";

const EMPTY_CATEGORY = {
  name: "",
  slug: "",
  description: "",
  image: "" // string url
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <p style={{
      fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase",
      color: "var(--gold)", marginBottom: 16, paddingBottom: 10,
      borderBottom: "1px solid var(--border)",
    }}>
      {title}
    </p>
    {children}
  </div>
);

const Field = ({ label, required, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{
      display: "block", fontSize: 11, letterSpacing: ".12em",
      textTransform: "uppercase", color: "var(--muted)", marginBottom: 8,
    }}>
      {label} {required && <span style={{ color: "var(--rose)" }}>*</span>}
    </label>
    {children}
    {error && (
      <p style={{ color: "var(--rose)", fontSize: 11, marginTop: 5 }}>⚠ {error}</p>
    )}
  </div>
);

const Textarea = ({ value, onChange, placeholder, rows = 4, error }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: "100%", padding: "12px 14px", borderRadius: 6,
      border: `1px solid ${error ? "var(--rose)" : "var(--border2)"}`,
      background: "rgba(255,255,255,.04)", color: "var(--text)",
      fontSize: 13, resize: "vertical", outline: "none",
      fontFamily: "'Jost', sans-serif", lineHeight: 1.6,
      transition: "border-color .2s",
    }}
    onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
    onBlur={(e) => (e.target.style.borderColor = error ? "var(--rose)" : "var(--border2)")}
  />
);

const CategoryFormModal = ({ category = null, onClose, onSave }) => {
  const isEdit = Boolean(category);
  const [form, setForm] = useState(category ? { ...category } : { ...EMPTY_CATEGORY });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Category name is required";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      // Send as JSON since backend usually takes JSON unless file is included via Multer
      // For Categories, if we add Image upload later it would be FormData. 
      // Current categoryController takes JSON body (`req.body`).
      await onSave?.(form);
      onClose();
    } catch (err) {
      console.error("Save Category Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-box"
        style={{ maxWidth: 540, display: "flex", flexDirection: "column", maxHeight: "90vh" }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 32px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, fontSize: 26 }}>
              {isEdit ? "Edit Category" : "Add New Category"}
            </h2>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Define primary taxonomy segments
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 26, cursor: "pointer", transition: "color .2s", lineHeight: 1 }}
            onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <Section title="General">
            <Field label="Category Name" required error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Outerwear"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 6,
                  border: `1px solid ${errors.name ? "var(--rose)" : "var(--border2)"}`,
                  background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 14,
                }}
              />
            </Field>

            {isEdit && (
              <Field label="Slug URL">
                <input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="e.g. outerwear (auto-generated if empty)"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 6,
                    border: "1px solid var(--border2)",
                    background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 14,
                  }}
                />
              </Field>
            )}

            <Field label="Banner Image URL">
              <input
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://... (Optional banner)"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 6,
                  border: "1px solid var(--border2)",
                  background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 14,
                }}
              />
            </Field>

            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Internal or meta description..."
                rows={3}
              />
            </Field>
          </Section>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "20px 32px", borderTop: "1px solid var(--border)", flexShrink: 0,
          background: "var(--surface)", gap: 10
        }}>
          <Btn v="ghost" onClick={onClose}>Cancel</Btn>
          <Btn v="primary" onClick={handleSave} disabled={loading}>
            {loading ? <><Spinner /> Saving...</> : "Save Category"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
