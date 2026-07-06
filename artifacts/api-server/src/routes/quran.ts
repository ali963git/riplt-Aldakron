import { Router } from "express";
import type { IncomingMessage } from "http";
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
  "server13.mp3quran.net",
  "server14.mp3quran.net",
  "cdn.islamic.network",
  "audio.qurancdn.com",
  "download.quranicaudio.com",
  "verses.quran.com",
  "mp3quran.net",
  // CDN / redirect targets that mp3quran servers forward to
  "cdn.mp3quran.net",
  "podcasts.qurancentral.com",
  "ia800305.us.archive.org",
  "archive.org",
];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_AUDIO_HOSTS.some(
    (host) => hostname === host || hostname.endsWith("." + host),
  );
}

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

  if (!isAllowedHost(parsedUrl.hostname)) {
    res.status(403).json({ error: "Audio host not allowed" });
    return;
  }

  const rangeHeader = (req.headers.range as string) ?? "";
  const activeRequests: ReturnType<typeof https.get>[] = [];
  let aborted = false;

  function fetchUrl(targetUrl: string, redirectCount = 0): void {
    if (aborted) return;
    if (redirectCount > 8) {
      if (!res.headersSent) res.status(502).json({ error: "Too many redirects" });
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      if (!res.headersSent) res.status(502).json({ error: "Invalid redirect URL" });
      return;
    }

    // Re-validate every hop: protocol and allowlist (prevents SSRF via open redirects)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      if (!res.headersSent) res.status(403).json({ error: "Redirect to non-http(s) protocol blocked" });
      return;
    }
    if (!isAllowedHost(parsed.hostname)) {
      if (!res.headersSent) res.status(403).json({ error: "Redirect to non-allowlisted host blocked" });
      return;
    }

    const lib = parsed.protocol === "https:" ? https : http;

    const proxyReq = lib.get(
      targetUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AzkarApp/1.0; Islamic/Audio)",
          ...(redirectCount === 0 ? { Range: rangeHeader } : {}),
          "Accept": "audio/mpeg, audio/*, */*",
          "Accept-Encoding": "identity",
        },
        timeout: 20000,
      },
      (proxyRes: IncomingMessage) => {
        if (aborted) { proxyRes.resume(); return; }

        const status = proxyRes.statusCode ?? 0;

        // Follow HTTP redirects (301, 302, 303, 307, 308)
        if (status >= 300 && status < 400) {
          const rawLocation = proxyRes.headers["location"];
          const location = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
          proxyRes.resume(); // drain the redirect response body
          if (location) {
            // Resolve relative redirects against current URL
            let nextUrl: string;
            try {
              nextUrl = new URL(location, targetUrl).href;
            } catch {
              nextUrl = location;
            }
            fetchUrl(nextUrl, redirectCount + 1);
          } else {
            if (!res.headersSent) res.status(502).json({ error: "Redirect missing Location header" });
          }
          return;
        }

        // Stream the audio response
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
        res.setHeader("Access-Control-Allow-Headers", "Range");
        res.statusCode = status || 200;
        proxyRes.pipe(res);
      },
    );

    activeRequests.push(proxyReq);

    proxyReq.on("error", (err) => {
      if (!aborted && !res.headersSent) {
        req.log?.warn({ err, url: targetUrl }, "Audio proxy fetch error");
        res.status(502).json({ error: "Failed to fetch audio" });
      }
    });

    proxyReq.on("timeout", () => {
      proxyReq.destroy();
      if (!aborted && !res.headersSent) {
        res.status(504).json({ error: "Audio server timed out" });
      }
    });
  }

  fetchUrl(url);

  req.on("close", () => {
    aborted = true;
    activeRequests.forEach((r) => { try { r.destroy(); } catch {} });
  });
});

export default router;
