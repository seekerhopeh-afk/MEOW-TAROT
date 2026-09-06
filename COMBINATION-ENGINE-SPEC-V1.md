# MEOW TAROT V3.4 — Combination Intelligence

## Goal
Do not score three cards as three isolated meanings. Read the full sequence as a pattern that can amplify, weaken, delay, or redirect the answer.

## Core patterns
- ending/disruption → movement/change → success/opportunity/clarity = transition pattern; the ending is interpreted as part of movement into a new direction.
- pause/block → movement/news/opportunity = delayed opening; positive direction exists but should not be described as immediate.
- past/return + connection → news/return/connection = reconnection pattern.
- connection → distance/ending/blocked = affection may exist, but the direction carries more weight toward withdrawal or closure.
- hidden/unclear → clarity = uncertainty can resolve through later information or disclosure.
- clarity → hidden/unclear = apparent certainty weakens; avoid early conclusions.
- repeated stability/structure/practical = build/stay/organize carries more weight than abrupt change.
- repeated conflict/risk/blocked/disruption = caution cluster; reduce positive certainty and recommend backup plans.
- repeated movement/change with a moving final card = strong directional shift.
- repeated success/opportunity/growth = aligned positive pattern when the final card is not blocked.

## Position weighting
Card 3 remains the directional card, but it is not allowed to overwrite cards 1–2 without explanation. A Major Arcana in card 2 can act as a turning mechanism when its tags actually change the flow; it is not automatically the Key Card.

## Intent rules
- JOB_CHANGE: movement combinations receive extra relevance.
- RETURN: reconnection combinations receive extra relevance.
- THIRD_PARTY: hidden/unclear combinations can increase uncertainty only; they can never be converted into proof of infidelity.

## Frontend contract
The JSON shape remains unchanged: `analysis`, `cards`, `answer`. Combination Intelligence is internal and changes the wording, probability level, and direct answer without forcing a frontend migration.
