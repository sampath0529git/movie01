import { Type } from "@google/genai";
const key = process.env.GEMINI_API_KEY;
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "tell me about batman" }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seoTitle: { type: Type.STRING, description: "Highly optimized, click-bait style SEO title tag (under 60 characters) starting with the primary keyword." },
          metaDescription: { type: Type.STRING, description: "Highly persuasive meta description for high CTR (under 150 chars), including 'Watch Free/1080p'." },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of exactly 15 high-volume, low-competition long-tail streaming search queries." },
          articleBody: { type: Type.STRING, description: "A detailed, SEO-optimized 800-1000 word article body in Markdown format." },
          schemaMarkup: { 
            type: Type.STRING, 
            description: "Valid JSON-LD schema (Movie or TVSeries) represented as a JSON string." 
          }
        }
      }
    }
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(console.error);
