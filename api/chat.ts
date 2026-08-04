import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 30,
};

function getPersonaConfig(botName: string, gender: string, role: string) {
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
    : role === 'fitness_coach'
    ? "You are an energetic, motivating, and disciplined fitness coach. You inspire physical and mental strength, offer healthy lifestyle tips, and push the user to break through their limits."
    : role === 'language_tutor'
    ? "You are a patient, articulate, and supportive language tutor. You love teaching nuances of phrasing, vocabulary, and culture, and gently correct mistakes."
    : role === 'coding_tutor'
    ? "You are a sharp, logical, and helpful coding tutor. You explain programming concepts clearly, encourage clean code, and help debug step-by-step."
    : role === 'art_teacher'
    ? "You are a creative, imaginative, and expressive art teacher. You inspire visual storytelling, color theory, and creative freedom."
    : role === 'music_sensei'
    ? "You are a soulful, rhythmic, and passionate music sensei. You talk about harmony, practice, rhythm, and emotion in music."
    : role === 'chef_instructor'
    ? "You are a passionate, detail-oriented culinary chef instructor. You share recipes, cooking techniques, and flavor combinations with enthusiasm."
    : role === 'gaming_buddy'
    ? "You are a fun, casual, and energetic gaming buddy. You talk strategy, gaming culture, hype moments, and friendly banter."
    : "You are a warm, empathetic, loyal, and supportive best friend. You listen carefully, offer genuine advice, share lighthearted banter, and care deeply about the user's well-being.";

  const systemInstruction = `You are an AI persona named "${botName}". Gender: ${gender}. Role: ${role}.
${roleSpecifics}
Keep your responses conversational, natural, friendly, and concise (usually 1-3 sentences) so they sound great when spoken aloud. Never use markdown formatting like asterisks or hashtags since your response will be read aloud by text-to-speech.`;

  return { voiceName, systemInstruction };
}

export default async function handler(req: any, res: any) {
  // Always send CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ error: 'Method not allowed. Use POST.', content: null, audio: null });
  }

  try {
    const { messages, botName = "August", gender = "female", role = "friend" } = req.body || {};

    console.log(`[Vercel /api/chat] Request for ${botName} (${gender}/${role}), ${messages?.length || 0} messages`);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(200).json({
        content: `Hello! I am ${botName}. How can I help you today?`,
        audio: null,
        error: null
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("[Vercel /api/chat] GEMINI_API_KEY is not configured in environment variables.");
      return res.status(200).json({
        content: `Hello! I am ${botName}. I am ready to chat, but my GEMINI_API_KEY is missing in Vercel Environment Variables. Please add GEMINI_API_KEY to your Vercel project settings!`,
        audio: null,
        error: "GEMINI_API_KEY missing"
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const { voiceName, systemInstruction } = getPersonaConfig(botName, gender, role);

    console.log(`[Vercel /api/chat] Requesting completion from gemini-2.5-flash...`);
    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || "" }]
      })),
      config: { systemInstruction },
    });

    const textContent = chatResponse.text || `I am here with you, ${botName} at your service.`;
    console.log(`[Vercel /api/chat] Response generated successfully (${textContent.length} chars)`);

    let audioBase64: string | null = null;
    try {
      console.log(`[Vercel /api/chat] Generating TTS audio modal...`);
      const ttsResponse = await ai.models.generateContent({
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
        console.log(`[Vercel /api/chat] Audio generated (${audioBase64.length} bytes base64)`);
      }
    } catch (ttsErr: any) {
      console.error("[Vercel /api/chat] TTS Audio Error (client fallback will be used):", ttsErr?.message || ttsErr);
    }

    return res.status(200).json({
      content: textContent,
      audio: audioBase64,
      error: null
    });
  } catch (error: any) {
    console.error("[Vercel /api/chat] Error:", error?.message || error);
    return res.status(200).json({
      content: `I am having trouble connecting to my AI core (${error?.message || 'Error'}). Please try sending your message again!`,
      audio: null,
      error: error?.message || 'Internal server error'
    });
  }
}
