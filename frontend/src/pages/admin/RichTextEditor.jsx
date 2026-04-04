import { useRef, useEffect, useCallback } from "react";

/* ── SVG Icons (inline, no dependency issues) ──── */
const IconBold = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z"/></svg>;
const IconItalic = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const IconUnderline = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0012 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const IconStrike = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M16 4H8c-2 0-4 1-4 3s2 3 4 3h8c2 0 4 1 4 3s-2 3-4 3H8"/></svg>;
const IconLink = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const IconUndo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;
const IconRedo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
const IconHR = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="12" x2="22" y2="12"/></svg>;
const IconList = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>;
const IconOList = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">1</text><text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">2</text><text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">3</text></svg>;
const IconAlignL = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconAlignC = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconAlignR = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconClear = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="4" x2="20" y2="20"/><path d="M6 4h8l-3.5 7"/><line x1="12" y1="20" x2="8" y2="20"/></svg>;

/* ── Toolbar Button ─────────────────────────────── */
const TBtn = ({ icon, label, active, onClick, children }) => (
  <button
    type="button"
    title={label}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      minWidth: 30,
      height: 30,
      padding: "0 6px",
      border: "1px solid transparent",
      borderRadius: 4,
      background: active ? "rgba(201,168,76,.18)" : "transparent",
      color: active ? "var(--gold)" : "var(--muted)",
      cursor: "pointer",
      fontSize: 13,
      transition: "all .15s",
    }}
  >
    {icon || children}
  </button>
);

/* ── Divider ─────────────────────────────────────── */
const Divider = () => (
  <div
    style={{
      width: 1,
      height: 20,
      background: "var(--border)",
      margin: "0 4px",
      flexShrink: 0,
    }}
  />
);

