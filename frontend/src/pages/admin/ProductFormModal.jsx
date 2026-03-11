import { useState } from "react";
import { Btn, Inp, Spinner, StatusTag } from "../../components/UI";

/* ══════════════════════════════════════════════════════
   SCHEMA CONSTANTS — dropdown options
══════════════════════════════════════════════════════ */
export const CATEGORIES = ["Dresses", "Outerwear", "Tops", "Bottoms", "Shoes", "Accessories"];

export const SIZE_OPTIONS = {
  Dresses:     ["XS", "S", "M", "L", "XL", "XXL"],
  Outerwear:   ["XS", "S", "M", "L", "XL", "XXL"],
  Tops:        ["XS", "S", "M", "L", "XL", "XXL"],
  Bottoms:     ["XS", "S", "M", "L", "XL", "XXL"],
  Shoes:       ["35", "36", "37", "38", "39", "40", "41", "42"],
  Accessories: ["One Size"],
};

export const COLOR_OPTIONS = [
  { label: "Black",       hex: "#1a1a1a" },
  { label: "White",       hex: "#f5f0e8" },
  { label: "Ivory",       hex: "#fffff0" },
  { label: "Camel",       hex: "#c19a6b" },
  { label: "Blush",       hex: "#ffb6c1" },
  { label: "Burgundy",    hex: "#800020" },
  { label: "Navy",        hex: "#001f5b" },
  { label: "Olive",       hex: "#6b7c45" },
  { label: "Charcoal",    hex: "#36454f" },
  { label: "Gold",        hex: "#c9a84c" },
];

export const BADGE_OPTIONS = ["", "New", "Bestseller", "Sale", "Limited", "Exclusive"];

export const STATUS_OPTIONS = ["draft", "active", "archived"];

/* ── Empty product form state ───────────────────── */
export const EMPTY_PRODUCT = {
  name:             "",
  description:      "",
  shortDescription: "",
  category:         "",
  subCategory:      "",
  price:            "",
  compareAtPrice:   "",
  badge:            "",
  status:           "draft",
  isFeatured:       false,
  isNewArrival:     false,
  materials:        "",
  careInstructions: "",
  madeIn:           "",
  tags:             "",
  image:            "", // Product image URL
  // sizes: array of { size, stock } — built by SizeStock component
  sizes: [],
  // colors: array of selected color labels
  colors: [],
};

/* ── Validation ─────────────────────────────────── */
export const validateProduct = (form) => {
  const errors = {};
  if (!form.name.trim())             errors.name     = "Product name is required";
  if (!form.description.trim())      errors.description = "Description is required";
  if (!form.category)                errors.category = "Please select a category";
  if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
                                     errors.price    = "Valid price is required";
  if (form.compareAtPrice && Number(form.compareAtPrice) <= Number(form.price))
                                     errors.compareAtPrice = "Must be greater than selling price";
  if (!form.image || !form.image.trim()) errors.image = "Product image is required";
  if (form.sizes.length === 0)       errors.sizes    = "Add at least one size";
  if (form.colors.length === 0)      errors.colors   = "Select at least one color";
  return errors;
};

/* ══════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════ */

/* ── Section wrapper ────────────────────────────── */
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

/* ── Field row (label + input side-by-side) ─────── */
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

/* ── Styled select ──────────────────────────────── */
const Select = ({ value, onChange, children, error }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      width: "100%", padding: "12px 14px", borderRadius: 6,
      border: `1px solid ${error ? "var(--rose)" : "var(--border2)"}`,
      background: "rgba(255,255,255,.04)", color: value ? "var(--text)" : "var(--dim)",
      fontSize: 13, cursor: "pointer", outline: "none",
      transition: "border-color .2s",
    }}
  >
    {children}
  </select>
);

/* ── Styled textarea ────────────────────────────── */
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

/* ── Toggle switch ──────────────────────────────── */
const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
    <div
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? "var(--gold)" : "var(--lift)",
        border: `1px solid ${checked ? "var(--gold)" : "var(--border2)"}`,
        position: "relative", transition: "all .3s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: checked ? "#0d0b0a" : "var(--muted)",
        position: "absolute", top: 2,
        left: checked ? 22 : 2,
        transition: "left .3s",
      }} />
    </div>
    <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
  </label>
);

