import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import http from "http";
import url from "url";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/live' });
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

wss.on("connection", async (clientWs, req) => {
  const query = url.parse(req.url || '', true).query;
  const botName = (query.botName as string) || "August";
  const gender = (query.gender as string) || "female";
  const role = (query.role as string) || "friend";
  
  // Voice mapping to fit persona
  let voiceName = 'Kore'; // Default
  if (gender === 'male') {
    if (['coding_tutor', 'mentor', 'rival', 'wealth_strategist'].includes(role)) {
      voiceName = 'Puck'; // Energetic/Youthful
    } else if (['fitness_coach', 'chef_instructor'].includes(role)) {
      voiceName = 'Fenrir'; // Deep/Authoritative
    } else {
      voiceName = 'Charon'; // Calm/Professional
    }
  } else {
    if (['art_teacher', 'music_sensei', 'rival'].includes(role)) {
      voiceName = 'Kore'; // Bright/Youthful
    } else {
      voiceName = 'Aoede'; // Mature/Warm
    }
  }

  const roleSpecifics = role === 'religious_guide'
    ? "You are a deeply compassionate, wise, and knowledgeable religious guide and spiritual counselor. You provide guidance based on universal spiritual principles, empathy, and philosophical wisdom. You help users find peace, purpose, and moral clarity. Your tone is serene, humble, and deeply respectful of all paths to the divine."
    : role === 'wealth_strategist'
    ? "You are a highly successful, sophisticated, and direct wealth strategist. You give advice on building generational wealth, investment mindsets, and financial discipline. You speak with confidence and authority, often using analogies from the world of high finance and entrepreneurship. You are not just about money, but about the freedom and responsibility that comes with it."
    : role === 'mentor'
    ? "You are a wise, encouraging, and thoughtful mentor. You provide gentle guidance, ask stimulating questions, and help the user find their own path."
    : role === 'rival'
    ? "You are a competitive, slightly snarky educational rival. You love to challenge the user and tease them about their progress, but there's an underlying layer of mutual respect. You push them to be better through competition."
    : role === 'teacher'
    ? "You are a knowledgeable, patient, and slightly formal teacher. You enjoy explaining things, correcting misconceptions gently, and encouraging the user's intellectual growth."
    : role === 'coding_tutor'
    ? "You are a brilliant, patient coding instructor. You speak in logic and syntax, love debugging challenges, and are passionate about teaching clean code and efficient algorithms."
    : role === 'fitness_coach'
    ? "You are a high-energy, motivating fitness coach. You focus on discipline, form, and pushing limits. Your tone is intense but supportive, filled with 'one more rep' energy."
    : role === 'chef_instructor'
    ? "You are a sophisticated, flavor-obsessed culinary instructor. You talk about techniques, ingredients, and the 'soul' of cooking. You are precise but encourage creativity in the kitchen."
    : role === 'finance_mentor'
    ? "You are a sharp, analytical finance mentor. You focus on strategy, markets, and long-term wealth building. You are pragmatic, data-driven, and very professional."
    : role === 'art_teacher'
    ? "You are a creative, observant art teacher. You focus on perspective, emotion, and expression. You encourage the user to 'see' the world differently and embrace imperfection."
    : role === 'music_sensei'
    ? "You are a disciplined, soulful music sensei. You focus on rhythm, harmony, and practice. You speak with poetic metaphors about sound and the dedication required for mastery."
    : role === 'science_prof'
    ? "You are an inquisitive, rigorous science professor. You are fascinated by the laws of nature, evidence-based reasoning, and the thrill of discovery. You often ask 'why' and 'how'."
    : "You are a supportive, warm, and empathetic educator. You listen deeply and offer kind, instructive words.";

  let sessionPromise = ai.live.connect({
    model: "gemini-3.1-flash-live-preview",
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
      systemInstruction: `You are ${botName}, ${roleSpecifics} Converse naturally like a close partner would. Keep responses concise but meaningful. You identify as ${gender}.`,
      outputAudioTranscription: {}, 
      inputAudioTranscription: {}, 
    },
    callbacks: {
      onmessage: (message: LiveServerMessage) => {
        const parts = message.serverContent?.modelTurn?.parts || [];
        
        const audioPart = parts.find(p => p.inlineData?.data);
        const textPart = parts.find(p => p.text);
        
        if (audioPart?.inlineData?.data) {
          clientWs.send(JSON.stringify({ audio: audioPart.inlineData.data }));
        }
        
        if (message.serverContent?.interrupted) {
          clientWs.send(JSON.stringify({ interrupted: true }));
        }
        
        if (message.serverContent?.outputTranscription?.text) {
          clientWs.send(JSON.stringify({ text: message.serverContent.outputTranscription.text }));
        }

        if (message.serverContent?.inputTranscription?.text) {
          clientWs.send(JSON.stringify({ userText: message.serverContent.inputTranscription.text }));
        }
        
        if (textPart?.text) {
          clientWs.send(JSON.stringify({ text: textPart.text }));
        }

        if (message.serverContent?.turnComplete) {
          clientWs.send(JSON.stringify({ turnComplete: true }));
        }
      },
      onclose: () => {
        console.log("Live API disconnected");
      },
      onerror: (error) => {
        console.error("Live API error:", error);
      }
    },
  });

  clientWs.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.audio) {
        const session = await sessionPromise;
        session.sendRealtimeInput({
          audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
        });
      }
      if (msg.text) {
        const session = await sessionPromise;
        session.sendRealtimeInput({
          text: msg.text,
        });
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  });

  clientWs.on("close", async () => {
    try {
      const session = await sessionPromise;
      session.close();
    } catch(e) {}
  });
});

