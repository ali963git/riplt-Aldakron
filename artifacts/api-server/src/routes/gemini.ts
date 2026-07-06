import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

router.post("/gemini/stream", async (req, res) => {
  const { prompt, systemInstruction } = req.body as {
    prompt: string;
    systemInstruction?: string;
  };

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    res
      .status(503)
      .json({ error: "GEMINI_API_KEY / GOOGLE_API_KEY غير متوفر. يرجى إضافة مفتاح API في إعدادات المشروع." });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const contents = systemInstruction
      ? [
          { role: "user" as const, parts: [{ text: systemInstruction }] },
          { role: "model" as const, parts: [{ text: "حسناً، سأساعدك." }] },
          { role: "user" as const, parts: [{ text: prompt }] },
        ]
      : [{ role: "user" as const, parts: [{ text: prompt }] }];

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    req.log?.error({ err }, "Gemini stream error");
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

export default router;