/* ── Size + Stock table ─────────────────────────── */
const SizeStock = ({ category, sizes, onChange, error }) => {
  const available = SIZE_OPTIONS[category] || SIZE_OPTIONS["Tops"];

  const toggle = (size) => {
    const exists = sizes.find((s) => s.size === size);
    if (exists) {
      onChange(sizes.filter((s) => s.size !== size));
    } else {
      onChange([...sizes, { size, stock: 0 }]);
    }
  };

  const updateStock = (size, stock) => {
    onChange(sizes.map((s) => s.size === size ? { ...s, stock: Number(stock) } : s));
  };

  return (
    <div>
      {/* Size chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {available.map((s) => {
          const active = sizes.find((x) => x.size === s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              style={{
                padding: "8px 16px", borderRadius: 6,
                border: `1px solid ${active ? "var(--gold)" : "var(--border2)"}`,
                background: active ? "rgba(201,168,76,.12)" : "none",
                color: active ? "var(--gold2)" : "var(--muted)",
                fontSize: 12, cursor: "pointer",
                fontFamily: "'Jost', sans-serif", transition: "all .2s",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Stock inputs for selected sizes */}
      {sizes.length > 0 && (
        <div style={{
          background: "var(--lift)", borderRadius: 8,
          border: "1px solid var(--border)", overflow: "hidden",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--dim)" }}>Size</span>
            <span style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--dim)" }}>Stock (units)</span>
          </div>
          {sizes.map((s) => (
            <div key={s.size} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              alignItems: "center", padding: "10px 16px",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--gold2)" }}>{s.size}</span>
              <input
                type="number"
                min={0}
                value={s.stock}
                onChange={(e) => updateStock(s.size, e.target.value)}
                style={{
                  width: 90, padding: "6px 10px", borderRadius: 5,
                  border: "1px solid var(--border2)",
                  background: "rgba(255,255,255,.06)", color: "var(--text)",
                  fontSize: 13, outline: "none",
                }}
              />
            </div>
          ))}
          <div style={{ padding: "8px 16px", fontSize: 12, color: "var(--dim)" }}>
            Total stock: <strong style={{ color: "var(--text)" }}>{sizes.reduce((s, x) => s + x.stock, 0)} units</strong>
          </div>
        </div>
      )}
      {error && <p style={{ color: "var(--rose)", fontSize: 11, marginTop: 6 }}>⚠ {error}</p>}
    </div>
  );
};

