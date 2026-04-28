const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handleChat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const systemPrompt = "You are a helpful assistant for Maison Élite, a luxury e-commerce store. Help users with product questions, orders, and general shopping queries. Be polite and professional.";

    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content || msg.text || ""
        })),
        { role: "user", content: message }
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile", // Fast and capable 
      });

      const reply = completion.choices[0]?.message?.content || "No reply generated.";
      return res.status(200).json({ success: true, reply });

    } else if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content || msg.text || "" }]
      }));

      const chat = model.startChat({ history });
      // Prepend system prompt to the immediate message if there's no native system prompt parameter for gemini-pro
      const promptToEnsureContext = history.length === 0 ? `System: ${systemPrompt}\nUser: ${message}` : `${message}`;

      const result = await chat.sendMessage(promptToEnsureContext);
      const response = await result.response;

      return res.status(200).json({ success: true, reply: response.text() });

    } else {
      return res.status(503).json({ success: false, message: "Chatbot temporarily unavailable" });
    }

  } catch (error) {
    console.error("Chatbot API Error:", error);
    return res.status(503).json({ success: false, message: "Chatbot temporarily unavailable" });
  }
};
