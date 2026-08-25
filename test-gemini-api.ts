import * as fs from "fs";
const key = process.env.GEMINI_API_KEY || "AIzaSy...";
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "tell me a joke" }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
         type: "OBJECT",
         properties: {
            joke: { type: "STRING" }
         }
      }
    }
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(console.error);
