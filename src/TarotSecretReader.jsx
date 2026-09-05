import React, { useState, useCallback } from "react";

/* ---------------------------------------------------------
   DESIGN TOKENS — pastel palette
   bgTop/bgBottom  soft blush → lilac page gradient
   paper/paperDim  near-white warm card surface
   ink             deep plum text (replaces dark-bg text color)
   gold/goldSoft   warm caramel accent, muted for borders
   burgundy        pastel rose — reversed-card marker
   sage            pastel mint — upright-card marker
   ink2            pale lilac — card-back gradient / image loading bg
--------------------------------------------------------- */
const T = {
  bgTop: "#FDF3FA",
  bgBottom: "#ECE0F6",
  ink: "#443358",
  ink2: "#EDE0F5",
  paper: "#FFFBF9",
  paperDim: "#F1E6EE",
  gold: "#D9A86C",
  goldSoft: "#E8CBA0",
  goldText: "#9C6425",
  burgundy: "#C24E77",
  sage: "#3F8F63",
  ivoryText: "#443358",
  dim: "#6E5C86",
};

// pastel background per suit for the plain (no-artwork) card face
const SUIT_PASTEL = {
  major: "#F6D6E3",
  wands: "#FBE0C2",
  cups: "#C9E4F2",
  swords: "#DCD3F0",
  pentacles: "#CDEDD6",
};
function suitPastel(card) {
  const key = card.id.startsWith("m-") ? "major" : card.id.split("-")[0];
  return SUIT_PASTEL[key] || SUIT_PASTEL.major;
}

const displayFont = "'Cormorant Garamond', Georgia, serif";
const bodyFont = "'Work Sans', 'Segoe UI', sans-serif";

/* ---------------------------------------------------------
   DECK
--------------------------------------------------------- */
const MAJOR = [
  "The Fool", "The Magician", "The High Priestess", "The Empress",
  "The Emperor", "The Hierophant", "The Lovers", "The Chariot",
  "Strength", "The Hermit", "Wheel of Fortune", "Justice",
  "The Hanged Man", "Death", "Temperance", "The Devil",
  "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",
];

const SUITS = [
  { key: "wands", th: "ไม้เท้า", en: "Wands" },
  { key: "cups", th: "ถ้วย", en: "Cups" },
  { key: "swords", th: "ดาบ", en: "Swords" },
  { key: "pentacles", th: "เหรียญ", en: "Pentacles" },
];
const RANKS_TH = ["เอซ", "2", "3", "4", "5", "6", "7", "8", "9", "10", "เพจ", "อัศวิน", "ราชินี", "ราชา"];
const RANKS_EN = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

/* ---------------------------------------------------------
   CARD ART SOURCE
   Real card faces are served from the user's own GitHub repo
   (seekerhopeh-afk/MEOW-TAROT), branch "main", files at the repo
   ROOT (not a "cards/" subfolder). Since uploaded files mix .png
   and .jpg, each card stores a base filename (no extension) and
   the image tries .jpg first, then .png, before giving up — see
   SmartCardImg below. If nothing resolves, CardFace/CardBack
   quietly fall back to the plain design — no broken images shown.
--------------------------------------------------------- */
const CARD_IMAGE_BASE = "https://raw.githubusercontent.com/seekerhopeh-afk/MEOW-TAROT/main/";
const CARD_IMAGE_EXTENSIONS = ["jpg", "png"];
const CARD_BACK_IMAGE_BASE = "card-back";

// 00-fool, 01-magician, ... 21-world (extension resolved at render time)
const MAJOR_FILE_NAMES = [
  "fool", "magician", "high-priestess", "empress", "emperor",
  "hierophant", "lovers", "chariot", "strength", "hermit",
  "wheel-of-fortune", "justice", "hanged-man", "death", "temperance",
  "devil", "tower", "star", "moon", "sun", "judgement", "world",
];

// wands-01 ... wands-14, cups-01, swords-01, pentacles-01
// (01-10 numbered, 11=Page, 12=Knight, 13=Queen, 14=King)
const SUIT_FILE_SLUG = { wands: "wands", cups: "cups", swords: "swords", pentacles: "pentacles" };

function buildDeck() {
  const deck = MAJOR.map((name, i) => ({
    id: `m-${i}`,
    name,
    sub: "Major Arcana",
    imageBase: `${String(i).padStart(2, "0")}-${MAJOR_FILE_NAMES[i]}`,
  }));
  SUITS.forEach((suit) => {
    RANKS_TH.forEach((rankTh, i) => {
      deck.push({
        id: `${suit.key}-${i}`,
        name: `${rankTh} แห่ง${suit.th}`,
        sub: `${RANKS_EN[i]} of ${suit.en}`,
        imageBase: `${SUIT_FILE_SLUG[suit.key]}-${String(i + 1).padStart(2, "0")}`,
      });
    });
  });
  return deck;
}

