// frontend/src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import { chatbotAPI } from "../services/api";
import { IoChatbubbleEllipsesOutline, IoCloseOutline, IoSend, IoSparkles } from "react-icons/io5";

const ChatWidget = () => {
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState([
    { role: "bot", text: "Welcome to Maison Élite. I am your Virtual Concierge. How may I assist you today?" }
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const chatEndRef                    = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // We pass the last few messages as history (max 6 for context brevity)
      const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));
      const res = await chatbotAPI.chat(input, history);
      
      if (res.success) {
        setMessages(prev => [...prev, { role: "bot", text: res.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "I apologize, but I'm having trouble connecting. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000, fontFamily: "inherit" }}>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            border: "none", color: "#000", cursor: "pointer",
            boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform .3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="hover-scale"
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <IoChatbubbleEllipsesOutline size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: "clamp(320px, 90vw, 400px)",
          height: "clamp(450px, 70vh, 600px)",
          background: "var(--card)",
          borderRadius: 20,
          border: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
          overflow: "hidden",
          animation: "slideIn .4s ease-out",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 24px",
            background: "linear-gradient(to right, rgba(201,168,76,0.1), transparent)",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--emerald)", boxShadow: "0 0 10px var(--emerald)" }} />
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Virtual Concierge</h4>
                <p style={{ margin: 0, fontSize: 11, color: "var(--dim)" }}>Maison Élite Boutique</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.role === "user" ? "var(--gold)" : "var(--lift)",
                  color: m.role === "user" ? "#000" : "var(--text)",
                  fontSize: 14, lineHeight: 1.5,
                  boxShadow: m.role === "user" ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
                }}>
                  {m.text}
                </div>
                <p style={{ fontSize: 10, color: "var(--dim)", marginTop: 4, textAlign: m.role === "user" ? "right" : "left" }}>
                  {m.role === "user" ? "You" : "Concierge"}
                </p>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "8px 12px", background: "var(--lift)", borderRadius: 12 }}>
                <div className="dot-pulse" style={{ width: 6, height: 6, background: "var(--muted)", borderRadius: "50%" }} />
                <div className="dot-pulse" style={{ width: 6, height: 6, background: "var(--muted)", borderRadius: "50%", animationDelay: ".2s" }} />
                <div className="dot-pulse" style={{ width: 6, height: 6, background: "var(--muted)", borderRadius: "50%", animationDelay: ".4s" }} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} style={{ padding: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
            <input
              type="text"
              placeholder="How can I assist you?"
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                flex: 1, height: 44, borderRadius: 22, border: "1px solid var(--border)",
                background: "var(--input)", color: "var(--text)", padding: "0 20px",
                fontSize: 14, outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: input.trim() ? "var(--gold)" : "var(--border2)",
                border: "none", color: "#000", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .2s",
              }}
            >
              <IoSend size={18} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dot-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
