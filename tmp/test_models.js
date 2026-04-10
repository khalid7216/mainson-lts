const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: "backend/.env" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
    // Wait, listModels isn't on the model instance, it's on a different client usually or via a specific method.
    // In @google/generative-ai, you might need a different approach for listing.
    console.log("Listing models is not directly supported in this SDK version like this.");
  } catch (err) {
    console.error(err);
  }
}

// Better approach: Test common names
async function testModels() {
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];
  for (const m of models) {
    try {
       const model = genAI.getGenerativeModel({ model: m });
       const result = await model.generateContent("test");
       console.log(`✅ Success with: ${m}`);
       return m;
    } catch (err) {
       console.log(`❌ Failed with: ${m} - ${err.message}`);
    }
  }
}

testModels();
