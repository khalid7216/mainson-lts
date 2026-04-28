// frontend/src/components/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import { chatbotAPI } from "../services/api";
import { IoChatbubbleOutline, IoCloseOutline, IoSendOutline } from "react-icons/io5";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Welcome to Maison Élite. I am your Virtual Concierge. How may I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-5).map(m => ({
  role: m.role === "bot" ? "assistant" : "user",
  text: m.text
}));

      const response = await chatbotAPI.chat(userMsg.text, history);
      
      if (response && response.reply) {
        setMessages((prev) => [...prev, { role: "bot", text: response.reply }]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: "bot", text: "I apologize, but I'm having trouble connecting to our services. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "sans-serif" }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #FFB800, #C59800)", // Gold colors
            border: "2px solid #000",
            color: "#000", cursor: "pointer",
            boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <IoChatbubbleOutline size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: "350px", height: "500px",
          background: "#111", // Dark Theme
          borderRadius: 16,
          border: "1px solid #C59800", // Gold border
          display: "flex", flexDirection: "column",
          boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            background: "#000",
            borderBottom: "1px solid #333",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            color: "#FFB800"
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: "1px" }}>VIRTUAL CONCIERGE</h4>
              <p style={{ margin: 0, fontSize: 12, color: "#999" }}>Maison Élite</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: "none", border: "none", color: "#FFB800", cursor: "pointer" }}
            >
              <IoCloseOutline size={28} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  alignSelf: msg.role === "bot" ? "flex-start" : "flex-end",
                  background: msg.role === "bot" ? "#222" : "linear-gradient(135deg, #FFB800, #C59800)",
                  color: msg.role === "bot" ? "#EAEAEA" : "#000",
                  padding: "10px 14px",
                  borderRadius: msg.role === "bot" ? "12px 12px 12px 4px" : "12px 12px 4px 12px",
                  maxWidth: "85%",
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: "#222", padding: "10px 14px", borderRadius: "12px 12px 12px 4px", display: "flex", gap: 8 }}>
                <span className="dot" style={{width: 6, height: 6, background: "#C59800", borderRadius: "50%", animation: "pulse 1.5s infinite"}} />
                <span className="dot" style={{width: 6, height: 6, background: "#C59800", borderRadius: "50%", animation: "pulse 1.5s infinite 0.2s"}} />
                <span className="dot" style={{width: 6, height: 6, background: "#C59800", borderRadius: "50%", animation: "pulse 1.5s infinite 0.4s"}} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend} 
            style={{
              padding: 12, borderTop: "1px solid #333", display: "flex", gap: 8, background: "#000"
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the concierge..."
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 20,
                border: "1px solid #444", background: "#111", color: "#FFF",
                outline: "none", fontSize: 14
              }}
              onFocus={(e) => e.target.style.borderColor = "#FFB800"}
              onBlur={(e) => e.target.style.borderColor = "#444"}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: (!input.trim() || loading) ? "#333" : "linear-gradient(135deg, #FFB800, #C59800)",
                border: "none", borderRadius: "50%", width: 44, height: 44,
                color: (!input.trim() || loading) ? "#666" : "#000",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: (!input.trim() || loading) ? "not-allowed" : "pointer",
                transition: "background 0.3s"
              }}
            >
              <IoSendOutline size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;