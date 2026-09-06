# V3.9 Hidden Pattern & Key Insight Engine

## เป้าหมาย
ค้นหาประเด็นที่ถูกย้ำหรือเกิดจากโครงสร้างของไพ่ทั้ง 3 ใบ โดยไม่แต่งข้อเท็จจริงที่ไม่มีในไพ่ และเลือก Key Insight เพียง 1 จุดที่สำคัญที่สุดต่อ intent ของคำถาม

## Hidden Pattern
ระบบตรวจ 4 แหล่งหลัก: ธีม semantic ที่ซ้ำอย่างน้อย 2 ใบ, ไพ่กลางที่ทำหน้าที่เป็น turning point, sequence pattern จาก Combination Intelligence, และ contradiction สูงจาก Spread Confidence Engine

ธีมที่ซ้ำ 2–3 ใบถือว่ามีน้ำหนักมากกว่าสัญญาณจากไพ่ใบเดียว แต่ไม่เปลี่ยนสัญญาณเชิงสัญลักษณ์ให้เป็นข้อเท็จจริงภายนอก เช่น hidden/unclear ไม่เท่ากับ “มีคนอื่นจริง”

## Key Insight
เลือกจากความเกี่ยวข้องกับ exact intent, ตำแหน่งไพ่, semantic tags, Major status เล็กน้อย และน้ำหนักของไพ่ใบที่ 3 ซึ่งเป็นทิศทาง/คำตอบ ไพ่ Major ไม่ได้ชนะอัตโนมัติ

- ไพ่ใบ 1: แก่นสถานการณ์/รากเดิม
- ไพ่ใบ 2: เงื่อนไขหรือจุดเปลี่ยน
- ไพ่ใบ 3: ทิศทางสุดท้าย มีน้ำหนักสูงสุดเมื่อ intent เป็น outcome/probability

## Reality Boundary
THIRD_PARTY: ความลับ/ความไม่ชัดเพิ่มได้เพียง ambiguity และ trust concern ไม่ใช่ proof
FEELINGS: อ่าน relational signals ไม่อ้างว่าเข้าถึง private thoughts
INVESTMENT/health/legal: Insight ต้องเป็น reflection/risk awareness ไม่ใช่คำสั่งหรือข้อเท็จจริงเฉพาะทาง

## Frontend JSON
เพิ่มโดยไม่ทำลาย field เดิม:

```json
{
  "hidden_pattern": {
    "dominant": "...",
    "patterns": []
  },
  "key_insight": {
    "card_index": 2,
    "card_name": "...",
    "insight": "..."
  }
}
```

## UI rule
หน้าคำทำนายไม่แสดงความหมายไพ่แบบแยกทีละใบแล้ว แสดงคำตอบรวม + confidence + hidden pattern + key insight และชื่อไพ่ 3 ใบตามลำดับเท่านั้น
