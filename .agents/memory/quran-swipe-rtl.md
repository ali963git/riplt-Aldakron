---
name: Quran page swipe direction (RTL)
description: Correct touch swipe direction for Quran page navigation in Arabic RTL layout
---

In the Quran reader (RTL layout), page numbers increase left-to-right in the data model but the book opens right-to-left visually.

**Swipe mapping:**
- Swipe LEFT (finger moves left, dx < 0) → next page (quranPage + 1, direction='next')
- Swipe RIGHT (finger moves right, dx > 0) → prev page (quranPage - 1, direction='prev')

**Why:** This matches the existing keyboard mapping (ArrowLeft → next, ArrowRight → prev in RTL) and the Framer Motion animation where 'next' page enters from x=-100 (left side).

**How to apply:** Minimum swipe distance is 45px; ignore if vertical displacement > 85% of horizontal (prevents scroll conflicts). Use `style={{ touchAction: 'pan-y' }}` on the container so vertical scrolling still works.
