import { Router } from "express";
import https from "https";
import http from "http";

const router = Router();

let recitersCache: { data: unknown; expiresAt: number } | null = null;
const RECITERS_TTL_MS = 6 * 60 * 60 * 1000;

router.get("/quran/reciters", async (req, res) => {
  try {
    const now = Date.now();
    if (recitersCache && now < recitersCache.expiresAt) {
      res.setHeader("Cache-Control", "public, max-age=21600, stale-while-revalidate=3600");
      res.setHeader("X-Cache", "HIT");
      res.json(recitersCache.data);
      return;
    }

    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://mp3quran.net/api/v3/reciters?language=ar", {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      if (recitersCache) {
        res.setHeader("X-Cache", "STALE");
        res.json(recitersCache.data);
        return;
      }
      res.status(response.status).json({ error: "Failed to fetch reciters" });
      return;
    }
    const data = await response.json();
    recitersCache = { data, expiresAt: now + RECITERS_TTL_MS };
    res.setHeader("Cache-Control", "public, max-age=21600, stale-while-revalidate=3600");
    res.setHeader("X-Cache", "MISS");
    res.json(data);
  } catch (err) {
    req.log?.error({ err }, "Failed to fetch reciters");
    if (recitersCache) {
      res.setHeader("X-Cache", "STALE");
      res.json(recitersCache.data);
      return;
    }
    res.status(500).json({ error: "Failed to fetch reciters" });
  }
});

const ALLOWED_AUDIO_HOSTS = [
  "server6.mp3quran.net",
  "server7.mp3quran.net",
  "server8.mp3quran.net",
  "server10.mp3quran.net",
  "server11.mp3quran.net",
  "server12.mp3quran.net",
  "cdn.islamic.network",
  "audio.qurancdn.com",
  "download.quranicaudio.com",
  "verses.quran.com",
  "mp3quran.net",
];

router.get("/quran/audio", (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: "url query parameter is required" });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: "Only http/https URLs are allowed" });
    return;
  }

  const isAllowed = ALLOWED_AUDIO_HOSTS.some(
    (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith("." + host),
  );
  if (!isAllowed) {
    res.status(403).json({ error: "Audio host not allowed" });
    return;
  }

  const lib = parsedUrl.protocol === "https:" ? https : http;

  const proxyReq = lib.get(
    url,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AzkarApp/1.0)",
        Range: (req.headers.range as string) ?? "",
      },
      timeout: 15000,
    },
    (proxyRes) => {
      res.setHeader("Content-Type", proxyRes.headers["content-type"] || "audio/mpeg");
      if (proxyRes.headers["content-length"]) {
        res.setHeader("Content-Length", proxyRes.headers["content-length"]);
      }
      if (proxyRes.headers["content-range"]) {
        res.setHeader("Content-Range", proxyRes.headers["content-range"]);
      }
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=604800, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.statusCode = proxyRes.statusCode || 200;
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.status(502).json({ error: "Failed to fetch audio" });
    }
  });

  req.on("close", () => proxyReq.destroy());
});

export default router;
