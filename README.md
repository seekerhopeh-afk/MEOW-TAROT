# MEOW TAROT

เว็บ React/Vite พร้อม Deploy บน Vercel

## Deploy แบบง่าย
1. สร้าง repository ใหม่บน GitHub
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น repository
3. เข้า Vercel แล้วเลือก Add New > Project
4. Import repository นี้
5. ใน Project Settings > Environment Variables เพิ่ม
   - Name: ANTHROPIC_API_KEY
   - Value: API key ของคุณจาก Anthropic
6. กด Deploy
7. แชร์ลิงก์ `https://ชื่อโปรเจกต์.vercel.app` ให้เพื่อนได้เลย

เพื่อนของคุณไม่ต้องติดตั้งอะไร เปิดผ่าน browser ได้ทันที

## หมายเหตุสำคัญ
API key ถูกใช้งานเฉพาะฝั่ง server (`/api/reading`) และไม่ถูกฝังใน browser code