/* ── Color picker ───────────────────────────────── */
const ColorPicker = ({ selected, onChange, error }) => (
  <div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {COLOR_OPTIONS.map((c) => {
        const active = selected.includes(c.label);
        return (
          <button
            key={c.label}
            type="button"
            onClick={() =>
              onChange(active ? selected.filter((x) => x !== c.label) : [...selected, c.label])
            }
            title={c.label}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: c.hex, cursor: "pointer",
              border: `2px solid ${active ? "var(--gold)" : "transparent"}`,
              outline: active ? "2px solid var(--gold)" : "2px solid transparent",
              outlineOffset: 2,
              transition: "all .2s", flexShrink: 0,
            }}
          />
        );
      })}
    </div>
    {selected.length > 0 && (
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
        Selected: <span style={{ color: "var(--gold2)" }}>{selected.join(", ")}</span>
      </p>
    )}
    {error && <p style={{ color: "var(--rose)", fontSize: 11, marginTop: 6 }}>⚠ {error}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN PRODUCT FORM MODAL
══════════════════════════════════════════════════════ */
const ProductFormModal = ({ product = null, onClose, onSave }) => {
  /* If product is passed → Edit mode, else → Add mode */
  const isEdit = Boolean(product);

  const [form, setForm] = useState(
    product
      ? {
          ...product,
          price:          String(product.price),
          compareAtPrice: String(product.orig ?? ""),
          category:       product.cat,
          badge:          product.badge || "",
          status:         "active",
          description:    "Crafted in our atelier from the finest materials.",
          shortDescription: "",
          subCategory:    "",
          materials:      "100% Silk",
          careInstructions: "Dry clean only",
          madeIn:         "Italy",
          tags:           product.cat?.toLowerCase() ?? "",
          isFeatured:     false,
          isNewArrival:   product.badge === "New",
          sizes: (SIZE_OPTIONS[product.cat] || []).slice(0, 3).map((s) => ({ size: s, stock: 10 })),
          colors: ["Black"],
        }
      : { ...EMPTY_PRODUCT }
  );

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState("basic");

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSave = async () => {
    const errs = validateProduct(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    onSave?.({ ...form, id: product?.id ?? Date.now() });
    onClose();
  };

  const TABS = [
    { id: "basic",    label: "Basic Info" },
    { id: "pricing",  label: "Pricing" },
    { id: "variants", label: "Sizes & Colors" },
    { id: "details",  label: "Details" },
  ];

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-box"
        style={{ maxWidth: 780, display: "flex", flexDirection: "column", maxHeight: "90vh" }}
      >
        {/* ── Header ──────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 32px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, fontSize: 26 }}>
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              {isEdit ? `Editing: ${product.name}` : "Fill in the product details below"}
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

        {/* ── Tab bar ─────────────────────────────── */}
        <div style={{
          display: "flex", gap: 0,
          borderBottom: "1px solid var(--border)",
          padding: "0 32px", flexShrink: 0,
        }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "14px 20px", background: "none",
                border: "none", borderBottom: `2px solid ${tab === t.id ? "var(--gold)" : "transparent"}`,
                color: tab === t.id ? "var(--gold2)" : "var(--muted)",
                fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "'Jost', sans-serif",
                transition: "all .2s", marginBottom: -1,
              }}
            >
              {t.label}
              {/* Error dot */}
              {(
                (t.id === "basic"    && (errors.name || errors.description || errors.category)) ||
                (t.id === "pricing"  && errors.price) ||
                (t.id === "variants" && (errors.sizes || errors.colors))
              ) && (
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--rose)", marginLeft: 6, verticalAlign: "middle" }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ──────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* ════ TAB: BASIC INFO ════ */}
          {tab === "basic" && (
            <div>
              <Section title="Identity">
                <Field label="Product Name" required error={errors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Obsidian Slip Dress"
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 6,
                      border: `1px solid ${errors.name ? "var(--rose)" : "var(--border2)"}`,
                      background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 14,
                    }}
                  />
                </Field>

                <Field label="Short Description">
                  <Textarea
                    value={form.shortDescription}
                    onChange={(e) => set("shortDescription", e.target.value)}
                    placeholder="One-line tagline shown on product card (optional)"
                    rows={2}
                  />
                </Field>

                <Field label="Full Description" required error={errors.description}>
                  <Textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe the product, fabric, fit, and design details…"
                    rows={5}
                    error={errors.description}
                  />
                </Field>
              </Section>

              <Section title="Product Image">
                <Field label="Image URL" required error={errors.image}>
                  <input
                    value={form.image}
                    onChange={(e) => set("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 6,
                      border: `1px solid ${errors.image ? "var(--rose)" : "var(--border2)"}`,
                      background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 14,
                    }}
                  />
                </Field>

                {/* Image preview */}
                {form.image && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, letterSpacing: ".1em", textTransform: "uppercase" }}>Preview</p>
                    <div style={{
                      width: "100%", maxWidth: 300, height: 200,
                      borderRadius: 8, overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "var(--lift)",
                    }}>
                      <img
                        src={form.image}
                        alt="Preview"
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div style={{
                        width: "100%", height: "100%",
                        display: "none",
                        alignItems: "center", justifyContent: "center",
                        color: "var(--dim)", fontSize: 13,
                      }}>
                        Invalid image URL
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 8, lineHeight: 1.6 }}>
                      💡 Tip: Use <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", textDecoration: "underline" }}>Unsplash</a> for free high-quality images
                    </p>
                  </div>
                )}
              </Section>

              <Section title="Category">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Category" required error={errors.category}>
                    <Select
                      value={form.category}
                      onChange={(e) => { set("category", e.target.value); set("sizes", []); }}
                      error={errors.category}
                    >
                      <option value="">— Select category —</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>

                  <Field label="Sub-Category">
                    <input
                      value={form.subCategory}
                      onChange={(e) => set("subCategory", e.target.value)}
                      placeholder="e.g. Midi Dresses, Blazers…"
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 13 }}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Labels & Visibility">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <Field label="Badge">
                    <Select value={form.badge} onChange={(e) => set("badge", e.target.value)}>
                      {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                    </Select>
                  </Field>

                  <Field label="Status">
                    <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </Select>
                  </Field>
                </div>

                <div style={{ display: "flex", gap: 32 }}>
                  <Toggle checked={form.isFeatured}   onChange={() => set("isFeatured", !form.isFeatured)}   label="Featured Product" />
                  <Toggle checked={form.isNewArrival}  onChange={() => set("isNewArrival", !form.isNewArrival)} label="New Arrival" />
                </div>
              </Section>
            </div>
          )}

          {/* ════ TAB: PRICING ════ */}
          {tab === "pricing" && (
            <div>
              <Section title="Pricing">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Selling Price (USD)" required error={errors.price}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 15 }}>$</span>
                      <input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) => set("price", e.target.value)}
                        placeholder="0.00"
                        style={{ width: "100%", padding: "12px 14px 12px 30px", borderRadius: 6, border: `1px solid ${errors.price ? "var(--rose)" : "var(--border2)"}`, background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 14 }}
                      />
                    </div>
                  </Field>

                  <Field label="Compare-At Price (original)" error={errors.compareAtPrice}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 15 }}>$</span>
                      <input
                        type="number"
                        min={0}
                        value={form.compareAtPrice}
                        onChange={(e) => set("compareAtPrice", e.target.value)}
                        placeholder="0.00 (optional)"
                        style={{ width: "100%", padding: "12px 14px 12px 30px", borderRadius: 6, border: `1px solid ${errors.compareAtPrice ? "var(--rose)" : "var(--border2)"}`, background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 14 }}
                      />
                    </div>
                  </Field>
                </div>

                {/* Price preview */}
                {form.price && (
                  <div style={{ padding: "16px 20px", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Preview</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300 }}>${form.price}</span>
                      {form.compareAtPrice && Number(form.compareAtPrice) > Number(form.price) && (
                        <>
                          <span style={{ fontSize: 18, color: "var(--dim)", textDecoration: "line-through" }}>${form.compareAtPrice}</span>
                          <StatusTag status="Sale" />
                          <span style={{ fontSize: 13, color: "var(--emerald)" }}>
                            Save {Math.round(((form.compareAtPrice - form.price) / form.compareAtPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ════ TAB: SIZES & COLORS ════ */}
          {tab === "variants" && (
            <div>
              <Section title={`Sizes ${form.category ? `— ${form.category}` : "(select category first)"}`}>
                {!form.category ? (
                  <p style={{ fontSize: 13, color: "var(--dim)", padding: "16px 0" }}>
                    ← Go to Basic Info tab and select a category first
                  </p>
                ) : (
                  <SizeStock
                    category={form.category}
                    sizes={form.sizes}
                    onChange={(val) => set("sizes", val)}
                    error={errors.sizes}
                  />
                )}
              </Section>

              <Section title="Colors">
                <ColorPicker
                  selected={form.colors}
                  onChange={(val) => set("colors", val)}
                  error={errors.colors}
                />
              </Section>
            </div>
          )}

          {/* ════ TAB: DETAILS ════ */}
          {tab === "details" && (
            <div>
              <Section title="Material & Care">
                <Field label="Materials">
                  <input
                    value={form.materials}
                    onChange={(e) => set("materials", e.target.value)}
                    placeholder="e.g. 100% Silk, 80% Cashmere 20% Wool"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 13 }}
                  />
                </Field>
                <Field label="Care Instructions">
                  <input
                    value={form.careInstructions}
                    onChange={(e) => set("careInstructions", e.target.value)}
                    placeholder="e.g. Dry clean only, Hand wash cold"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 13 }}
                  />
                </Field>
                <Field label="Made In">
                  <input
                    value={form.madeIn}
                    onChange={(e) => set("madeIn", e.target.value)}
                    placeholder="e.g. Italy, France"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 13 }}
                  />
                </Field>
              </Section>

              <Section title="Tags (comma separated)">
                <Field label="Tags">
                  <input
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    placeholder="e.g. silk, evening-wear, ss26, bestseller"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--border2)", background: "rgba(255,255,255,.04)", color: "var(--text)", fontSize: 13 }}
                  />
                </Field>
                {form.tags && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                      <span key={t} style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(201,168,76,.1)", color: "var(--gold2)", fontSize: 11, letterSpacing: ".08em" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>

        {/* ── Footer actions ───────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 32px", borderTop: "1px solid var(--border)", flexShrink: 0,
          background: "var(--surface)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: form.status === "active" ? "var(--emerald)" : form.status === "draft" ? "var(--gold)" : "var(--dim)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "capitalize" }}>{form.status}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn v="ghost" onClick={onClose}>Cancel</Btn>
            <Btn v="primary" onClick={handleSave} disabled={loading}>
              {loading ? <><Spinner /> Saving...</> : isEdit ? "Save Changes" : "Add Product"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;