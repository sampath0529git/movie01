import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "AIzaSy-dummy" });
ai.models.generateContent({
  model: "google/gemini-2.5-flash",
  contents: "hi"
}).then(r => console.log(r)).catch(e => console.error("Error from sdk:", e));
