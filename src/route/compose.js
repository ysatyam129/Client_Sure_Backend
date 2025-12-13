import express from "express";
import Response from "../models/Response.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const languageMap = {
  "en": "English",
  "hi": "Hindi",
  "mr": "Marathi",
  "gu": "Gujarati",
  "pa": "Punjabi",
  "bn": "Bengali",
  "ta": "Tamil",
  "te": "Telugu",
  "kn": "Kannada"
};

router.post("/", async (req, res) => {
  const { channel, industry, tone, goal, details, language } = req.body;

const prompt = `
आप एक विशेषज्ञ ${channel} संदेश कॉपीराइटर हैं।

महत्वपूर्ण: केवल ${languageMap[language] || "English"} भाषा में उत्तर दें। कोई अन्य भाषा का उपयोग न करें।

उद्योग: ${industry}
टोन स्टाइल: ${tone}
प्राथमिक लक्ष्य: ${goal}

संदर्भ विवरण (वैकल्पिक, यदि सहायक हो):
${JSON.stringify(details || {}, null, 2)}

आपका कार्य:
- एक अत्यधिक प्रभावी, मानव-ध्वनि वाला ${channel} संदेश लिखें।
- इसे संक्षिप्त रखें (अधिकतम 3-4 पंक्तियाँ)।
- इसे स्पष्ट, आकर्षक और लक्ष्य-उन्मुख बनाएं।
- पूरे संदेश में चयनित टोन बनाए रखें।
- मेटाडेटा (उद्योग, टोन, लक्ष्य, आदि) को आउटपुट में दोहराएं नहीं।
- केवल अंतिम संदेश प्रदान करें, कोई स्पष्टीकरण नहीं।
- सुनिश्चित करें कि पूरा उत्तर केवल ${languageMap[language] || "English"} भाषा में हो।
`;


  try {
    console.log("Generating content with prompt:", prompt); // Add logging

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ⭐ IMPORTANT: Use ONLY a model your API key supports
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"  // Fixed model name
    });

    const result = await model.generateContent(prompt);

    const aiText = result.response.text();

    console.log("Gemini response:", aiText); // Add logging

    // Save in DB
    await Response.create({
      channel,
      prompt,
      aiText
    });

    res.json({ ok: true, text: aiText });

  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ ok: false, error: "AI request failed" });
  }
});

export default router;