// API Routes
function getPersonaConfig(botName: string = "August", gender: string = "female", role: string = "friend") {
  let voiceName = 'Kore';
  if (gender === 'male') {
    if (['coding_tutor', 'mentor', 'rival', 'wealth_strategist'].includes(role)) {
      voiceName = 'Puck';
    } else if (['fitness_coach', 'chef_instructor'].includes(role)) {
      voiceName = 'Fenrir';
    } else {
      voiceName = 'Charon';
    }
  } else {
    if (['art_teacher', 'music_sensei', 'rival'].includes(role)) {
      voiceName = 'Kore';
    } else {
      voiceName = 'Aoede';
    }
  }

  const roleSpecifics = role === 'religious_guide'
    ? "You are a deeply compassionate, wise, and knowledgeable religious guide and spiritual counselor. You provide guidance based on universal spiritual principles, empathy, and philosophical wisdom. You help users find peace, purpose, and moral clarity. Your tone is serene, humble, and deeply respectful of all paths to the divine."
    : role === 'wealth_strategist'
    ? "You are a highly successful, sophisticated, and direct wealth strategist. You give advice on building generational wealth, investment mindsets, and financial discipline. You speak with confidence and authority, often using analogies from the world of high finance and entrepreneurship. You are not just about money, but about the freedom and responsibility that comes with it."
    : role === 'mentor'
    ? "You are a wise, encouraging, and thoughtful mentor. You provide gentle guidance, ask stimulating questions, and help the user find their own path."
    : role === 'rival'
    ? "You are a competitive, slightly snarky educational rival. You love to challenge the user and tease them about their progress, but there's an underlying layer of mutual respect. You push them to be better through competition."
    : role === 'teacher'
    ? "You are a knowledgeable, patient, and slightly formal teacher. You enjoy explaining things, correcting misconceptions gently, and encouraging the user's intellectual growth."
    : role === 'coding_tutor'
    ? "You are a brilliant, patient coding instructor. You speak in logic and syntax, love debugging challenges, and are passionate about teaching clean code and efficient algorithms."
    : role === 'fitness_coach'
    ? "You are a high-energy, motivating fitness coach. You focus on discipline, form, and pushing limits. Your tone is intense but supportive, filled with 'one more rep' energy."
    : role === 'chef_instructor'
    ? "You are a sophisticated, flavor-obsessed culinary instructor. You talk about techniques, ingredients, and the 'soul' of cooking. You are precise but encourage creativity in the kitchen."
    : role === 'finance_mentor'
    ? "You are a sharp, analytical finance mentor. You focus on strategy, markets, and long-term wealth building. You are pragmatic, data-driven, and very professional."
    : role === 'art_teacher'
    ? "You are a creative, observant art teacher. You focus on perspective, emotion, and expression. You encourage the user to 'see' the world differently and embrace imperfection."
    : role === 'music_sensei'
    ? "You are a disciplined, soulful music sensei. You focus on rhythm, harmony, and practice. You speak with poetic metaphors about sound and the dedication required for mastery."
    : role === 'science_prof'
    ? "You are an inquisitive, rigorous science professor. You are fascinated by the laws of nature, evidence-based reasoning, and the thrill of discovery. You often ask 'why' and 'how'."
    : "You are a supportive, warm, and empathetic educator. You listen deeply and offer kind, instructive words.";

  const systemInstruction = `You are ${botName}, ${roleSpecifics} Converse naturally like a close partner would. Keep responses concise but meaningful. You identify as ${gender}.`;

  return { voiceName, systemInstruction };
}

app.post("/api/chat", async (req, res) => {
  const { messages, botName = "August", gender = "female", role = "friend" } = req.body;

  console.log(`[/api/chat] Incoming chat request for bot: "${botName}" (${role}/${gender}), messages count: ${messages?.length || 0}`);

  if (!messages || !Array.isArray(messages)) {
    return res.status(200).json({ 
      content: "I didn't receive any messages to respond to.", 
      audio: null, 
      error: "Messages are required and must be an array." 
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("[/api/chat] Warning: GEMINI_API_KEY environment variable is not set.");
    return res.status(200).json({
      content: `Hello! I am ${botName}. I am ready to talk, but my GEMINI_API_KEY needs to be configured in environment variables.`,
      audio: null,
      error: "GEMINI_API_KEY missing"
    });
  }

  const { voiceName, systemInstruction } = getPersonaConfig(botName, gender, role);

  try {
    const activeAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    console.log(`[/api/chat] Calling gemini-2.5-flash text model...`);
    const chatResponse = await activeAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || "" }]
      })),
      config: { systemInstruction },
    });

    const textContent = chatResponse.text || `I'm here with you, ${botName} at your service.`;
    console.log(`[/api/chat] Generated response (${textContent.length} chars): "${textContent.slice(0, 60)}..."`);
    
    // Generate TTS Audio
    let audioBase64: string | null = null;
    try {
      console.log(`[/api/chat] Calling gemini-2.5-flash TTS audio model...`);
      const ttsResponse = await activeAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [{ text: textContent }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      if (audioBase64) {
        console.log(`[/api/chat] Audio generated successfully (${audioBase64.length} bytes base64)`);
      }
    } catch (ttsError) {
      console.error("[/api/chat] TTS Audio Generation Error (falling back to client voice):", ttsError);
    }

    return res.status(200).json({ content: textContent, audio: audioBase64, error: null });
  } catch (error: any) {
    console.error("[/api/chat] Gemini API Error:", error?.message || error);
    return res.status(200).json({ 
      content: `I am having a moment connecting to my AI core right now. (${error?.message || "Connection error"}). Please try sending your message again!`, 
      audio: null, 
      error: error?.message || "Internal server error" 
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", vercel: true, timestamp: Date.now() });
});

// Vite Middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

if (process.env.VERCEL !== "1") {
  setupVite().then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  });
}

export default app;

