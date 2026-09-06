# MEOW TAROT V3.8 — Spread Confidence & Contradiction Engine

## Goal
ประเมินว่าไพ่ 3 ใบตอบคำถามเดียวกันอย่างสอดคล้องกันมากน้อยเพียงใด โดยไม่ตีความ `confidence` เป็นความน่าจะเป็นที่เหตุการณ์จริงจะเกิดขึ้น

## Signals
- relationship: support / flow / turn / tension
- semantic lean: ไพ่แต่ละใบเอนไปทางสนับสนุน ระวัง หรือเป็นกลางต่อ intent
- direction card: ไพ่ใบที่ 3 ได้รับน้ำหนักมากกว่า เพราะเป็นทิศทาง/คำตอบ
- combination pattern: pattern ที่ชัดเพิ่ม confidence; uncertainty ลด confidence
- intent precision: ใช้คะแนนจาก V3.7 ประกอบ

## Confidence
- HIGH: 75–95 — ไพ่ส่วนใหญ่ตอบไปทิศเดียวกันและปลายทางชัด
- MEDIUM: 48–74 — มีภาพหลัก แต่ยังมีเงื่อนไขหรือแรงสวนบางส่วน
- LOW: 20–47 — ไพ่ขัดกันสูง/ปลายทางไม่ชัด/หลักฐานเชิงสัญลักษณ์ไม่พอ

## Contradiction
- LOW: ไม่มีแรงสวนสำคัญ
- MEDIUM: มี tension 1 จุด หรือ semantic lean แยกสองทาง
- HIGH: มี tension ตั้งแต่ 2 จุด หรือไพ่แยกสองทางพร้อมปลายทางไม่ชัด

## Answer Policy
- HIGH: อนุญาตให้ใช้ภาษาสรุปชัดขึ้น แต่ยังคงเงื่อนไขตามประเภทคำถาม
- MEDIUM: ใช้ภาษาว่า “มีแนวโน้ม/มีเงื่อนไข” และบอกจุดชี้ขาด
- LOW/HIGH contradiction: ห้ามฟันธง ให้ตอบแบบ CONDITIONAL/MIXED และอธิบายว่าชุดไพ่ขัดกันตรงไหน
- THIRD_PARTY confidence capped at 58 เพราะไพ่ไม่สามารถพิสูจน์ข้อเท็จจริงหรือการนอกใจ
- FEELINGS confidence capped at 72 เพราะไม่อ้างว่ารู้ความคิดส่วนตัวของอีกฝ่ายเป็นข้อเท็จจริง

## JSON
เพิ่ม `spread` แบบ non-breaking:
```json
{
  "spread": {
    "confidence_score": 68,
    "confidence_level": "ปานกลาง",
    "contradiction_level": "ต่ำ",
    "reasons": ["..."],
    "note": "confidence คือความสอดคล้องของไพ่กับคำถาม ไม่ใช่ความน่าจะเป็นว่าเหตุการณ์จริงจะเกิดขึ้น"
  }
}
```
