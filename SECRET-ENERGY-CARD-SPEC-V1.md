# MEOW TAROT V3.10 — Secret Energy Card UI & Clarifier Engine

## Purpose
The Secret Energy Card is an optional clarifier opened by the user after the normal 3-card reading. It is not treated as card 4 of the original spread and does not overwrite the main answer.

## UX
- Result page shows one button: `🔮 เปิดไพ่ลับเช็กพลังงาน`.
- The button can be used once per question.
- After opening, one unused tarot card is drawn from the current deck.
- Desktop: the card appears on the left and the energy interpretation on the right.
- Mobile: the card stacks above the interpretation.
- The card enters with a slide/pop animation.

## Clarifier logic
The engine receives the original question, exact intent, the 3-card spread, confidence/contradiction information, and the secret card.

It classifies the secret card as one of:
- SUPPORTS — reinforces the existing direction.
- CAUTIONS — adds a condition or obstacle.
- REDIRECTS — identifies a turning point or a better decision criterion.
- NEUTRAL — expands ambiguity without forcing a new answer.

The interpretation includes:
1. hidden energy meaning through the exact intent,
2. how it relates to the original 3-card reading,
3. whether the original ambiguity makes a clarifier useful,
4. one practical point to consider before deciding.

## Safety / reality boundary
- A secret card never proves infidelity, pregnancy, medical facts, legal outcomes, financial outcomes, or another person's private thoughts.
- THIRD_PARTY remains an ambiguity/trust reading, not evidence.
- INVESTMENT remains risk reflection, not buy/sell advice.
- The original 3-card reading remains primary.

## State rule
A new question resets the Secret Energy Card. Repeated rerolls are disabled so users cannot keep drawing until they get a preferred answer.