/* ═══════════════════════════════════════════════════
   RICH TEXT EDITOR
═══════════════════════════════════════════════════ */
const RichTextEditor = ({ defaultValue = "", onChange, placeholder = "Start writing your page content..." }) => {
  const editorRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = defaultValue || "";
      isInitialized.current = true;
    }
  }, [defaultValue]);

  useEffect(() => {
    isInitialized.current = false;
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue || "";
      isInitialized.current = true;
    }
  }, [defaultValue]);

  const exec = useCallback((cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    triggerChange();
  }, []);

  const triggerChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFormatBlock = (tag) => {
    exec("formatBlock", tag);
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const handleInsertHR = () => {
    exec("insertHorizontalRule");
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--lift)",
      }}
    >
      {/* ── Toolbar ───────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          padding: "8px 10px",
          background: "rgba(0,0,0,.15)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Format Block */}
        <select
          onChange={(e) => {
            if (e.target.value) handleFormatBlock(e.target.value);
            e.target.value = "";
          }}
          style={{
            padding: "4px 8px",
            background: "var(--lift)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: 4,
            fontSize: 12,
            cursor: "pointer",
            marginRight: 4,
          }}
          defaultValue=""
        >
          <option value="" disabled>Format</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code</option>
        </select>

        {/* Font Size */}
        <select
          onChange={(e) => {
            if (e.target.value) exec("fontSize", e.target.value);
            e.target.value = "";
          }}
          style={{
            padding: "4px 8px",
            background: "var(--lift)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: 4,
            fontSize: 12,
            cursor: "pointer",
            marginRight: 4,
          }}
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          <option value="1">Small</option>
          <option value="2">Normal</option>
          <option value="3">Medium</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
          <option value="6">XX-Large</option>
          <option value="7">Huge</option>
        </select>

        <Divider />

        {/* Basic Formatting */}
        <TBtn icon={<IconBold />} label="Bold (Ctrl+B)" onClick={() => exec("bold")} />
        <TBtn icon={<IconItalic />} label="Italic (Ctrl+I)" onClick={() => exec("italic")} />
        <TBtn icon={<IconUnderline />} label="Underline (Ctrl+U)" onClick={() => exec("underline")} />
        <TBtn icon={<IconStrike />} label="Strikethrough" onClick={() => exec("strikeThrough")} />

        <Divider />

        {/* Text Color */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <label
            title="Text Color"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>A</span>
            <div style={{
              position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
              width: 14, height: 3, background: "var(--gold)", borderRadius: 2,
            }} />
            <input
              type="color"
              defaultValue="#c9a84c"
              onChange={(e) => exec("foreColor", e.target.value)}
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
          </label>
        </div>

        {/* Highlight Color */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <label
            title="Highlight Color"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)", background: "rgba(241,196,15,.3)", padding: "0 3px", borderRadius: 2 }}>A</span>
            <div style={{
              position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
              width: 14, height: 3, background: "#f1c40f", borderRadius: 2,
            }} />
            <input
              type="color"
              defaultValue="#f1c40f"
              onChange={(e) => exec("hiliteColor", e.target.value)}
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
          </label>
        </div>

        <Divider />

        {/* Alignment */}
        <TBtn icon={<IconAlignL />} label="Align Left" onClick={() => exec("justifyLeft")} />
        <TBtn icon={<IconAlignC />} label="Align Center" onClick={() => exec("justifyCenter")} />
        <TBtn icon={<IconAlignR />} label="Align Right" onClick={() => exec("justifyRight")} />

        <Divider />

        {/* Lists */}
        <TBtn icon={<IconList />} label="Bullet List" onClick={() => exec("insertUnorderedList")} />
        <TBtn icon={<IconOList />} label="Numbered List" onClick={() => exec("insertOrderedList")} />

        <Divider />

        {/* Insert */}
        <TBtn icon={<IconLink />} label="Insert Link" onClick={handleInsertLink} />
        <TBtn icon={<IconHR />} label="Horizontal Line" onClick={handleInsertHR} />

        <Divider />

        {/* Undo/Redo */}
        <TBtn icon={<IconUndo />} label="Undo (Ctrl+Z)" onClick={() => exec("undo")} />
        <TBtn icon={<IconRedo />} label="Redo (Ctrl+Y)" onClick={() => exec("redo")} />

        <Divider />

        {/* Clear formatting */}
        <TBtn icon={<IconClear />} label="Clear Formatting" onClick={() => exec("removeFormat")} />
      </div>

      {/* ── Editor Area ──────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={triggerChange}
        onBlur={triggerChange}
        data-placeholder={placeholder}
        style={{
          minHeight: 350,
          maxHeight: 500,
          overflowY: "auto",
          padding: "20px 24px",
          color: "var(--text)",
          fontSize: 14,
          lineHeight: 1.8,
          outline: "none",
          fontFamily: "'Jost', sans-serif",
        }}
      />

      {/* ── Styles ───────────────────────────────── */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--dim);
          font-style: italic;
          pointer-events: none;
        }
        [contenteditable] h1 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 400;
          margin: 0.8em 0 0.4em;
          color: var(--text);
        }
        [contenteditable] h2 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 400;
          margin: 0.7em 0 0.3em;
          color: var(--gold2);
        }
        [contenteditable] h3 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 500;
          margin: 0.6em 0 0.3em;
          color: var(--text);
        }
        [contenteditable] h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0.5em 0 0.3em;
          color: var(--text);
        }
        [contenteditable] p {
          margin: 0 0 0.6em;
        }
        [contenteditable] blockquote {
          border-left: 3px solid var(--gold);
          padding: 8px 16px;
          margin: 1em 0;
          background: rgba(201,168,76,.04);
          border-radius: 0 6px 6px 0;
          font-style: italic;
          color: var(--muted);
        }
        [contenteditable] pre {
          background: rgba(0,0,0,.3);
          padding: 12px 16px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 13px;
          overflow-x: auto;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        [contenteditable] li {
          margin-bottom: 0.3em;
        }
        [contenteditable] a {
          color: var(--gold);
          text-decoration: underline;
        }
        [contenteditable] hr {
          border: none;
          height: 1px;
          background: var(--border);
          margin: 1.5em 0;
        }
        [contenteditable]::-webkit-scrollbar {
          width: 6px;
        }
        [contenteditable]::-webkit-scrollbar-track {
          background: transparent;
        }
        [contenteditable]::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
