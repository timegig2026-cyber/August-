import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  console.log("Connecting...");
  const session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        tools: [{ googleSearch: {} }],
        responseModalities: [Modality.AUDIO],
      },
      callbacks: {
        onopen: () => console.log('open'),
        onerror: (e) => console.log('error', e),
        onclose: () => console.log('close'),
        onmessage: (e) => console.log('message', e)
      }
    });
    console.log("Connected successfully");
    await new Promise(r => setTimeout(r, 2000));
    session.sendRealtimeInput({text: "hello"});
    await new Promise(r => setTimeout(r, 5000));
    session.close();
}
test();
