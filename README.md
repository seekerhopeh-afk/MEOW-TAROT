# MEOW TAROT V3.11 — Human Reading Mode

V3.11 keeps all V3.10 reasoning engines internally but simplifies the reader-facing result to: ตอบก่อน → อธิบายสั้น ๆ → สรุป → ไพ่ลับ. Technical diagnostics such as confidence mechanics, Hidden Pattern, Key Insight, question analysis, and personal-fusion text are hidden from the normal reading UI.

# MEOW TAROT V3.3 — AI-style Question → 3-Card Answer Engine

This version adds the mandatory 5-step question analysis contract and structured frontend JSON output. It preserves the V3.2 intent engine and V3.1 card relationship engine, but makes the first 1–2 sentences answer the user's exact intent before any explanation.

Key additions: multi-topic tags, intent summary, timeframe, question weight, keyword signals, fixed 3-card roles, probability labels for yes/no-style questions, symbolic timing, 4–7 sentence synthesized answer, and a JSON bridge (`makeLocalReadingJSON`).

No paid AI/API is required; this remains a local rule-based engine.

## V3.4 Combination Intelligence
V3.4 adds whole-spread pattern scoring. The engine now recognizes transition, delayed-opening, reconnection, closure, clarity-resolution, caution-cluster, stability, movement, and opportunity patterns. These patterns adjust the Answer Intelligence evidence before the direct answer is generated. The frontend JSON contract is unchanged.

## V3.5 — Natural Language Answer Composer
- เพิ่ม deterministic phrase variation เพื่อให้คำตอบไม่ใช้สำนวนเดิมซ้ำทุกครั้ง
- เชื่อมไพ่ 3 ใบเป็น narrative เดียวแบบภาษาธรรมชาติ
- ปรับสำนวนตาม keyword signal: ความเป็นไปได้ / เวลา / สาเหตุ / คำแนะนำ / ความรู้สึกอีกฝ่าย
- รักษาคำตอบหลักไว้ที่ประมาณ 4–7 ประโยค
- Combination Intelligence จาก V3.4 ยังทำงานก่อน Composer เพื่อไม่ให้สำนวนสวยกลบตรรกะ
- JSON contract สำหรับ frontend ยังเหมือนเดิม


## V3.6 — 78-Card Deep Meaning Library
- Adds individually authored contextual meanings for all 56 Minor Arcana cards.
- Preserves contextual meanings for all 22 Major Arcana.
- Adds card-specific reversed nuance and semantic tags.
- Combination Intelligence now uses stronger card-specific signals instead of mostly rank/suit formulas.
- Relationship matching prioritizes turn/tension before generic support.

## V3.7 — Intent × Card Precision Engine
- Adds an exact-intent lens after domain meaning.
- Every card is re-scored for the user's specific intent, not only LOVE/CAREER/MONEY.
- Card 3 has greater intent weight because it carries direction/outcome.
- Adds card-specific intent overrides for high-impact tarot cards.
- Keeps third-party, feelings, and investment reality boundaries intact.

## V3.8 — Spread Confidence & Contradiction Engine
- เพิ่ม confidence 20–95 จากความสอดคล้องของไพ่กับ intent
- ตรวจ contradiction ระดับ ต่ำ/ปานกลาง/สูง
- ไพ่ใบที่ 3 มีน้ำหนักต่อความชัดของผลลัพธ์มากกว่า
- ชุดที่ขัดกันสูงจะถูกบังคับให้ตอบแบบ conditional/mixed แทนการฟันธง
- THIRD_PARTY และ FEELINGS มีเพดาน confidence เพื่อรักษา reality boundary
- เพิ่ม `spread` metadata ใน JSON โดยไม่เปลี่ยนฟิลด์หลักเดิม

## V3.9 — Hidden Pattern & Key Insight Engine
- Detects repeated semantic themes across 2–3 cards.
- Detects middle-card pivots, sequence patterns and high contradiction.
- Selects one intent-aware Key Insight; Major Arcana does not automatically win.
- Preserves reality boundaries for third-party, feelings and high-stakes questions.
- Human-facing UI no longer explains all 3 cards separately; JSON still keeps role_meaning for frontend/internal use.

## V3.10 — Secret Energy Card UI & Clarifier Engine
Adds a one-use optional Secret Energy Card on the result page. The card slides into the left column on desktop while an intent-aware energy explanation appears on the right; mobile stacks the two sections. The clarifier can support, caution, redirect, or expand the original spread, but never replaces the main 3-card reading.