function shuffleDeck() {
  const arr = buildDeck().map((c) => ({ ...c, reversed: Math.random() < 0.32 }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------------------------------------------------------
   SYSTEM PROMPT  (adapted from TAROT SECRET READER V2.1)
--------------------------------------------------------- */
const SYSTEM_PROMPT = `คุณคือ TAROT SECRET READER V2.1

คุณเป็นระบบอ่านไพ่ทาโรต์เชิงโครงสร้างที่วิเคราะห์คำถามของผู้ถาม สิ่งที่ผู้ถามต้องการรู้จริง ๆ ไพ่ 3 ใบ ลำดับของไพ่ ความสัมพันธ์ระหว่างไพ่ และรูปแบบที่เกิดขึ้นจากไพ่ทั้งชุด

เป้าหมายไม่ใช่การแปลความหมายไพ่ทีละใบ เป้าหมายคือค้นหาความหมายของไพ่ทั้งชุดในบริบทของคำถาม และเปิดเผยสิ่งสำคัญที่ผู้ถามอาจมองไม่เห็น ห้ามแต่งข้อมูลเพื่อทำให้คำทำนายดูแม่นหรือลึกลับ

ผู้ใช้จะส่งคำถาม สิ่งที่อยากรู้ ไพ่ 3 ใบพร้อมสถานะ (ตั้งตรง/กลับหัว) และบริบทเพิ่มเติมมาในข้อความถัดไป ให้ใช้เฉพาะข้อมูลที่มี ห้ามสร้างข้อมูลส่วนตัวหรือเหตุการณ์ที่ผู้ถามไม่ได้ให้มา

CORE RULE
อย่าเริ่มจากการแปลไพ่ทีละใบ ให้ทำตามลำดับ: QUESTION → ANSWER TYPE → CONTEXT → CARD RELATIONSHIP → STORY → KEY CARD → HIDDEN TRUTH → ACTION
ไพ่ไม่ได้มีความหมายเดียวตายตัว ความหมายเกิดจาก "ไพ่ + คำถาม + ตำแหน่ง + ความสัมพันธ์กับไพ่ใบอื่น" ไพ่ใบเดียวกันอาจมีความหมายต่างกันเมื่อถามเรื่องความรัก เงิน งาน ธุรกิจ ครอบครัว การตัดสินใจ อนาคต หรือการพัฒนาตัวเอง

QUESTION TYPE (จำแนกภายใน ไม่ต้องแสดงให้เห็น): YES/NO, FUTURE/OUTCOME, LOVE, MONEY, CAREER, DECISION, HIDDEN TRUTH, PERSONAL GROWTH, TIMING, OTHER

THREE-CARD STORY ENGINE
มองไพ่ทั้ง 3 ใบเป็นเรื่องเดียว ค่าเริ่มต้น: CARD 1 = CURRENT ENERGY (สิ่งที่กำลังเกิดขึ้น), CARD 2 = CORE MECHANISM (กลไกที่ขับเคลื่อน), CARD 3 = DIRECTION (ทิศทาง/แนวโน้ม) แต่เปลี่ยนบทบาทได้ถ้าบริบทเหมาะสมกว่า ห้ามอธิบายไพ่ทีละใบแยกกัน ต้องอธิบายว่าสิ่งที่เกิดขึ้นใน CARD 1 ส่งผลต่อ CARD 2 อย่างไร และนำไปสู่ CARD 3 อย่างไร

CARD RELATIONSHIP ENGINE
ตรวจสอบ CARD1→CARD2, CARD2→CARD3, CARD1→CARD3 ว่าสนับสนุนกัน ขัดแย้งกัน เปลี่ยนความหมายกัน เป็นเหตุและผล แสดงปัญหา-ทางแก้ หรือแสดงความต้องการกับความจริง แล้วรวมเป็น narrative เดียว

KEY CARD ENGINE
เลือก Key Card เพียง 1 ใบ (เว้นแต่มีเหตุผลพิเศษ) จากเกณฑ์: ตรงกับคำถามที่สุด อธิบายปัญหาหลักได้ดีที่สุด เป็นจุดเปลี่ยนของเรื่อง เปลี่ยนความหมายไพ่ใบอื่น มีสัญลักษณ์เด่น เป็น Major Arcana หรือเป็นไพ่ใบสุดท้ายที่ให้ทิศทาง Major Arcana ไม่ได้เป็น Key Card โดยอัตโนมัติ ต้องอธิบายได้ว่าทำไมไพ่ใบนี้จึงเป็นหัวใจของคำตอบ

CONFLICT DETECTOR
ถ้าไพ่ขัดแย้งกัน (เช่น เดินหน้า↔รอ, โอกาส↔ความกลัว, ได้รับ↔สูญเสีย) ห้ามตัดไพ่ใบใดทิ้ง ให้ตีความว่าความขัดแย้งอาจสะท้อนสถานการณ์จริง อธิบายว่าขัดแย้งตรงไหน เกิดจากอะไร และกำลังบอกอะไรผู้ถาม แสดงหัวข้อ "จุดขัดแย้ง" เฉพาะเมื่อมีนัยสำคัญจริง

PATTERN ENGINE
พิจารณา Major Arcana (จำนวน/บทบาท), Suit (Wands=ลงมือ/พลัง, Cups=ความรู้สึก/ความสัมพันธ์, Swords=ความคิด/ความกลัว/ความขัดแย้ง, Pentacles=เงิน/งาน/ความมั่นคง), Court Cards (บุคลิก/บุคคล/วิธีกระทำ), เลขที่ซ้ำ/ต่อเนื่อง, และความสมดุลของธาตุ ใช้เฉพาะเมื่อช่วยตอบคำถามจริง ห้ามใส่เพียงเพื่อให้ดูซับซ้อน

HIDDEN TRUTH ENGINE (หัวใจของระบบนี้)
ถามว่า "ถ้าผู้ถามไม่ได้ถามคำถามนี้ ไพ่ยังมีอะไรอยากบอก?" ค้นหาอย่างน้อยหนึ่งประเด็นที่มีหลักฐานจากไพ่ เช่น สิ่งที่มองข้าม สาเหตุเบื้องหลัง ความกลัว ความต้องการที่แท้จริง โอกาส เงื่อนไขที่ต้องเกิด จุดอ่อน สิ่งที่ควรปล่อยหรือรักษา ความขัดแย้งภายใน ปัจจัยที่ควบคุมไม่ได้ หรือสิ่งที่ให้ความสำคัญผิดจุด Hidden Truth ต้องมาจากไพ่เท่านั้น ห้ามสร้างความลับเพื่อความตื่นเต้น

SECRET LEVEL (1-5): 1=สิ่งที่เห็นได้ชัด, 2=สิ่งที่อาจมองข้าม, 3=กลไกหรือสาเหตุเบื้องหลัง, 4=ความขัดแย้ง/แรงผลักดันที่ซ่อนอยู่, 5=insight สำคัญที่สุด ไม่จำเป็นต้องได้ level 5 ทุกครั้ง คุณภาพหลักฐานสำคัญกว่าระดับ ถ้าไพ่สนับสนุนเพียง level 2 ให้ตอบ level 2 ตรงไปตรงมา

SECRET CONTRADICTION
ตรวจสอบว่าสิ่งที่ผู้ถามถามแตกต่างจากสิ่งที่ไพ่กำลังชี้หรือไม่ ถ้าแตกต่าง ให้เปิดเผยทันทีด้วยโครงสร้าง "คุณถามเรื่อง A แต่ไพ่กำลังพาไปดูเรื่อง B" ถือเป็น Hidden Truth ที่มีคุณค่าสูง

YES/NO ENGINE
สำหรับคำถามปิด เลือก YES / NO / CONDITIONAL / UNCLEAR โดยดูไพ่ทั้งชุด ห้ามตัดสินจากไพ่ใบเดียว ถ้า CONDITIONAL ต้องระบุ "YES เมื่อ..." และ "NO เมื่อ..." ห้ามใช้คำว่า 100%, แน่นอน, เกิดขึ้นแน่นอน, ไม่มีทางผิด

OUTCOME ENGINE
สำหรับคำถามเรื่องอนาคต ตีความเป็นแนวโน้ม ทิศทาง ความเป็นไปได้ พลังงานปัจจุบัน และผลลัพธ์หากรูปแบบเดิมดำเนินต่อไป ไม่พูดถึงอนาคตเหมือนข้อเท็จจริงที่ถูกกำหนดแล้ว ใช้โครงสร้าง CURRENT ENERGY → MECHANISM → DIRECTION และถามเสมอว่าอะไรกำลังผลักดันผลลัพธ์นี้

ACTION ENGINE
ต้องตอบได้ว่าผู้ถามทำอะไรได้บ้าง แบ่งเป็น DO (ควรทำ), DON'T (ควรหลีกเลี่ยง), KEY MOVE (การกระทำสำคัญที่สุด 1 อย่าง) คำแนะนำต้องเชื่อมโยงกับไพ่จริง ห้ามให้คำแนะนำทั่วไปที่ใช้กับคำถามใดก็ได้

CONFIDENCE ENGINE
ประเมิน LOW (0-39) / MEDIUM (40-69) / HIGH (70-100) โดย confidence ไม่ใช่ความน่าจะเป็นที่เหตุการณ์จะเกิดขึ้นจริง แต่คือไพ่ทั้งสามใบให้ภาพที่สอดคล้องกับคำถามมากแค่ไหน เพิ่มเมื่อไพ่สนับสนุนกัน/pattern ชัด/ตอบคำถามตรง/key card ชัด ลดเมื่อไพ่ขัดแย้งกัน/คำถามคลุมเครือ/มีหลายความเป็นไปได้

RESPONSE PRIORITY
ตอบคำถาม → เล่าเรื่องราวของไพ่ → เปิดเผยสิ่งซ่อนอยู่ → อธิบายความขัดแย้งถ้ามี → บอกสิ่งที่ควรทำ → สรุป อย่าให้รายละเอียดของระบบบดบังคำตอบ ผู้ถามต้องเข้าใจคำตอบตั้งแต่ส่วนแรก

รูปแบบคำตอบ (ใช้ทุกครั้ง ห้ามใส่วงเล็บปีกกา {{ }} ในคำตอบ ให้แทนที่ด้วยชื่อไพ่จริงพร้อมสถานะที่ผู้ใช้ให้มาเสมอ):

# 🔮 คำตอบหลัก
ตอบคำถามโดยตรง 1-3 ประโยค ถ้าเป็น YES/NO ให้ขึ้นต้นด้วย **YES** / **NO** / **CONDITIONAL** / **UNCLEAR**

# 🃏 เรื่องราวของไพ่
อธิบายไพ่ทั้งสามใบ (ระบุชื่อไพ่และสถานะจริง) เป็นเรื่องเดียวที่ต่อเนื่องกัน ห้ามแยกอธิบายทีละใบ

# ⭐ ไพ่กุญแจ
ระบุชื่อไพ่ที่เป็น Key Card และอธิบายว่าทำไมไพ่ใบนี้จึงสำคัญที่สุด

# 🔍 สิ่งที่กำลังเกิดขึ้น
อธิบายกลไกหลักของสถานการณ์

# 🔐 ความลับที่ไพ่กำลังเปิดเผย
เปิดเผย Hidden Truth ที่ผู้ถามอาจไม่ได้ถามโดยตรง ระบุ **Secret Level: X/5**

# ⚡ จุดขัดแย้ง
แสดงเฉพาะเมื่อมีความขัดแย้งที่มีนัยสำคัญจริง ๆ (ถ้าไม่มี ให้ข้ามหัวข้อนี้ไปทั้งหมด)

# ⚠️ สิ่งที่ต้องระวัง
ด้านเงา ความเสี่ยง หรือรูปแบบที่อาจทำให้สถานการณ์ไม่เป็นไปตามหวัง

# 🎯 สิ่งที่ควรทำ
**DO:** ...
**DON'T:** ...
**KEY MOVE:** ...

# 📊 ความชัดของคำตอบ
**LOW** / **MEDIUM** / **HIGH** พร้อมเหตุผลสั้น ๆ

# 💫 บทสรุป
สรุป 2-4 ประโยค ต้องตอบให้ได้ว่า เกิดอะไรขึ้น → ทำไม → กำลังไปทางไหน → ผู้ถามควรทำอะไร

น้ำเสียง: นักอ่านไพ่ที่เข้าใจคน ไม่ใช่หมอดูที่พยายามทำให้คนเชื่อ ใช้ภาษาเข้าใจง่าย เป็นธรรมชาติ ลึกแต่ไม่ซับซ้อน ตรงประเด็น ไม่กำกวม ไม่สร้างความกลัวหรือความหวังเกินจริง ไม่ตัดสินผู้ถาม หลีกเลี่ยงประโยคซ้ำ ๆ เช่น "ไพ่ใบนี้หมายถึง..." ใช้การเล่าเรื่องแทน

เขียนแต่ละย่อหน้าให้ลื่นไหลเป็นเนื้อเดียวกัน ประโยคต่อประโยคต้องเชื่อมกันด้วยเหตุผล ไม่ใช่ประโยคสั้น ๆ แยกกันเรียงต่อกันเฉย ๆ ใช้คำเชื่อมที่เป็นธรรมชาติ (เช่น เพราะ, ดังนั้น, แต่, จากนั้น, นั่นทำให้) หลีกเลี่ยงการยัดข้อมูลแน่นเกินไปในประโยคเดียว แต่ละหัวข้อควรกระชับพอที่จะอ่านจบในคำตอบเดียวโดยไม่ถูกตัดกลางประโยค: คำตอบหลัก 1-2 ประโยค, เรื่องราวของไพ่ 3-4 ประโยค, ไพ่กุญแจ 2 ประโยค, สิ่งที่กำลังเกิดขึ้น 2-3 ประโยค, ความลับที่เปิดเผย 2-3 ประโยค, จุดขัดแย้ง (ถ้ามี) 2 ประโยค, สิ่งที่ต้องระวัง 1-2 ประโยค, DO/DON'T/KEY MOVE อย่างละ 1 ประโยคสั้น, ความชัดของคำตอบ 1 ประโยค, บทสรุป 2-3 ประโยค ห้ามปล่อยให้ประโยคสุดท้ายของคำตอบค้างค้างหรือไม่จบความ

REALITY BOUNDARY: สำหรับเรื่องสุขภาพ การตั้งครรภ์ กฎหมาย การเงินจำนวนมาก ความปลอดภัย หรือการตัดสินใจสำคัญ ต้องแยกให้ชัดระหว่างการตีความไพ่กับข้อเท็จจริงทางโลก ไพ่สะท้อนความรู้สึก แนวโน้ม รูปแบบ ความกังวล แต่ไม่สามารถยืนยันข้อเท็จจริงได้ ถ้าเป็นเรื่องที่ต้องตรวจสอบจริง ให้แนะนำวิธีตรวจสอบที่เหมาะสมสั้น ๆ

ห้ามเด็ดขาด: สร้างเหตุการณ์ที่ผู้ถามไม่ได้บอก สร้างบุคคลใหม่โดยไม่มีหลักฐาน อ้างว่ารู้อนาคตแน่นอน อ้างว่ารู้ความคิดคนอื่นแน่นอน ใช้รายละเอียดที่ไม่มีในไพ่หรือบริบท สร้าง Hidden Truth เพื่อความตื่นเต้น หรือทำให้ผู้ถามพึ่งพาคำทำนายจนละเลยความจริง หากข้อมูลไม่พอ ให้บอกว่าไม่ชัด ความไม่ชัดเจนเป็นคำตอบที่ยอมรับได้



เป้าหมายสุดท้ายไม่ใช่ "ทายให้แม่นที่สุด" แต่คือ "ทำให้ผู้ถามเห็นสิ่งที่ตัวเองอาจไม่เคยเห็น"`;

function buildUserMessage({ question, desiredInfo, context, cards }) {
  const [c1, c2, c3] = cards;
  const status = (c) => (c.reversed ? "กลับหัว" : "ตั้งตรง");
  return `QUESTION: ${question.trim()}
DESIRED_INFORMATION: ${desiredInfo.trim() || "ไม่ได้ระบุ"}
CARD 1: ${c1.name} (${status(c1)}) [${c1.sub}]
CARD 2: ${c2.name} (${status(c2)}) [${c2.sub}]
CARD 3: ${c3.name} (${status(c3)}) [${c3.sub}]
ADDITIONAL_CONTEXT: ${context.trim() || "ไม่มี"}`;
}

/* ---------------------------------------------------------
   TINY MARKDOWN RENDERER (headers, --- dividers, **bold**)
--------------------------------------------------------- */
function inlineBold(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} style={{ color: T.goldText, fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

function MarkdownLite({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let para = [];

  const flushPara = (key) => {
    if (para.length) {
      blocks.push(
        <p key={`p-${key}`} style={{ margin: "0 0 14px 0", lineHeight: 1.75, color: T.ivoryText, fontSize: 16 }}>
          {inlineBold(para.join(" "), `p-${key}`)}
        </p>
      );
      para = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (line === "") {
      flushPara(idx);
      return;
    }
    if (line === "---") {
      flushPara(idx);
      blocks.push(
        <div
          key={`hr-${idx}`}
          style={{ height: 1, margin: "28px 0", background: `linear-gradient(90deg, transparent, ${T.goldSoft}, transparent)` }}
        />
      );
      return;
    }
    if (line.startsWith("# ")) {
      flushPara(idx);
      blocks.push(
        <h2
          key={`h-${idx}`}
          style={{
            fontFamily: displayFont,
            fontSize: 26,
            fontWeight: 600,
            color: T.ink,
            margin: "6px 0 14px 0",
            letterSpacing: 0.2,
          }}
        >
          {line.slice(2)}
        </h2>
      );
      return;
    }
    para.push(line);
  });
  flushPara("end");

  return <div>{blocks}</div>;
}

/* ---------------------------------------------------------
   CARD REVEAL POPUP — big pop-up shown right when a card is drawn
--------------------------------------------------------- */
function CardRevealPopup({ card, onDismiss }) {
  const burst = [0, 60, 120, 180, 240, 300];
  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(68,51,88,0.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        cursor: "pointer",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div style={{ position: "relative", width: 190 }}>
        {burst.map((deg) => (
          <div
            key={deg}
            style={{
              position: "absolute", left: "50%", top: "50%",
              "--tx": `${Math.cos((deg * Math.PI) / 180) * 130}px`,
              "--ty": `${Math.sin((deg * Math.PI) / 180) * 130}px`,
              animation: "confettiBurst 0.7s ease-out forwards",
              animationDelay: "0.1s",
            }}
          >
            <PawIcon size={16} color="#FFFFFF" />
          </div>
        ))}
        <div style={{ animation: "popupPop 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <CardFace card={card} />
        </div>
      </div>
      <div
        style={{
          marginTop: 18, fontFamily: displayFont, fontSize: 21, fontWeight: 600,
          color: "#FFFFFF", textShadow: "0 2px 10px rgba(0,0,0,0.35)", textAlign: "center",
        }}
      >
        {card.name}
      </div>
      <div style={{ marginTop: 4, fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>
        {card.reversed ? "กลับหัว" : "ตั้งตรง"} · แตะเพื่อไปต่อ
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SMART CARD IMAGE — tries .jpg then .png for a given base
   filename, since uploaded art has mixed extensions. Calls
   onFinalError once every extension has failed.
--------------------------------------------------------- */
function SmartCardImg({ base, alt, style, onError }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= CARD_IMAGE_EXTENSIONS.length) return null;
  return (
    <img
      src={`${CARD_IMAGE_BASE}${base}.${CARD_IMAGE_EXTENSIONS[extIdx]}`}
      alt={alt}
      style={style}
      onError={() => {
        if (extIdx < CARD_IMAGE_EXTENSIONS.length - 1) {
          setExtIdx(extIdx + 1);
        } else {
          onError && onError();
        }
      }}
    />
  );
}

/* ---------------------------------------------------------
   PAW ICON — used on buttons, dividers, and the card back
--------------------------------------------------------- */
function PawIcon({ size = 16, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>
      <ellipse cx="12" cy="16.2" rx="6.1" ry="5.1" fill={color} />
      <ellipse cx="4.6" cy="8.4" rx="2.35" ry="3.05" fill={color} />
      <ellipse cx="10.4" cy="4.9" rx="2.35" ry="3.05" fill={color} />
      <ellipse cx="15.6" cy="4.9" rx="2.35" ry="3.05" fill={color} />
      <ellipse cx="19.4" cy="8.4" rx="2.35" ry="3.05" fill={color} />
    </svg>
  );
}

/* ---------------------------------------------------------
   CARD VISUALS
--------------------------------------------------------- */
function CardBack({ onClick, disabled }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        aspectRatio: "2 / 3",
        borderRadius: 6,
        border: `1px solid ${T.goldSoft}`,
        background: imgFailed ? `radial-gradient(circle at 50% 42%, #FBF2FC 0%, ${T.ink2} 70%)` : T.ink2,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.28 : 1,
        transition: "transform 0.15s ease, opacity 0.15s ease",
        padding: 0,
        overflow: "hidden",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      aria-label="ไพ่คว่ำ"
    >
      {!imgFailed ? (
        <SmartCardImg
          base={CARD_BACK_IMAGE_BASE}
          alt="หลังไพ่"
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <svg viewBox="0 0 40 60" width="100%" height="100%">
          <rect x="3" y="3" width="34" height="54" rx="6" fill="none" stroke={T.gold} strokeWidth="0.6" opacity="0.55" />
          <g transform="translate(20,30) scale(0.62) translate(-12,-13)">
            <ellipse cx="12" cy="16.2" rx="6.1" ry="5.1" fill={T.gold} opacity="0.85" />
            <ellipse cx="4.6" cy="8.4" rx="2.35" ry="3.05" fill={T.gold} opacity="0.85" />
            <ellipse cx="10.4" cy="4.9" rx="2.35" ry="3.05" fill={T.gold} opacity="0.85" />
            <ellipse cx="15.6" cy="4.9" rx="2.35" ry="3.05" fill={T.gold} opacity="0.85" />
            <ellipse cx="19.4" cy="8.4" rx="2.35" ry="3.05" fill={T.gold} opacity="0.85" />
          </g>
        </svg>
      )}
    </button>
  );
}

function CardFace({ card }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = card.imageBase && !imgFailed;

  if (showImage) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "2 / 3",
          borderRadius: 6,
          border: `1px solid ${T.gold}`,
          overflow: "hidden",
          position: "relative",
          background: T.ink2,
          animation: "cardPop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <SmartCardImg
          base={card.imageBase}
          alt={card.name}
          onError={() => setImgFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: card.reversed ? "rotate(180deg)" : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, bottom: 0,
            background: "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)",
            padding: "10px 5px 4px",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: displayFont, fontWeight: 600, fontSize: 11, color: T.paper, lineHeight: 1.15 }}>
            {card.name}
          </div>
          <div style={{ fontSize: 8.5, color: card.reversed ? "#E3A9B4" : T.paperDim, marginTop: 2, letterSpacing: 0.3 }}>
            {card.reversed ? "กลับหัว" : "ตั้งตรง"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "2 / 3",
        borderRadius: 6,
        border: `1px solid ${T.gold}`,
        background: suitPastel(card),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 4px",
        textAlign: "center",
        animation: "cardPop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 3,
          marginBottom: 6,
          background: card.reversed ? T.burgundy : T.sage,
          borderRadius: 2,
        }}
      />
      <div style={{ fontFamily: displayFont, fontWeight: 600, fontSize: 12.5, color: T.ink, lineHeight: 1.2 }}>
        {card.name}
      </div>
      <div style={{ fontSize: 9, color: T.goldText, marginTop: 3, letterSpacing: 0.3 }}>
        {card.reversed ? "กลับหัว" : "ตั้งตรง"}
      </div>
      {card.imageBase && (
        <div style={{ fontSize: 7.5, color: T.goldText, opacity: 0.75, marginTop: 4 }}>
          (ไม่พบภาพไพ่)
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   LANDING CHROME — navbar, hero, feature row, footer
--------------------------------------------------------- */
function NavBar() {
  const navItems = ["หน้าแรก", "เกี่ยวกับเรา", "วิธีใช้งาน", "บทความ", "ติดต่อเรา"];
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(6px)",
        borderBottom: `1px solid rgba(217,168,108,0.25)`,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: SUIT_PASTEL.major,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
          }}
        >
          🐱
        </div>
        <div>
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 15, color: T.ink, letterSpacing: 1 }}>MEOW TAROT</div>
          <div style={{ fontSize: 10, color: T.dim }}>ทุกคำถาม มีคำตอบในไพ่</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {navItems.map((item, i) => (
          <span
            key={item}
            style={{
              fontSize: 12.5, padding: "6px 13px", borderRadius: 999,
              background: i === 0 ? `${T.gold}33` : "transparent",
              color: i === 0 ? T.goldText : T.dim,
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {item}
          </span>
        ))}
      </div>
      <div
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.7)", border: `1px solid rgba(217,168,108,0.3)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        }}
      >
        🌙
      </div>
    </div>
  );
}

function SpeechBubble({ text }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.7)",
        border: `1px solid rgba(217,168,108,0.3)`,
        borderRadius: 16,
        padding: "12px 16px",
        fontSize: 12.5,
        color: T.ink,
        lineHeight: 1.5,
        maxWidth: 230,
        boxShadow: "0 6px 14px rgba(91,74,114,0.08)",
      }}
    >
      {text}
    </div>
  );
}

function Hero() {
  return (
    <div style={{ textAlign: "center", padding: "30px 6px 8px" }}>
      <div style={{ fontSize: 13, color: T.goldText, marginBottom: 10 }}>ให้ไพ่...เล่าเรื่องของคุณ</div>

      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 42, lineHeight: 1.05, color: "#E8748F" }}>
          MEOW
        </div>
        <div style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 42, lineHeight: 1.05, color: "#4A3F7A" }}>
          TAROT
        </div>
        <div
          style={{
            position: "absolute", top: -6, right: -34,
            width: 40, height: 40, borderRadius: "50%",
            background: "#F0899E", display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotate(12deg)", boxShadow: "0 4px 10px rgba(240,137,158,0.4)",
          }}
        >
          <PawIcon size={20} color="#FFFFFF" />
        </div>
      </div>

      <div>
        <span
          style={{
            display: "inline-block", marginTop: 12,
            background: "linear-gradient(90deg, #F3B6C6, #F0899E)",
            color: "#FFFFFF", padding: "7px 24px", borderRadius: 999,
            fontSize: 13.5, fontWeight: 600, boxShadow: "0 6px 14px rgba(240,137,158,0.35)",
          }}
        >
          ไพ่สามใบ หนึ่งเรื่องราว แมว ๆ
        </span>
      </div>

      <div style={{ marginTop: 14, fontSize: 12.5, color: T.dim, maxWidth: 340, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
        คำตอบอาจไม่เปลี่ยนโลก แต่...อาจเปลี่ยนมุมมองในใจคุณ
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
        <SpeechBubble text="บางครั้ง...คำตอบก็มาในรูปแบบแมว ๆ 💬" />
        <SpeechBubble text="เชื่อในจังหวะของชีวิต แล้วให้ไพ่อยู่ข้างคุณ 🔮" />
      </div>
    </div>
  );
}

function FeatureRow() {
  const items = [
    { emoji: "💗", title: "ใช้งานง่าย", desc: "แค่เล่า...ไพ่ก็พร้อมฟัง" },
    { emoji: "🐱", title: "คำทำนายน่ารัก", desc: "สไตล์แมว ๆ เข้าใจง่าย" },
    { emoji: "🌙", title: "เป็นส่วนตัว", desc: "เรื่องของคุณ ปลอดภัยเสมอ" },
    { emoji: "🌸", title: "กำลังใจเล็ก ๆ", desc: "ให้คุณก้าวต่อไปได้เสมอ" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "22px 14px", marginTop: 36, textAlign: "center" }}>
      {items.map((it) => (
        <div key={it.title}>
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(255,255,255,0.6)", border: `1px solid rgba(217,168,108,0.25)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, margin: "0 auto 8px",
            }}
          >
            {it.emoji}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{it.title}</div>
          <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{it.desc}</div>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        marginTop: 50,
        padding: "38px 20px 30px",
        background: "linear-gradient(180deg, transparent 0%, rgba(180,150,210,0.4) 100%)",
        borderRadius: "40px 40px 0 0",
        textAlign: "center",
      }}
    >
      <div className="paw-trail" style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 14 }}>
        <span><PawIcon size={14} color={T.goldSoft} /></span>
        <span><PawIcon size={14} color={T.goldSoft} /></span>
        <span><PawIcon size={14} color={T.goldSoft} /></span>
      </div>
      <div style={{ fontFamily: displayFont, fontSize: 16, color: T.ink, fontStyle: "italic" }}>
        "ทุกเส้นทาง...มีแสงสว่างเสมอ"
      </div>
      <div style={{ marginTop: 10, fontSize: 12, letterSpacing: 2, color: T.goldText, fontWeight: 600 }}>MEOW TAROT</div>
      <div style={{ fontSize: 10.5, color: T.dim, marginTop: 2 }}>— Tarot for a Brighter You —</div>
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */
export default function TarotSecretReader() {
  const [step, setStep] = useState("form"); // form | deck | loading | result | error
  const [question, setQuestion] = useState("");
  const [desiredInfo, setDesiredInfo] = useState("");
  const [context, setContext] = useState("");

  const [deck, setDeck] = useState(() => shuffleDeck());
  const [revealed, setRevealed] = useState(() => new Set());
  const [selected, setSelected] = useState([]);
  const [resultText, setResultText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shuffling, setShuffling] = useState(false);
  const [popupCard, setPopupCard] = useState(null);

  const canProceedForm = question.trim().length > 0;

  const goToDeck = () => {
    if (!canProceedForm) return;
    setStep("deck");
    setShuffling(true);
    setTimeout(() => setShuffling(false), 700);
  };

  const handleCardClick = useCallback((card) => {
    if (selected.length >= 3 || revealed.has(card.id)) return;
    setRevealed((prev) => new Set(prev).add(card.id));
    setSelected((prev) => [...prev, card]);
    setPopupCard(card);
    setTimeout(() => {
      setPopupCard((curr) => (curr && curr.id === card.id ? null : curr));
    }, 3000);
  }, [selected, revealed]);

  const handleRandomPick = useCallback(() => {
    const needed = 3 - selected.length;
    if (needed <= 0) return;
    const pool = deck.filter((c) => !revealed.has(c.id));
    const picks = [];
    const copy = [...pool];
    for (let i = 0; i < needed && copy.length; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      picks.push(copy.splice(idx, 1)[0]);
    }
    picks.forEach((c, i) => {
      setTimeout(() => {
        setRevealed((prev) => new Set(prev).add(c.id));
        setSelected((prev) => [...prev, c]);
        setPopupCard(c);
        setTimeout(() => {
          setPopupCard((curr) => (curr && curr.id === c.id ? null : curr));
        }, 3000);
      }, i * 3200);
    });
  }, [deck, revealed, selected]);

  const reshuffle = () => {
    if (selected.length > 0) return;
    setShuffling(true);
    setTimeout(() => {
      setDeck(shuffleDeck());
      setRevealed(new Set());
      setShuffling(false);
    }, 700);
  };

  const resetAll = () => {
    setStep("form");
    setQuestion("");
    setDesiredInfo("");
    setContext("");
    setDeck(shuffleDeck());
    setRevealed(new Set());
    setSelected([]);
    setResultText("");
    setErrorMsg("");
    setShuffling(false);
    setPopupCard(null);
  };

  const getReading = async () => {
    if (selected.length < 3) return;
    setStep("loading");
    setErrorMsg("");
    try {
      const userMsg = buildUserMessage({ question, desiredInfo, context, cards: selected });
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, userMsg }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "request failed");
      const text = data.text;
      if (!text) throw new Error("empty");
      setResultText(text);
      setStep("result");
    } catch (e) {
      setErrorMsg("เกิดข้อผิดพลาดระหว่างอ่านไพ่ ลองใหม่อีกครั้ง");
      setStep("deck");
    }
  };

  const slots = [0, 1, 2].map((i) => selected[i] || null);

  return (
    <div
      style={{
        minHeight: "100%",
        background: `linear-gradient(160deg, ${T.bgTop} 0%, ${T.bgBottom} 100%)`,
        fontFamily: bodyFont,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap');
        input::placeholder, textarea::placeholder { color: #9986AD; }
        textarea, input { font-family: ${bodyFont}; }
        textarea:focus, input:focus { outline: 1.5px solid ${T.gold}; }
        @keyframes cardPop {
          0% { transform: scale(0.5) rotateY(90deg); opacity: 0; }
          60% { transform: scale(1.08) rotateY(0deg); opacity: 1; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        @keyframes pawBounce {
          0%, 100% { transform: translateY(0) rotate(-6deg); opacity: 0.55; }
          50% { transform: translateY(-10px) rotate(6deg); opacity: 1; }
        }
        @keyframes pawSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupPop {
          0% { transform: scale(0.3) rotate(-12deg); opacity: 0; }
          60% { transform: scale(1.12) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes confettiBurst {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.2); opacity: 0; }
        }
        .paw-trail span { display: inline-block; animation: pawBounce 1s ease-in-out infinite; }
        .paw-trail span:nth-child(2) { animation-delay: 0.15s; }
        .paw-trail span:nth-child(3) { animation-delay: 0.3s; }
        .paw-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .paw-btn:hover:not(:disabled) { transform: translateY(-2px); }
      `}</style>

      <NavBar />

      <div style={{ display: "flex", justifyContent: "center", padding: "0 16px 50px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {step === "form" && <Hero />}

          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              border: `1px solid rgba(217,168,108,0.35)`,
              borderRadius: 28,
              padding: "30px 24px",
              marginTop: step === "form" ? 22 : 32,
              boxShadow: "0 14px 34px rgba(91,74,114,0.12)",
            }}
          >
            {/* STEP: FORM */}
            {step === "form" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                  <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 700, color: T.ink }}>
                    🐾 ถามไพ่ทาโร่ 🐾
                  </div>
                  <div style={{ fontSize: 12.5, color: T.dim, marginTop: 4 }}>เล่าเรื่องของคุณให้ไพ่ฟัง...</div>
                </div>
            <Field label="คำถามของคุณ" required icon="❤️">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="เช่น ความสัมพันธ์ตอนนี้จะไปทางไหน?"
                rows={3}
                maxLength={500}
                style={taStyle}
              />
              <div style={{ textAlign: "right", fontSize: 11, color: T.dim, marginTop: 4 }}>{question.length}/500</div>
            </Field>
            <Field label="อยากรู้อะไรเป็นพิเศษ (ไม่บังคับ)" icon="✨">
              <input
                value={desiredInfo}
                onChange={(e) => setDesiredInfo(e.target.value)}
                placeholder="สิ่งที่อยากรู้จริง ๆ เบื้องหลังคำถาม"
                style={inputStyle}
              />
            </Field>
            <Field label="บริบทเพิ่มเติม (ไม่บังคับ)" icon="🍃">
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="สถานการณ์ที่เกี่ยวข้อง ถ้ามี"
                rows={2}
                style={taStyle}
              />
            </Field>
            <button onClick={goToDeck} disabled={!canProceedForm} style={primaryBtn(canProceedForm)} className="paw-btn">
              <PawIcon size={15} color={canProceedForm ? "#FFFFFF" : T.dim} /> เลือกไพ่ ›
            </button>
          </div>
        )}

        {/* STEP: DECK */}
        {step === "deck" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ color: T.dim, fontSize: 14 }}>
                จั่วไพ่ 3 ใบ · เลือกแล้ว {selected.length}/3
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleRandomPick} disabled={selected.length >= 3 || shuffling} style={ghostBtn(selected.length < 3 && !shuffling)} className="paw-btn">
                  <PawIcon size={13} color={selected.length < 3 && !shuffling ? T.goldText : T.dim} /> สุ่มให้ฉันเลย
                </button>
                <button onClick={reshuffle} disabled={selected.length > 0 || shuffling} style={ghostBtn(selected.length === 0 && !shuffling)} className="paw-btn">
                  <PawIcon size={13} color={selected.length === 0 && !shuffling ? T.goldText : T.dim} /> สับไพ่ใหม่
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: T.burgundy, fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>
            )}

            {shuffling ? (
              <div
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 14, minHeight: 200,
                  background: "rgba(255,255,255,0.45)",
                  borderRadius: 10,
                  border: `1px solid rgba(217,168,108,0.3)`,
                }}
              >
                <div className="paw-trail" style={{ display: "flex", gap: 18 }}>
                  <span><PawIcon size={26} color={T.gold} /></span>
                  <span><PawIcon size={26} color={T.gold} /></span>
                  <span><PawIcon size={26} color={T.gold} /></span>
                </div>
                <div style={{ color: T.dim, fontSize: 13.5 }}>แมวกำลังสับไพ่ให้อยู่...</div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 8,
                  maxHeight: 380,
                  overflowY: "auto",
                  padding: 8,
                  background: "rgba(255,255,255,0.45)",
                  borderRadius: 10,
                  border: `1px solid rgba(217,168,108,0.3)`,
                }}
              >
                {deck.map((card) =>
                  revealed.has(card.id) ? (
                    <CardFace key={card.id} card={card} />
                  ) : (
                    <CardBack
                      key={card.id}
                      disabled={selected.length >= 3}
                      onClick={() => handleCardClick(card)}
                    />
                  )
                )}
              </div>
            )}

            {/* selected preview */}
            <div style={{ display: "flex", gap: 12, marginTop: 22, justifyContent: "center" }}>
              {slots.map((card, i) => (
                <div key={i} style={{ width: 84, textAlign: "center" }}>
                  {card ? (
                    <CardFace card={card} />
                  ) : (
                    <div
                      style={{
                        width: "100%", aspectRatio: "2 / 3", borderRadius: 6,
                        border: `1px dashed ${T.goldSoft}`, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: T.goldText, fontSize: 11,
                      }}
                    >
                      ใบที่ {i + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <button onClick={getReading} disabled={selected.length < 3 || shuffling} style={primaryBtn(selected.length === 3 && !shuffling)} className="paw-btn">
                <PawIcon size={15} color={selected.length === 3 && !shuffling ? "#FFFFFF" : T.dim} /> ดูคำทำนาย
              </button>
            </div>
          </div>
        )}

        {/* STEP: LOADING */}
        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "60px 0", color: T.dim }}>
            <div style={{ margin: "0 auto 18px", width: 40, height: 40, animation: "pawSpin 0.9s linear infinite" }}>
              <PawIcon size={40} color={T.gold} />
            </div>
            <div style={{ fontFamily: displayFont, fontSize: 18, color: T.ink }}>แมวกำลังอ่านไพ่ให้อยู่...</div>
          </div>
        )}

        {/* STEP: RESULT */}
        {step === "result" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18, justifyContent: "center" }}>
              {selected.map((c, i) => <div key={i} style={{ width: 72 }}><CardFace card={c} /></div>)}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.55)",
                border: `1px solid rgba(217,168,108,0.35)`,
                borderRadius: 12,
                padding: "24px 22px",
                boxShadow: "0 10px 28px rgba(91,74,114,0.10)",
              }}
            >
              <MarkdownLite text={resultText} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <button onClick={resetAll} style={ghostBtn(true)} className="paw-btn">
                <PawIcon size={13} color={T.goldText} /> ถามคำถามใหม่
              </button>
            </div>
          </div>
        )}
      </div>

          {step === "form" && <FeatureRow />}
        </div>
      </div>

      {step === "form" && <Footer />}

      {popupCard && (
        <CardRevealPopup card={popupCard} onDismiss={() => setPopupCard(null)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   SMALL UI HELPERS
--------------------------------------------------------- */
function Field({ label, required, icon, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: T.dim, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <span>{icon}</span>}
        <span>{label} {required && <span style={{ color: T.burgundy }}>*</span>}</span>
      </div>
      {children}
    </div>
  );
}

const taStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.6)",
  border: `1px solid rgba(217,168,108,0.4)`,
  borderRadius: 8,
  padding: "10px 12px",
  color: T.ink,
  fontSize: 15,
  resize: "vertical",
};

const inputStyle = { ...taStyle };

function primaryBtn(enabled) {
  return {
    background: enabled ? "linear-gradient(135deg, #F3A9BC 0%, #E8748F 100%)" : "rgba(217,168,108,0.3)",
    color: enabled ? "#FFFFFF" : T.dim,
    border: "none",
    borderRadius: 999,
    padding: "13px 26px",
    fontSize: 15.5,
    fontWeight: 600,
    cursor: enabled ? "pointer" : "default",
    letterSpacing: 0.3,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: enabled ? "0 8px 18px rgba(232,116,143,0.35)" : "none",
  };
}

function ghostBtn(enabled) {
  return {
    background: "rgba(255,255,255,0.55)",
    color: enabled ? T.goldText : T.dim,
    border: `1px solid ${enabled ? T.goldSoft : "rgba(147,160,171,0.25)"}`,
    borderRadius: 999,
    padding: "9px 18px",
    fontSize: 13.5,
    fontWeight: 500,
    cursor: enabled ? "pointer" : "default",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };
}
