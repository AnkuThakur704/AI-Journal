import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv"

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

async function analyser(text) {

try{const prompt = `
You are an AI that analyzes personal journal entries.

Return ONLY valid JSON in this format:

{
"emotion": "one lowercase emotion word",
"keywords": ["3-5 important keywords from the text"],
"summary": "a short one sentence summary of the emotional state"
}

Rules:
- Emotion must be exactly ONE lowercase word (example: calm, happy, anxious, reflective, focused).
- Keywords must come from the journal text.
- The summary must describe the emotional state.
- Do NOT include explanations.
- Do NOT include markdown.
- Return ONLY the JSON object.

Journal Entry:
${text}
`

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    temperature: 0.2
  }
})

const cleaned = response.text.replace(/```json|```/g, "").trim()

return cleaned}
catch(error){
  return null
}
}

export default analyser;