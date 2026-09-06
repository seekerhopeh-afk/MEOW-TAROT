# MEOW TAROT V3.5 — Natural Language Answer Composer

## Goal
เปลี่ยนผลจาก rule engine ให้เป็นคำตอบภาษาไทยที่ลื่น เป็นธรรมชาติ และไม่ฟังเหมือนข้อความสำเร็จรูป โดยยังคงตรรกะจาก Question Engine, Card Meaning Engine, Answer Intelligence และ Combination Intelligence เดิม

## Core principles
- ตอบ intent ก่อน แล้วค่อยเล่าเหตุผล
- ไพ่ 3 ใบต้องถูกเล่าเป็นเหตุการณ์เดียว ไม่ใช่ 3 คำแปลแยกกัน
- ใช้ deterministic phrase variation: คำถาม + ไพ่ชุดเดิมจะได้สำนวนคงที่ แต่คำถาม/ไพ่ชุดต่างกันสามารถใช้สำนวนต่างกัน
- จำกัดคำตอบหลัก 4–7 ประโยค
- ลดการพูดคำว่า “ไพ่” ซ้ำโดยไม่จำเป็น
- ใช้ภาษาที่เหมือนผู้ให้คำปรึกษา มากกว่าระบบกฎ

## Composer pipeline
1. Direct answer: คงคำตอบตรงคำถามจาก Answer Intelligence
2. Probability wording: คำถาม “จะ...ไหม” แสดงระดับ สูง / ปานกลาง / ต่ำ
3. Narrative arc: สถานการณ์ → ปัจจัยกลาง → แนวโน้ม เชื่อมในประโยคเดียว
4. Combination nuance: เสริมเฉพาะ pattern ที่เปลี่ยนน้ำหนักคำตอบจริง
5. Keyword-specific sentence:
   - เมื่อไหร่ → symbolic timing
   - ทำไม → cause/mechanism
   - ควร...ไหม → actionable advice
   - ความรู้สึกอีกฝ่าย → relationship-signal boundary
6. Context/desired information: แทรกเมื่อมีข้อมูลจริงจากผู้ใช้
7. Heavy questions: ปิดด้วยแนวทางรับมือที่ทำได้จริง

## Variation policy
ใช้ stable hash จาก question + desiredInfo + card IDs + orientation เพื่อเลือก template จึงไม่สุ่มใหม่ทุก render และไม่ทำให้คำตอบกระโดดไปมาเมื่อข้อมูลเหมือนเดิม

## Reality boundary
Natural language ต้องไม่ทำให้ข้อสรุปดูแน่นอนเกิน engine เดิม:
- บุคคลที่สาม: ความลับ/ความไม่ชัด ≠ หลักฐานการนอกใจ
- ความรู้สึกผู้อื่น: อ่านสัญญาณ/ท่าที ไม่อ้างรู้ความคิดเป็นข้อเท็จจริง
- สุขภาพ/การเงิน/การลงทุน: ใช้เพื่อสะท้อน ไม่แทนข้อมูลจริงหรือผู้เชี่ยวชาญ
- อนาคต: แนวโน้มและเงื่อนไข ไม่ใช่เหตุการณ์ที่ถูกกำหนดแล้ว

## Frontend contract
JSON contract เดิมยังคง:
- analysis
- cards
- answer

ดังนั้น frontend ไม่ต้องเปลี่ยนโครงข้อมูลเมื่ออัปเกรดจาก V3.4 เป็น V3.5
