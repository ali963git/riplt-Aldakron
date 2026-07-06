---
name: Audio proxy SSRF prevention
description: Pattern for safe HTTP proxy with redirect-following in quran.ts
---

The audio proxy (`/api/quran/audio`) follows HTTP 3xx redirects. A naive implementation only validates the initial URL's host against an allowlist, but an allowlisted CDN could redirect to an internal IP or metadata service.

**Rule:** Re-validate both protocol (`http/https` only) and `isAllowedHost(parsed.hostname)` on **every redirect hop** before issuing the next request.

**Why:** Open redirects on CDN servers (e.g. mp3quran.net) can pivot to internal network resources if unchecked.

**How to apply:** In `fetchUrl(targetUrl, redirectCount)`, after parsing the redirect `location` into a URL, call `isAllowedHost()` before `lib.get()`. Return 403 if it fails.
