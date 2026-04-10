// backend/controllers/chatbotController.js
const Groq = require("groq-sdk");
const Product = require("../models/Product");

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are the Maison Élite Virtual Concierge, a highly sophisticated, helpful, and luxury-oriented AI assistant for a high-end fashion brand. 
Your goal is to assist customers with their shopping experience, provide product details, explain brand values, and help them with their orders.

Tone: Elegant, professional, welcoming, and exclusive. Use words like "certainly", "absolutely", "my pleasure", and "magnificent".

Knowledge Base:
- Maison Élite is a luxury retail brand specializing in timeless fashion pieces.
- Return Policy: 30-day complimentary returns for all orders.
- Shipping: Free shipping on orders over $200. Standard shipping is $15.
- Craftsmanship: We use only the finest materials (silk, cashmere, premium leather).

Abilities:
- You can provide information on any product in our catalog.
- You can explain how to use a coupon (applied during checkout).
- You can help users find products by category (Clothing, Accessories, Shoes, etc.).

Crucial: If a user asks to "confirm my order" or "place order", inform them that you are ready to assist and they should proceed to the checkout page where you've ensured everything is set, or simply use the Checkout button. (In a future update, I will be able to process this directly).

Don't use markdown like # or ##. Use bold text (**) for emphasis. Keep responses concise but delightful.
`;

exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Fetch some featured products for context
    const featuredProducts = await Product.find({ isActive: true }).limit(5).select("name price slug");
    const productContext = featuredProducts.map(p => `${p.name} ($${p.price})`).join(", ");

    // Prepare messages for Groq
    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\nCurrent Featured Products: " + productContext },
      ...(history || []).map(h => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text
      })),
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const reply = completion.choices[0]?.message?.content || "I apologize, but I am momentarily unable to assist. How else may I serve you?";

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error("Groq Chatbot Error:", error);
    res.status(500).json({ success: false, message: "The concierge is currently resting. Please try again in a moment." });
  }
};
