import { Router } from "express";
import https from "https";
import http from "http";

const router = Router();

router.get("/quran/reciters", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://mp3quran.net/api/v3/reciters?language=ar");
    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch reciters" });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    req.log?.error({ err }, "Failed to fetch reciters");
    res.status(500).json({ error: "Failed to fetch reciters" });
  }
});

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

  const lib = parsedUrl.protocol === "https:" ? https : http;

  const proxyReq = lib.get(url, (proxyRes) => {
    res.setHeader("Content-Type", proxyRes.headers["content-type"] || "audio/mpeg");
    if (proxyRes.headers["content-length"]) {
      res.setHeader("Content-Length", proxyRes.headers["content-length"]);
    }
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.statusCode = proxyRes.statusCode || 200;
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to fetch audio" });
    }
  });

  req.on("close", () => proxyReq.destroy());
});

export default router;
