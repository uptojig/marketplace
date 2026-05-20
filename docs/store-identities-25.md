# 27 Demo Stores — Identity Spec

**Status:** Final-ready. Single source of truth for the seed script + chrome-adapter build phase.
**Owner:** Brand Guardian
**Date:** 2026-05-21

Every store below specifies: slug, niche, templateId, paletteId, brand voice, full landing content (TH copy), shadcn color overrides, visual signature, and the "why distinct" axis. All copy fields are seeded into `StoreLandingContent` so vendors can edit post-creation — nothing is hardcoded.

**Hard constraints honored:**
- No food / restaurant / beverage / grocery / snacks
- No `live-commerce` or `video-feed` templates
- No pet supplies (avoids `fluffyhouse`)
- No mop / cleaning household brand (avoids `minimop24`)
- `community` family only used as static `storyteller` (no live)

**Coverage axes per consecutive-pair (template family / palette mood / layout pattern / brand voice / hero treatment / product-card style) differ on at least 3 of 6 for every adjacent pair.**

---

## Typography rules (applies to ALL 27 stores)

This section OVERRIDES anything else in the doc. Build agents downstream must enforce it.

**Allowed fonts (Google Thai sans only):**
- **Prompt** — default body, default UI labels.
- **Kanit** — default display / headline (Kanit Black for hero, Kanit ExtraBold for section H2s).
- **Google Sans** — acceptable for utility/secondary UI where Prompt feels too tall.
- Case-by-case alternates from Google Fonts that ship a Thai sans subset: Sora, IBM Plex Sans Thai, Noto Sans Thai (paired with Inter for Latin). Bias toward Prompt + Kanit by default — only reach for an alternate when there is a specific brand reason.

**Banned everywhere (visible content + adapter notes):**
- **Sarabun** — do not use, do not reference.
- Any serif or display-serif (Playfair, Cormorant, DM Serif, Lora, Bodoni, Noto Serif Thai, Noto Serif JP, etc.).
- Any monospace (IBM Plex Mono, JetBrains Mono, Space Mono, Geist Mono, etc.) and the Tailwind `font-mono` utility for visible content.
- The mood label "magazine" (do not describe any store's look as "magazine layout" / "Kinfolk magazine" / "Dwell magazine").
- The word "editorial" when it is shorthand for "serif + magazine". The word may stay only if it is re-defined as "tight Kanit display headlines, generous whitespace, hairline rules, no serif".

When a store wants a "techy / lab / spec-sheet" feel previously implied by mono, the recipe is **Prompt Regular + uppercase + wider letter-spacing**, not a monospace font.

**Copy language (applies to ALL 27 stores):** ทุกร้านใช้ภาษาไทยเป็นภาษาหลัก — Thai is the primary copy language across all 27 stores. Every hero headline, subheadline, CTA label, announcement strip, about copy, FAQ Q/A, testimonial quote, and tile label MUST be Thai-primary. English may appear ONLY as a decorative subtitle / secondary line, never as the leading hero copy.

---

## Palette additions (3 new palettes beyond the existing 8)

Existing 8 covered most needs. Three new palettes added to hit specific visual signatures:

```ts
// Add to PALETTES[] in lib/store/wizard-data.ts
{ id: "kraft",      name: "Kraft Paper",  primary: "#3a2e22", accent: "#c9974b" }, // warm earth, paper-bag tone
{ id: "clinical",   name: "Clinical Lab", primary: "#0b3d4a", accent: "#9cd6df" }, // cool teal, lab glass
{ id: "noir",       name: "Noir Ivory",   primary: "#0a0a0a", accent: "#e8e2d4" }, // monochrome ivory
```

---

## 1. Mono Eight (โมโน เอท)

- **slug**: mono-eight
- **niche**: fashion
- **templateId**: `lookbook` → **needs new bespoke adapter: นัวร์มินิมอล (`minimal-noir`)**
- **paletteId**: `noir` (new)
- **brandVoice**: formal
- **landingThemeVariant**: fashion-beauty / Pattern A
- **Tagline (TH)**: ผ้าเนื้อหนา ตัดเรียบ ใส่ได้ทุกวัน
- **Hero headline (TH)**: ขาวดำในชั้นเดียวกัน
- **Hero subheadline (TH)**: คอลเลกชันเสื้อผ้าสตรีทแวร์ไทย เน้นโครงสร้างผ้า ตัดเย็บในกรุงเทพฯ จำนวนจำกัด 80 ตัวต่อคอลเลกชัน
- **Hero CTA label (TH)**: ดูคอลเลกชันใหม่
- **Announcement strip**: desktop "DROP 08 — เปิดสั่งจอง 24 พ.ค. เวลา 20:00 น." / mobile "DROP 08 · 24 พ.ค. 20:00"
- **About heading (TH)**: ทำเสื้อผ้าทีละ 80 ตัว / **about body**: เริ่มจากเสื้อยืดผ้าหนา 8 ออนซ์ที่หาในไทยไม่ได้ เราจึงปั่นเส้นด้ายเอง คอลเลกชันละ 80 ตัวเท่านั้น ไม่มีรีออเดอร์ คนใส่จึงไม่เจอกันที่ไหน
- **Featured tiles (3)**:
  1. label "Heavyweight Tee" / eyebrow "DROP 08" / vibe "เสื้อยืดสีดำพับวางบนพื้นปูนเปลือย แสงเงาแข็ง"
  2. label "Carpenter Pant" / eyebrow "Restock" / vibe "กางเกงสีคาร์โก้แขวนกับราวเหล็กบนผนังขาว"
  3. label "Field Jacket" / eyebrow "Limited" / vibe "แจ็คเก็ตสีกากีถ่ายโคลสอัพเนื้อผ้าและกระเป๋า"
- **FAQ (TH)**:
  1. Q "ผ้าหนาเท่าไหร่?" / A "เสื้อยืดทุกตัวใช้ผ้า 8 ออนซ์ ทอจากเส้นด้ายคอตตอน Cotton USA 100%"
  2. Q "ขนาดสั่งเฉพาะได้ไหม?" / A "ในแต่ละดรอปเราตัดแค่ S/M/L/XL ไม่รับสั่งตัดเฉพาะ เนื่องจากเป็นการตัดเป็นล็อต"
- **Testimonial**: name "พิชญะ ส." / role "ลูกค้าตั้งแต่ DROP 02" / quote "ผ้าหนาแต่ใส่แล้วไม่ร้อน ซักสองสามปีแล้วทรงยังอยู่ ที่อื่นยังหาไม่ได้"
- **Color overrides**: primary `#0a0a0a`, accent `#e8e2d4`, background `#fafaf7`, foreground `#0a0a0a`, border `#1c1c1c`, ring `#1c1c1c`
- **Visual signature**: hairline horizontal rules between every section, all-caps Kanit Black eyebrow micro-labels (tight tracking, no serif anywhere) above ivory product cards on near-black background; body sits in Prompt Regular for a calm zine read.
- **Why distinct**: only store in the 27 that's full monochrome ivory-on-near-black with chunky Kanit Black eyebrows and hairline rules — reads as a printed zine, not a webshop.

---

## 2. Lila Modest (ลีลา โมเดสต์)

- **slug**: lila-modest
- **niche**: fashion
- **templateId**: `boutique`
- **paletteId**: `earthy`
- **brandVoice**: casual
- **landingThemeVariant**: fashion-beauty / Pattern A
- **Tagline (TH)**: ผ้าคลุมไหล่และเดรสยาว สำหรับผู้หญิงที่ชอบใส่สบาย
- **Hero headline (TH)**: คลุมได้ทุกโอกาส
- **Hero subheadline (TH)**: เดรสยาว เสื้อคลุม และผ้าฮิญาบที่ออกแบบให้ใส่ได้ตั้งแต่ทำงานยันเที่ยว เนื้อผ้าระบายอากาศดี เหมาะกับอากาศไทย
- **Hero CTA label (TH)**: เลือกเดรส
- **Announcement strip**: desktop "ส่งฟรีเมื่อสั่งครบ 1,500 บาท · ราคาเดียวทั้งร้าน" / mobile "ส่งฟรี 1,500.-"
- **About heading**: เริ่มจากตู้เสื้อผ้าตัวเอง / **body**: เราเริ่มจากปัญหาว่าหาเดรสยาวที่ทรงสวยและเย็นไม่ได้ในไทย ทุกตัวถูกพัฒนากับโรงทอผ้าในนครปฐม ใช้ผ้าเรยอนผสมลินิน นุ่มและระบายอากาศ
- **Featured tiles (3)**:
  1. label "Open Abaya" / eyebrow "Bestseller" / vibe "เดรสยาวสีน้ำตาลแห้งถ่ายในห้องที่มีแสงธรรมชาติ"
  2. label "Cotton Hijab" / eyebrow "New" / vibe "ผ้าคลุมศีรษะหลายสีพับวางบนพื้นไม้"
  3. label "Linen Pants Set" / eyebrow "Easy Wear" / vibe "เซ็ตเสื้อกางเกงผ้าลินินสีครีมแขวนบนไม้แขวนเสื้อ"
- **FAQ**:
  1. Q "ใส่ในมัสยิดได้ไหม?" / A "ทุกตัวเป็นแบบไม่ผ่าสูง ปกปิดมิดชิด ใส่ละหมาดได้สบาย"
  2. Q "ซักเครื่องได้ไหม?" / A "ซักเครื่องโปรแกรมถนอมผ้าได้ ห้ามอบและห้ามใช้น้ำยาฟอกขาว"
- **Testimonial**: name "นูรียา อ." / role "คุณครูจากสงขลา" / quote "ใส่สอนทั้งวันก็เย็น ผ้าไม่ยับง่ายเหมือนผ้าฝ้ายปกติ"
- **Color overrides**: primary `#5b4636`, accent `#c9974b`, background `#f5efe6`, foreground `#2a2118`, muted `#e6dcc9`
- **Visual signature**: warm camel-and-cream palette with a story-block above product grid, soft textile-on-wood photography.
- **Why distinct**: only earth-tone modest-wear boutique in the 25; story-block sits above the grid (boutique template's signature move) — most other stores hide story below.

---

## 3. Atelier 27 (อาเทลิเย่ 27)

- **slug**: atelier-27
- **niche**: fashion
- **templateId**: `premium-luxury`
- **paletteId**: `minimal`
- **brandVoice**: formal
- **landingThemeVariant**: trust / Pattern A
- **Tagline (TH)**: สูทตัดเฉพาะบุคคล สั่งจองล่วงหน้า 14 วัน
- **Hero headline (TH)**: ทุกตะเข็บ วัดจากร่างกายของคุณ
- **Hero subheadline (TH)**: บริการตัดสูทผู้ชายและผู้หญิง ฟิตติ้งฟรีที่สาขาสุขุมวิท 27 ระยะเวลาตัด 14 วัน ขั้นต่ำสองชิ้น
- **Hero CTA label (TH)**: นัดวัดตัว
- **Announcement strip**: desktop "นัดวัดตัวฟรี ที่สุขุมวิท 27 · เปิดเฉพาะนัดล่วงหน้า" / mobile "นัดวัดตัวฟรี"
- **About heading**: ตัดเสื้อตามแบบของคุณ / **body**: อาเทลิเย่ 27 เริ่มจากช่างตัดเสื้อรุ่นที่สาม ทุกชุดถูกตัดด้วยมือในกรุงเทพฯ ลูกค้าสามารถเลือกผ้าจาก Vitale Barberis Canonico และ Dormeuil ได้โดยตรง
- **Featured tiles (3)**:
  1. label "Two-piece Suit" / eyebrow "From 28,000 บาท" / vibe "สูทสีกรมท่าแขวนบนหุ่นช่างเสื้อในห้องที่มีแสงนุ่ม"
  2. label "Shirt Bundle" / eyebrow "Made-to-measure" / vibe "เสื้อเชิ้ตขาวพับเรียงสามตัวบนโต๊ะไม้"
  3. label "Tuxedo" / eyebrow "Event-ready" / vibe "ทักซิโด้ดำคู่กับโบว์ไทถ่ายบนพื้นหินอ่อน"
- **FAQ**:
  1. Q "ใช้เวลาเท่าไหร่กว่าจะได้ชุด?" / A "หลังนัดวัดตัวครั้งแรก 14 วันสำหรับตัวแรก และ 7 วันสำหรับตัวต่อๆ ไป"
  2. Q "เปลี่ยนแบบหลังตัดได้ไหม?" / A "เปลี่ยนได้จนกว่าจะถึงขั้นตอน basting (ฟิตติ้งครั้งแรก) หลังจากนั้นปรับได้เฉพาะขนาด"
- **Testimonial**: name "ธนกฤต ว." / role "ลูกค้านัดวัดตัวประจำ 3 ปี" / quote "เป็นที่เดียวที่ตัดเสื้อให้ผมแล้วใส่แล้วไม่ยับช่วงหลัง"
- **Color overrides**: primary `#1c1917`, accent `#a8a29e`, background `#fafaf9`, foreground `#1c1917`, muted `#f5f5f4`
- **Visual signature**: airy Kanit Light display headlines with extra letter-spacing, Prompt Regular body, ratings count hidden, asymmetric large hero photo with a single eyebrow word over half the screen.
- **Why distinct**: only `premium-luxury` template in the 27 — Kanit Light + airy whitespace + no ratings reads as "Hermès web", clearly not a marketplace tile.

---

## 4. Sirin Womenswear (ศิรินทร์)

- **slug**: sirin-womenswear
- **niche**: fashion
- **templateId**: `lookbook`
- **paletteId**: `rose`
- **brandVoice**: casual
- **landingThemeVariant**: fashion-beauty / Pattern A
- **Tagline (TH)**: เดรส กระโปรง และเสื้อแขนพอง สำหรับสาวออฟฟิศ
- **Hero headline (TH)**: เดรสที่ใส่ทำงานก็ได้ ใส่ดินเนอร์ก็ได้
- **Hero subheadline (TH)**: คอลเลกชันรายเดือนของเสื้อผ้าผู้หญิงสไตล์คอนเทมโพรารี ปรับให้พอดีกับสรีระสาวเอเชีย ใช้ผ้าซับในแบบไม่บาง
- **Hero CTA label (TH)**: ดู Lookbook เดือนนี้
- **Announcement strip**: desktop "Lookbook พฤษภาคม · ส่งฟรีทั่วประเทศเมื่อสั่ง 2 ชิ้นขึ้นไป" / mobile "ส่งฟรี 2 ชิ้น"
- **About heading**: เดรสที่ใส่ได้จริง / **body**: ศิรินทร์เริ่มต้นจากการ์เม้นต์เล็กๆ ในย่านบางรัก ดีไซเนอร์เริ่มจากเดรสตัดเองให้แม่ ก่อนขยายเป็นแบรนด์ที่เน้นโครงทรงสำหรับสรีระสาวไทย
- **Featured tiles (3)**:
  1. label "Puff-sleeve Dress" / eyebrow "May Lookbook" / vibe "เดรสสีชมพูนู้ดถ่ายกับฉากผ้าม่านลายลูกไม้"
  2. label "Pleated Skirt" / eyebrow "Work to dinner" / vibe "กระโปรงพลีทสีครีมถ่ายสะท้อนในกระจกร้านกาแฟ"
  3. label "Bustier Top" / eyebrow "New arrival" / vibe "เสื้อกล้ามรัดรูปสีแดงเข้มถ่ายกับฉากพื้นปูนชมพู"
- **FAQ**:
  1. Q "มีไซส์ใหญ่ไหม?" / A "ทุกเดรสมีตั้งแต่ XS-XXL ผ้าซับในเย็บเย็นไม่บาง"
  2. Q "เปลี่ยนไซส์ได้ไหม?" / A "เปลี่ยนได้ใน 7 วันถ้ายังไม่ตัดป้าย ค่าส่งคืนผู้ซื้อ"
- **Testimonial**: name "เมษา ศ." / role "Marketing manager" / quote "เป็นแบรนด์เดียวที่ใส่แล้วไม่ต้องไปแก้ที่ร้านเย็บผ้า"
- **Color overrides**: primary `#be185d`, accent `#fb7185`, background `#fff5f7`, foreground `#3f0f24`, muted `#fce7f3`
- **Visual signature**: portrait hero photo of a model holding flowers, lookbook collection layout with restrained product cards (no price visible on tile, price reveals on hover); Kanit ExtraBold collection titles in title-case over Prompt Regular captions.
- **Why distinct**: only rose-pink portrait lookbook in the 27; pairs portrait hero + price-on-hover product cards + monthly collection grid — Mono Eight is monochrome ivory-on-black, Sirin is feminine rose with Kanit collection headers.

---

## 5. Caldera Skin (คาลเดร่า สกิน)

- **slug**: caldera-skin
- **niche**: beauty
- **templateId**: `boutique` → **needs new bespoke adapter: คลินิกแล็บ (`clinical-lab`)**
- **paletteId**: `clinical` (new)
- **brandVoice**: formal
- **landingThemeVariant**: fashion-beauty / Pattern A
- **Tagline (TH)**: สกินแคร์สูตรเฉพาะ พัฒนาในห้องแล็บไทย
- **Hero headline (TH)**: ผิวที่อ่านได้
- **Hero subheadline (TH)**: เซรั่มและครีมที่พัฒนาร่วมกับห้องแล็บ Chula Cosmetics Lab ทุกผลิตภัณฑ์มีงานวิจัยทางคลินิกแนบ ปลอดน้ำหอม
- **Hero CTA label (TH)**: ดูผลทดสอบทางคลินิก
- **Announcement strip**: desktop "Clinical Trial #07 — Niacinamide 12% ผ่านการทดลองกับอาสาสมัคร 42 คน 28 วัน" / mobile "Clinical #07 · ผ่านการทดลอง 28 วัน"
- **About heading**: เปิดข้อมูลทุกขั้น / **body**: คาลเดร่าก่อตั้งโดยเภสัชกรและนักวิจัย เราพับเก็บความสวยงามแบบโฆษณาทิ้ง เปิดเผยแหล่งวัตถุดิบ ส่วนผสมเต็ม และผลการทดสอบทางคลินิกในทุกหน้าสินค้า
- **Featured tiles (3)**:
  1. label "Niacinamide 12% Serum" / eyebrow "Clinical #07" / vibe "ขวดเซรั่มแก้วใสบนพื้นหลังเรียบเทาฟ้า มีแถบกราฟอยู่ข้างขวด"
  2. label "Ceramide Barrier Cream" / eyebrow "pH 5.5" / vibe "กระปุกครีมขาวคู่กับสไลด์ไมโครสโคปวางบนพื้นแก้วใส"
  3. label "Retinal 0.05%" / eyebrow "Encapsulated" / vibe "ขวดสีน้ำตาลใสถ่ายกับฉากตารางวัด"
- **FAQ**:
  1. Q "ใช้คู่กับวิตามินซีได้ไหม?" / A "Niacinamide เข้ากับวิตามินซีได้ดี (งานวิจัย Levin & Momin, 2010) ใช้เช้า/เย็นสลับได้"
  2. Q "ปลอดภัยสำหรับคนแพ้ง่ายไหม?" / A "ผลิตภัณฑ์ทุกตัวผ่าน patch test กับ Dermscan Asia ผลการทดสอบดาวน์โหลดได้ในหน้าสินค้า"
- **Testimonial**: name "ดร. นภา ส." / role "เภสัชกร · ผู้ใช้ประจำ" / quote "เป็นแบรนด์ไทยน้อยรายที่เปิดเผย full INCI list และไฟล์ผลทดสอบ ให้ตรวจสอบได้จริง"
- **Color overrides**: primary `#0b3d4a`, accent `#9cd6df`, background `#f4f8f9`, foreground `#0b3d4a`, border `#cdd9dc`, ring `#5cbac7`
- **Visual signature**: spec-table feel — every product card lists pH, key actives %, and clinical-trial ID like a lab report. Type recipe: Prompt Regular set in ALL-CAPS with +120 letter-spacing for spec rows (no monospace), Kanit Medium for product titles.
- **Why distinct**: only beauty brand in the 27 with clinical/lab feel — teal-and-glass palette + tracked-uppercase Prompt micro-typography vs. Sirin's rose lookbook two stores up.

---

## 6. Yumeiro Lip (ยูเมะอิโระ)

- **slug**: yumeiro-lip
- **niche**: beauty
- **templateId**: `beauty-swatch`
- **paletteId**: `rose`
- **brandVoice**: playful
- **landingThemeVariant**: fashion-beauty / Pattern C
- **Tagline (TH)**: ลิปและบลัชเชอร์ K-beauty ตัวเดียวจบ
- **Hero headline (TH)**: เลือกเฉดที่ใช่จาก 32 สี
- **Hero subheadline (TH)**: ลิปทินต์ ลิปแมตต์ และครีมบลัชเชอร์สไตล์เกาหลี ปั้มเดียวขึ้นสีจริง ทดสอบบนผิวเอเชีย เลือกได้จาก 32 เฉดสี
- **Hero CTA label (TH)**: เลือกเฉด
- **Announcement strip**: desktop "เฉดใหม่ 4 สี Spring Drop · ทดลองสีบนปากเสมือนจริงในหน้าสินค้า" / mobile "Spring Drop 4 เฉดใหม่"
- **About heading**: 32 สีในคอลเลกชันเดียว / **body**: ยูเมะอิโระตั้งใจให้คนไทยเลือกเฉดได้ง่ายเหมือนเลือกสีเล็บ ทุกเฉดมี swatch ถ่ายจริงบน 4 โทนสีผิว ไม่ใช้ฟิลเตอร์ ไม่ใช้ AI generate
- **Featured tiles (3)**:
  1. label "Velvet Tint" / eyebrow "16 shades" / vibe "ลิปทินต์ 16 แท่งเรียงตามโทนสีบนพื้นชมพูพาสเทล"
  2. label "Mochi Blush" / eyebrow "Cream-to-powder" / vibe "บลัชครีมเปิดฝา 6 ตลับวางคู่กันบนพื้นกระเบื้องชมพู"
  3. label "Glass Gloss" / eyebrow "Non-sticky" / vibe "ลิปกลอสใสถ่ายโคลสอัพแสงสะท้อนบนเลนส์"
- **FAQ**:
  1. Q "ติดทนแค่ไหน?" / A "Velvet Tint ติดทนเฉลี่ย 6 ชั่วโมง รวมการกินอาหารเบาๆ ทดสอบในห้องวิจัยโซลและกรุงเทพฯ"
  2. Q "มี vegan ไหม?" / A "ทุกสูตรเป็น vegan และ cruelty-free ผ่านการรับรองจาก Leaping Bunny"
- **Testimonial**: name "พิมพ์มาดา จ." / role "เมคอัพอาร์ทิสต์" / quote "เป็นลิปทินต์ตัวเดียวที่ผ้าเช็ดปากเปื้อนน้อยจริงๆ ใช้กับงานแต่งงานได้"
- **Color overrides**: primary `#ec4899`, accent `#fb7185`, background `#fff0f5`, foreground `#831843`, muted `#fbcfe8`
- **Visual signature**: full-width horizontal swatch row of 32 lip color circles directly under the hero — swatch picker is the navigation.
- **Why distinct**: only `beauty-swatch` template in the 25; the giant swatch row IS the homepage's primary block. Yumeiro = chromatic K-beauty playground vs. Caldera's clinical austerity.

---

## 7. Hinoki Apothecary (ฮิโนกิ อพอเทคารี)

- **slug**: hinoki-apothecary
- **niche**: beauty
- **templateId**: `storyteller`
- **paletteId**: `earthy`
- **brandVoice**: formal
- **landingThemeVariant**: community / Pattern A
- **Tagline (TH)**: น้ำหอมและเทียนหอมที่เริ่มจากเรื่องเล่า
- **Hero headline (TH)**: กลิ่นไม้สนหลังฝนตก
- **Hero subheadline (TH)**: น้ำหอมและเทียนหอมเฉพาะกลุ่ม ทุกกลิ่นออกแบบรอบเรื่องสั้น 1 เรื่อง — อ่านได้ในหน้าสินค้า เลือกซื้อตามเรื่องที่ใช่
- **Hero CTA label (TH)**: อ่านกลิ่นแรก
- **Announcement strip**: desktop "เรื่องเล่าที่ 12 'จดหมายจากภูทอก' — เปิดให้สั่งจองพรุ่งนี้ 20:00" / mobile "เรื่องที่ 12 · 22 พ.ค."
- **About heading**: เริ่มจากเรื่องเล่า ไม่ใช่จากกลิ่น / **body**: ฮิโนกิ อพอเทคารี ก่อตั้งโดยนักเขียนและนักปรุงน้ำหอม เราเริ่มกระบวนการจากเรื่องสั้นหนึ่งเรื่อง แล้วใช้เวลาสามถึงหกเดือน
- **Featured tiles (3)**:
  1. label "Story 11 · Tea House" / eyebrow "EDP 50ml" / vibe "ขวดน้ำหอมแก้วสีชาคู่กับหนังสือเปิดอยู่บนโต๊ะไม้"
  2. label "Story 09 · Monsoon" / eyebrow "Candle 220g" / vibe "เทียนหอมใส่ภาชนะดินเผาวางบนพื้นไม้สนเปียก"
  3. label "Story 07 · Library" / eyebrow "Solid Perfume" / vibe "ตลับน้ำหอมโลหะวางบนหน้าหนังสือเก่า"
- **FAQ**:
  1. Q "อ่านเรื่องสั้นได้ที่ไหน?" / A "ทุกหน้าสินค้ามีเรื่องสั้นเต็มเรื่อง 800-1,200 คำ อ่านฟรีโดยไม่ต้องซื้อ"
  2. Q "ใช้น้ำมันหอมจากไหน?" / A "ทำงานกับเกษตรกรในเชียงราย น่าน และเชียงใหม่ น้ำมันหอมระเหยทั้งหมดเป็น food-grade"
- **Testimonial**: name "วันใหม่ ภ." / role "นักวิจารณ์น้ำหอม" / quote "เป็นแบรนด์ไทยรายเดียวที่ทำให้ผมรู้สึกว่ากำลังอ่านวรรณกรรมพร้อมดมกลิ่น"
- **Color overrides**: primary `#3f2e1e`, accent `#a87a4b`, background `#f6efe2`, foreground `#3f2e1e`, muted `#e6d5b8`
- **Visual signature**: narrative story blocks alternate with single large product photographs — feels like a long-form essay you can shop.
- **Why distinct**: only `storyteller` template in the 25; the homepage reads as essay paragraphs, not a grid. Hinoki = literary perfume vs. Yumeiro's swatch-grid candyland.

---

## 8. Korakot House (กรกฎ เฮ้าส์)

- **slug**: korakot-house
- **niche**: home
- **templateId**: `home-living` → **needs new bespoke adapter: มิดเซนจูรี (`mid-century-scene`)**
- **paletteId**: `earthy`
- **brandVoice**: formal
- **landingThemeVariant**: lifestyle / Pattern C
- **Tagline (TH)**: เฟอร์นิเจอร์ไม้สักมิดเซนจูรี ผลิตในจังหวัดน่าน
- **Hero headline (TH)**: เฟอร์นิเจอร์ที่อยู่ได้สามชั่วอายุคน
- **Hero subheadline (TH)**: โซฟา เก้าอี้ และโต๊ะกาแฟทรงมิดเซนจูรี ตัดจากไม้สักจริงจากสวนป่าน่าน ผลิตเป็นล็อต 12 ชิ้น สั่งล่วงหน้า 21 วัน
- **Hero CTA label (TH)**: ดูชิ้นเด่นของเดือน
- **Announcement strip**: desktop "ส่งฟรีในกรุงเทพและปริมณฑล · จัดวางและประกอบให้ในวันส่ง" / mobile "ส่งฟรี + ประกอบให้"
- **About heading**: ไม้สักของน่าน / **body**: กรกฎเริ่มจากช่างไม้ในจังหวัดน่านที่อยากผลิตเฟอร์นิเจอร์ที่ไม่ถูกทิ้งใน 5 ปี เราใช้ไม้สักจากสวนป่าที่ปลูกใหม่ทุก 25 ปี กาวเย็บที่ใช้เป็นกาวสกัดจากธรรมชาติ
- **Featured tiles (3)**:
  1. label "Lanna Sofa" / eyebrow "Edition 04" / vibe "โซฟาผ้าฝ้ายสีครีมในห้องนั่งเล่นแสงเช้าผ่านม่านลินิน"
  2. label "Pin-leg Coffee Table" / eyebrow "Solid teak" / vibe "โต๊ะกาแฟไม้สักทรงกลมวางคู่กับแก้วชาในห้องที่มีต้นไม้"
  3. label "Reading Chair" / eyebrow "Hand-finished" / vibe "เก้าอี้นวมสีน้ำตาลเข้มในมุมอ่านหนังสือพร้อมโคมไฟทองเหลือง"
- **FAQ**:
  1. Q "ใช้ไม้สักจริงทุกชิ้นไหม?" / A "ใช่ ทุกชิ้นใช้ไม้สักจากสวนป่า FSC น่าน มีใบรับรองแหล่งที่มาแนบทุกชิ้น"
  2. Q "ส่งต่างจังหวัดได้ไหม?" / A "ส่งได้ทุกจังหวัด ค่าส่งคิดตามระยะทาง บริษัทมีทีมประกอบในเชียงใหม่และภูเก็ตด้วย"
- **Testimonial**: name "ภคพล ก." / role "สถาปนิก" / quote "ใช้กับลูกค้าโครงการบูทีคโฮเทล 3 โครงการแล้ว ทรงและเนื้อไม้ดีกว่าแบรนด์นำเข้าในราคาครึ่งเดียว"
- **Color overrides**: primary `#7c4a1e`, accent `#d7a86e`, background `#f5ede0`, foreground `#3a2818`, muted `#e8d5b7`
- **Visual signature**: every product photographed in a complete styled room scene with secondary props — feels like an interior-design book spread, not browsing a catalog. Type recipe: Kanit Medium for room scene captions, Prompt Regular body.
- **Why distinct**: only mid-century furniture store in the 25; scene-style photos (Pattern C lifestyle layout) and FSC certificate language vs. Hinoki's text-heavy storyteller layout.

---

## 9. Linen & Loom (ลินิน แอนด์ ลูม)

- **slug**: linen-and-loom
- **niche**: home
- **templateId**: `boutique`
- **paletteId**: `minimal`
- **brandVoice**: casual
- **landingThemeVariant**: fashion-beauty / Pattern A
- **Tagline (TH)**: ผ้าปูที่นอน ผ้าห่ม และผ้าม่านลินินทอด้วยมือ
- **Hero headline (TH)**: ผ้าลินินที่ยิ่งซัก ยิ่งนุ่ม
- **Hero subheadline (TH)**: ผ้าปูที่นอน ผ้าห่ม และผ้าม่านจากลินินยุโรปทอเอง สีย้อมธรรมชาติทั้งหมด ส่งภายใน 3 วันทำการ
- **Hero CTA label (TH)**: เลือกผ้าปูที่นอน
- **Announcement strip**: desktop "ซื้อชุดผ้าปูคู่ ฟรีปลอกหมอนเสริม 2 ใบ ตลอดเดือนพฤษภาคม" / mobile "ซื้อ 1 แถม 2"
- **About heading**: ลินินที่ยิ่งใช้ ยิ่งสบาย / **body**: เราใช้เส้นด้ายลินินจากเบลเยียม ทอผสมในนครชัยศรี ทุกผืนผ่านการ stone-wash ก่อนตัดเย็บ ทำให้สัมผัสนุ่มตั้งแต่วันแรกที่ใช้
- **Featured tiles (3)**:
  1. label "Stonewash Sheet Set" / eyebrow "Queen / King" / vibe "ผ้าปูที่นอนสีงาช้างปูบนเตียงในห้องที่มีแสงเช้า"
  2. label "Linen Curtain" / eyebrow "Custom length" / vibe "ผ้าม่านสีเทาอ่อนปลิวในลมเบาๆ หน้าต่างเปิด"
  3. label "Throw Blanket" / eyebrow "Made-to-order" / vibe "ผ้าห่มผืนหนาพาดบนเก้าอี้ไม้ในห้องสีขาวสะอาด"
- **FAQ**:
  1. Q "ซักได้ที่บ้านไหม?" / A "ซักเครื่องโปรแกรมถนอมผ้า น้ำเย็น 30°C ตากในที่ร่ม ลินินจะนุ่มขึ้นทุกการซัก"
  2. Q "ปรับขนาดได้ไหม?" / A "ผ้าม่านและผ้าปูสั่งตัดตามขนาดได้ บวกราคา 15% และระยะเวลาผลิตเพิ่ม 7 วัน"
- **Testimonial**: name "ศุภลักษณ์ ก." / role "Interior stylist" / quote "ผ้าปูชุดเดียวยังใช้อยู่หลัง 4 ปี ผ้านุ่มขึ้นเรื่อยๆ ไม่บางลง"
- **Color overrides**: primary `#2a2a2a`, accent `#8a8378`, background `#fbfaf7`, foreground `#1c1c1c`, muted `#ecebe5`
- **Visual signature**: extreme negative-space photography of folded linen, monochrome ivory palette with sage-gray accent — described as "calm Thai Kanit display + ivory palette" (large Kanit Light section heads, ample whitespace, Prompt Regular body, no serif, no magazine framing).
- **Why distinct**: minimal/ivory home-textile boutique vs. Korakot's warm-wood furniture two stores above; uses `boutique` template with hero-first Pattern A, oversized Kanit Light section heads, but no story-block emphasis.

---

## 10. Glow Lamp Co (โกลว แลมป์ โค.)

- **slug**: glow-lamp-co
- **niche**: home
- **templateId**: `classic`
- **paletteId**: `midnight`
- **brandVoice**: casual
- **landingThemeVariant**: trust / Pattern C
- **Tagline (TH)**: โคมไฟตั้งโต๊ะและโคมเพดาน ดีไซน์ตามแสง
- **Hero headline (TH)**: แสงที่ดี เริ่มที่หลอดที่ใช่
- **Hero subheadline (TH)**: โคมไฟตั้งโต๊ะ โคมเพดาน และโคมข้างเตียง พร้อมหลอดไฟแอลอีดี CRI 95+ ทุกชิ้น เลือกอุณหภูมิแสงได้ก่อนสั่ง
- **Hero CTA label (TH)**: ดูโคมตั้งโต๊ะ
- **Announcement strip**: desktop "แลกหลอดเก่าได้ส่วนลด 200 บาท · ส่งมาทางไปรษณีย์" / mobile "แลกหลอดเก่า -200.-"
- **About heading**: เริ่มจากดีไซเนอร์แสง / **body**: โกลวก่อตั้งโดยอดีตทีมออกแบบแสงของโรงแรม เราออกแบบโคมที่เลือกอุณหภูมิแสงได้ก่อนสั่ง และซ่อมง่ายเมื่อหลอดหมดอายุ
- **Featured tiles (3)**:
  1. label "Brass Desk Lamp" / eyebrow "2700K / 4000K" / vibe "โคมไฟตั้งโต๊ะทองเหลืองบนโต๊ะทำงานไม้ มีหนังสือและกาแฟ"
  2. label "Pendant Trio" / eyebrow "Dining set" / vibe "โคมแขวนสามชิ้นห้อยเหนือโต๊ะอาหารกระจกใส"
  3. label "Bedside Reading" / eyebrow "Touch dimmer" / vibe "โคมข้างเตียงทรงโดมสีน้ำเงินเข้มในห้องนอนแสงสลัว"
- **FAQ**:
  1. Q "หลอดไฟใช้กี่ปี?" / A "หลอด LED ในทุกรุ่นใช้งานได้ 25,000 ชั่วโมง (~10 ปีที่ 6 ชม./วัน) เปลี่ยนหลอดเองได้"
  2. Q "ติดตั้งโคมเพดานยากไหม?" / A "ทุกรุ่นใช้ขั้วมาตรฐาน E27 ติดตั้งเองได้ในเวลา 15 นาที มีคู่มือพร้อมส่ง"
- **Testimonial**: name "นันทพร ก." / role "เจ้าของร้านกาแฟ" / quote "ใช้โคมตั้งโต๊ะ 6 ตัวในร้าน หลังหนึ่งปียังไม่มีตัวไหนเสีย แสงสม่ำเสมอจริง"
- **Color overrides**: primary `#0f172a`, accent `#f59e0b`, background `#f8fafc`, foreground `#0f172a`, muted `#e2e8f0`
- **Visual signature**: every product card shows two thumbnails side-by-side — bulb off (cold) and bulb on (warm) — letting buyers visualize light temperature before buying.
- **Why distinct**: only `classic` template in the home cluster; midnight-navy palette with amber accent (the warmth of a bulb) — visually opposite of Linen & Loom's ivory minimalism.

---

## 11. Wavelength Audio (เวฟเลนท์)

- **slug**: wavelength-audio
- **niche**: electronics
- **templateId**: `single-product`
- **paletteId**: `bold`
- **brandVoice**: formal
- **landingThemeVariant**: electronics-tech / Pattern A
- **Tagline (TH)**: หูฟัง over-ear รุ่นเดียว ทุกอย่างทำเพื่อเสียง
- **Hero headline (TH)**: WV1 — หูฟังที่เราอยากใส่เอง
- **Hero subheadline (TH)**: หูฟัง over-ear ไดรเวอร์ planar magnetic ขนาด 50mm สั่งล่วงหน้า 14 วัน ผลิตในไต้หวัน รับประกัน 5 ปี
- **Hero CTA label (TH)**: สั่งจอง WV1
- **Announcement strip**: desktop "WV1 · จองเลย จัดส่ง 7 มิ.ย. รับประกัน 5 ปีทั่วโลก" / mobile "จัดส่ง 7 มิ.ย."
- **About heading**: WV1 = 4 ปีของการตัดส่วนที่ไม่จำเป็นออก / **body**: เราเริ่มจากคำถามว่า ถ้าทำหูฟังให้ตัวเองใช้คนเดียว จะต้องตัดอะไรออกบ้าง คำตอบคือ บลูทูธ, ANC, แอป, และไฟ RGB เหลือแต่เสียง
- **Featured tiles (3)**:
  1. label "Driver Tech" / eyebrow "Planar 50mm" / vibe "ภาพ exploded view ของไดรเวอร์ planar แสดงชั้น 7 ชั้น"
  2. label "Frequency Response" / eyebrow "20Hz–40kHz" / vibe "กราฟ frequency response เส้นเดียวบนพื้นดำ"
  3. label "Cable Set" / eยebrow "3 lengths included" / vibe "สายหูฟังสามเส้นพับเรียงบนพื้นหิน"
- **FAQ**:
  1. Q "ใช้ DAC ไหม?" / A "ความต้านทาน 32Ω ใช้กับ DAC พกพาได้ และต่อตรงกับโทรศัพท์ก็ยังเสียงดี"
  2. Q "ทำไมไม่ทำไร้สาย?" / A "การบีบอัดข้อมูลของบลูทูธทำให้คุณภาพเสียงลดลง 30-40% เราเลือกตัดออกเพื่อให้ทุก gram ทำงานเพื่อเสียง"
- **Testimonial**: name "อภิสิทธิ์ พ." / role "Mastering engineer" / quote "ใช้ master ผลงานในสตูดิโอแล้ว 8 เดือน ตอบสนองความถี่กลางดีกว่าหูฟังราคาเท่ากันที่เคยใช้"
- **Color overrides**: primary `#dc2626`, accent `#0a0a0a`, background `#fafafa`, foreground `#0a0a0a`, muted `#f4f4f5`
- **Visual signature**: entire homepage is one giant product photograph that scrolls; sticky "Buy Now" CTA pinned to bottom, bottom-nav hidden — no other products, no related rail. Spec callouts use Prompt Regular ALL-CAPS with +160 letter-spacing (no monospace) so the techy feel comes from rhythm, not font family.
- **Why distinct**: the only `single-product` template in the 27 — there is literally one SKU and the layout enforces it. Wavelength = obsessive flagship vs. the SKU-heavy stores around it.

---

## 12. Keystroke Lab (คีย์สโตรค แล็บ)

- **slug**: keystroke-lab
- **niche**: electronics
- **templateId**: `tech-compare` → **needs new bespoke adapter: สเปครก (`spec-rack`)**
- **paletteId**: `midnight`
- **brandVoice**: playful
- **landingThemeVariant**: electronics-tech / Pattern B
- **Tagline (TH)**: คีย์บอร์ดและเมาส์สำหรับสายโปรแกรมเมอร์
- **Hero headline (TH)**: เปรียบเทียบสวิตช์ก่อนซื้อ
- **Hero subheadline (TH)**: คีย์บอร์ดเมคคานิคอลและเมาส์ gaming เปรียบเทียบ spec ละเอียดทุกรุ่น ฟังเสียงสวิตช์ออนไลน์ก่อนซื้อ
- **Hero CTA label (TH)**: เปรียบเทียบสวิตช์
- **Announcement strip**: desktop "ฟังเสียงสวิตช์ออนไลน์ก่อนซื้อ — รุ่น Holy Panda กลับมาแล้ว" / mobile "Holy Panda กลับมาแล้ว"
- **About heading**: คีย์บอร์ดที่ไม่ตัด feature เพื่อราคา / **body**: คีย์สโตรคแล็บก่อตั้งโดย dev สามคนที่เบื่อคีย์บอร์ดราคาแพงแต่ feel แย่ ทุกรุ่นมี hot-swap socket กล่องเก็บเสียง โฟม และ PBT keycap
- **Featured tiles (3)**:
  1. label "TKL-65 Hotswap" / eyebrow "5-pin sockets" / vibe "คีย์บอร์ดสีดำพร้อม keycap ขาวบนโต๊ะมีไฟ RGB ลอดออกใต้คีย์"
  2. label "Wireless 75%" / eyebrow "2.4GHz + BT5" / vibe "คีย์บอร์ดสีฟ้าเข้มถ่ายโคลสอัพคีย์ enter"
  3. label "Switch Tester" / eyebrow "12 switches" / vibe "ตัวเทสเตอร์สวิตช์ 12 ช่อง พื้นหลังตารางวัด"
- **FAQ**:
  1. Q "ฟังเสียงสวิตช์ที่ไหน?" / A "ทุกหน้าสินค้ามีตัวอย่างเสียงสวิตช์ในห้อง treated booth ฟังได้ก่อนซื้อ"
  2. Q "เปลี่ยนสวิตช์เองได้ไหม?" / A "ทุกรุ่นเป็น hot-swap ไม่ต้องบัดกรี เปลี่ยนสวิตช์ได้ภายในไม่กี่นาที"
- **Testimonial**: name "วัชรพล จ." / role "Senior backend dev" / quote "เปรียบเทียบ spec ดีที่สุดเท่าที่เห็นในไทย ตัดสินใจซื้อ TKL-65 ใน 5 นาที"
- **Color overrides**: primary `#0f172a`, accent `#22d3ee`, background `#020617`, foreground `#e2e8f0`, muted `#1e293b`, border `#1e293b`
- **Visual signature**: dark cyan-on-near-black UI; every product card is a tight spec-rack (sw type, actuation force, polling rate, weight) instead of a photo-first card. Spec rows use Prompt Regular with +120 letter-spacing and tabular numerals (no monospace) — the techy density comes from layout, not font.
- **Why distinct**: only dark-mode store in the 27; spec-rows product card style is unique — sits in electronics-tech with comparison block enabled.

---

## 13. Smartloop Home (สมาร์ทลูป โฮม)

- **slug**: smartloop-home
- **niche**: electronics
- **templateId**: `catalog-dense`
- **paletteId**: `mint`
- **brandVoice**: casual
- **landingThemeVariant**: electronics-tech / Pattern B
- **Tagline (TH)**: อุปกรณ์สมาร์ทโฮม ครบทุกระบบในที่เดียว
- **Hero headline (TH)**: บ้านอัจฉริยะ เริ่มที่ปลั๊กตัวเดียว
- **Hero subheadline (TH)**: หลอดไฟ ปลั๊ก เซ็นเซอร์ และกล้องสมาร์ทโฮม ใช้ได้กับ Google Home, Alexa, HomeKit, Matter เลือกฟิลเตอร์ตามระบบที่บ้านใช้
- **Hero CTA label (TH)**: ดูทั้งหมด
- **Announcement strip**: desktop "ส่งฟรีในกรุงเทพ เมื่อสั่งครบ 990 บาท · ส่งภายในวันเดียว" / mobile "ส่งวันเดียว 990.-"
- **About heading**: เลือกของได้เหมือนเป็น engineer / **body**: สมาร์ทลูปก่อตั้งโดยทีม IoT engineer เราคัด SKU 500+ รายการ และทำตารางเปรียบเทียบให้ตรงตามมาตรฐาน Matter, Zigbee, Z-Wave, Wi-Fi
- **Featured tiles (3)**:
  1. label "Matter Plug" / eyebrow "16A · Energy meter" / vibe "ปลั๊กไฟสีขาวเสียบกำแพงโชว์หน้าจอ LED แสดงวัตต์"
  2. label "Motion Sensor" / eyebrow "Zigbee 3.0" / vibe "เซ็นเซอร์ทรงครึ่งวงกลมติดบนผนัง พื้นหลังเรียบ"
  3. label "Smart Bulb 4-pack" / eyebrow "16M colors" / vibe "หลอดไฟ 4 หลอดเปลี่ยนสีต่างกันถ่ายมุมท็อปบนพื้นเทา"
- **FAQ**:
  1. Q "ใช้กับ HomeKit ได้ไหม?" / A "เลือกฟิลเตอร์ 'HomeKit / Matter' ในแถบซ้ายของหน้าทุกหมวด เห็นเฉพาะรุ่นที่รองรับ"
  2. Q "ติดตั้งเองได้ไหม?" / A "ทุกอุปกรณ์มาพร้อมคู่มือภาษาไทย และ QR สำหรับ pair กับแอปในมือถือ"
- **Testimonial**: name "อาทิตย์ ส." / role "Solutions architect" / quote "ของครบที่สุดในไทย ตัวเดียวที่มี Matter จริงๆ ไม่ใช่แค่โฆษณา"
- **Color overrides**: primary `#059669`, accent `#34d399`, background `#f0fdf4`, foreground `#064e3b`, muted `#dcfce7`
- **Visual signature**: cover image hidden, search-in-top-bar, 3-column dense grid on mobile and 5 on desktop — looks like an electronics distributor portal, not a brand site.
- **Why distinct**: only `catalog-dense` template in the 25; high-SKU search-first layout vs. Wavelength's one-SKU page. Mint palette also signals "smart-home green = environmental + Matter."

---

## 14. Trailcraft Outdoors (เทรลคราฟต์)

- **slug**: trailcraft-outdoors
- **niche**: sport
- **templateId**: `sport-active` → **needs new bespoke adapter: สายลุยป่า (`trail-grit`)**
- **paletteId**: `earthy`
- **brandVoice**: casual
- **landingThemeVariant**: lifestyle / Pattern B
- **Tagline (TH)**: รองเท้าและเสื้อผ้าเทรล สำหรับนักวิ่งภูเขาในไทย
- **Hero headline (TH)**: ภูเขาทุกลูก เริ่มที่รองเท้าคู่เดียว
- **Hero subheadline (TH)**: รองเท้าเทรล กระเป๋าน้ำ และเสื้อผ้าเทคนิคัล ทดสอบบนเส้นทาง ITM, ภูกระดึง, ดอยอินทนนท์ ก่อนวางขาย
- **Hero CTA label (TH)**: ดูรองเท้าเทรล
- **Announcement strip**: desktop "Race Pack — สำหรับนักวิ่ง TIM2026 ส่งฟรีและพรีเซ็ตน้ำหนัก" / mobile "TIM2026 Race Pack"
- **About heading**: ทดสอบบนภูเขาไทยจริงๆ / **body**: เทรลคราฟต์ก่อตั้งโดยอดีตนักวิ่งทีมชาติ ทุกรุ่นถูกทดสอบบนเส้นทางจริงในไทย ไม่ใช่บนลู่วิ่ง เรามีตัวแทนทดสอบในเชียงใหม่ เลย และเพชรบูรณ์
- **Featured tiles (3)**:
  1. label "Phukradueng Trail" / eyebrow "Cushion 6mm" / vibe "รองเท้าเทรลคู่หนึ่งวางบนหินภูเขาเปียก พื้นหลังเป็นใบไม้"
  2. label "Race Vest 5L" / eyebrow "Soft flask incl." / vibe "เสื้อกั๊กบรรจุน้ำสีดำใส่กับขวดน้ำพับ ถ่ายในสตูดิโอแสงข้าง"
  3. label "Wind Jacket" / eyebrow "Packable to fist" / vibe "แจ็คเก็ตกันลมพับลงเป็นขนาดกำปั้น วางบนหิน"
- **FAQ**:
  1. Q "รองเท้าใส่วิ่งถนนได้ไหม?" / A "ใส่ได้ แต่ดอกยางจะสึกเร็วกว่าใส่บนเทรล ลองดูรุ่น Road-Trail Hybrid ถ้าสลับเส้นทาง"
  2. Q "เปลี่ยนไซส์ได้ไหม?" / A "ลองวิ่งจริง 50 กม. แล้วเปลี่ยนได้ภายใน 30 วัน หากคืนต้องสภาพไม่มีรอยเปียก"
- **Testimonial**: name "ตรีทศ ศ." / role "นักวิ่ง 100K finisher" / quote "ใช้รุ่น Phukradueng Trail ที่ TIM 100K ครบจบงานยังไม่เป็นแผลพอง"
- **Color overrides**: primary `#365314`, accent `#facc15`, background `#fdfbe8`, foreground `#1a2e05`, muted `#ecfccb`, border `#84cc16`
- **Visual signature**: topographic-line background watermark behind the catalog grid, performance badges (Drop 6mm / Stack 28mm / Weight 240g) on every card.
- **Why distinct**: only outdoor/trail store; olive-and-citrus earth palette + topo background watermark vs. Smartloop's clean mint catalog grid.

---

## 15. Saluki Yoga (ซาลูกิ)

- **slug**: saluki-yoga
- **niche**: sport
- **templateId**: `boutique`
- **paletteId**: `mint`
- **brandVoice**: casual
- **landingThemeVariant**: fashion-beauty / Pattern A
- **Tagline (TH)**: เสื้อผ้าโยคะและพีลาทิส ผลิตจากผ้ารีไซเคิล
- **Hero headline (TH)**: ขยับได้ทุกท่า ไม่ต้องดึงเสื้อ
- **Hero subheadline (TH)**: ชุดโยคะและพีลาทิสจากผ้ารีไซเคิล PET 100% ไม่หดและไม่ดึงรั้ง ตัดให้พอดีกับสรีระสาวเอเชีย
- **Hero CTA label (TH)**: ดูเลกกิ้ง
- **Announcement strip**: desktop "ทุกชุดทำจากขวดน้ำพลาสติก 18 ขวด ลดขยะลงทะเล" / mobile "18 ขวดต่อชุด"
- **About heading**: ผ้าที่ทำจากขวด / **body**: ซาลูกิทำงานกับโรงงานผ้าใน Bandung อินโดนีเซีย เส้นใยผ้าทุกผืนทำจากขวด PET ที่เก็บจากชายฝั่งจังหวัดอาเจะห์ คอลเลกชันละ 4 สี
- **Featured tiles (3)**:
  1. label "High-rise Legging" / eyebrow "Squat-proof" / vibe "เลกกิ้งสีเขียวมิ้นต์ใส่บนนักโยคะถ่ายในห้อง wellness ที่มีแสงนุ่ม"
  2. label "Cross-back Bra" / eyebrow "Medium support" / vibe "สปอร์ตบราสีครีมถ่ายเสริมในกระจกพร้อมเสื่อโยคะ"
  3. label "Wrap Skort" / eyebrow "Pilates-ready" / vibe "กระโปรงรัดด้านในสีเขียวอ่อนถ่ายโคลสอัพการเดิน"
- **FAQ**:
  1. Q "ใส่ว่ายน้ำได้ไหม?" / A "เนื้อผ้ารองรับการเปียกได้ แต่ออกแบบมาสำหรับการเหงื่อออก หากต้องการเล่นน้ำควรใช้ชุดว่ายน้ำโดยเฉพาะ"
  2. Q "ซักเครื่องได้ไหม?" / A "ซักเครื่องในถุงตาข่ายและตากในที่ร่ม หลีกเลี่ยงน้ำยาฟอกขาวและน้ำยาปรับผ้านุ่ม"
- **Testimonial**: name "พลอยใส ส." / role "ครูสอนพีลาทิส" / quote "ใส่สอน 5 คลาสต่อวัน หลังหกเดือนผ้ายังไม่เป็นเม็ดและไม่ยืดย้วย"
- **Color overrides**: primary `#0f766e`, accent `#a7f3d0`, background `#ecfdf5`, foreground `#064e3b`, muted `#d1fae5`
- **Visual signature**: story-block above the grid mentions "Made from 18 PET bottles", soft mint-and-cream palette feels spa-yoga not athletic-arena.
- **Why distinct**: yoga/pilates niche pivots `boutique` with calm mint palette and sustainability story — visually opposite of Trailcraft's rough outdoor grit (adjacent store, different mood entirely).

---

## 16. Tinyhand Wooden Toys (ทินี่แฮนด์)

- **slug**: tinyhand-wooden-toys
- **niche**: kids
- **templateId**: `kids-toys` → **needs new bespoke adapter: นอร์ดิกคราฟต์ (`nordic-craft`)**
- **paletteId**: `kraft` (new)
- **brandVoice**: playful
- **landingThemeVariant**: lifestyle / Pattern C
- **Tagline (TH)**: ของเล่นไม้สำหรับเด็กเล็ก ปลอดสารเคมี
- **Hero headline (TH)**: ของเล่นที่ส่งต่อให้รุ่นต่อไปได้
- **Hero subheadline (TH)**: ของเล่นไม้สำหรับเด็ก 0-5 ขวบ ทำจากไม้บีชจากสวนป่ายุโรป สีย้อมจากผัก ผ่านการทดสอบ EN71 และ ASTM F963
- **Hero CTA label (TH)**: เลือกตามอายุ
- **Announcement strip**: desktop "ของเล่นทุกชิ้นผ่านการทดสอบมาตรฐาน EU EN71-3" / mobile "ปลอดภัย EN71-3"
- **About heading**: ของเล่นที่ส่งต่อรุ่นต่อรุ่น / **body**: ทินี่แฮนด์ก่อตั้งโดยคุณแม่สามคน เราเริ่มจากของเล่นไม้ของลูกที่หาในไทยไม่ได้ ตอนนี้ผลิตเองที่จันทบุรี โดยใช้ไม้บีชนำเข้าและสีย้อมจากผัก
- **Featured tiles (3)**:
  1. label "Stacking Rainbow" / eyebrow "Ages 1+" / vibe "ของเล่นรุ้งไม้ 7 ชั้นบนพื้นไม้กับเด็กกำลังเล่น"
  2. label "Pull-along Duck" / eyebrow "Ages 2+" / vibe "เป็ดไม้ลากเชือกสีเหลืองถ่ายบนพื้นพรมขาว"
  3. label "Pretend Kitchen" / eyebrow "Ages 3+" / vibe "ครัวจำลองไม้สีพาสเทลในห้องเด็กที่มีแสงเช้า"
- **FAQ**:
  1. Q "สีย้อมปลอดภัยจริงไหม?" / A "ใช้สีย้อมจากผัก ผ่านการทดสอบ EN71-3 (heavy metals) ติดป้ายผลทดสอบในทุกหน้าสินค้า"
  2. Q "ของเล่นบิ่นแล้วซ่อมได้ไหม?" / A "ส่งกลับมาซ่อมได้ภายใน 5 ปี ค่าซ่อมเริ่ม 100 บาท เราเชื่อว่าของเล่นไม่ควรเป็นขยะ"
- **Testimonial**: name "ภัทรานิษฐ์ ก." / role "คุณแม่ของน้องอินดี้ 3 ขวบ" / quote "ซื้อ Stacking Rainbow มาตั้งแต่ลูกขวบนึง วันนี้ส่งต่อให้น้องอีกคนก็ยังใหม่"
- **Color overrides**: primary `#3a2e22`, accent `#c9974b`, background `#f7f1e3`, foreground `#3a2e22`, muted `#ebe1c8`
- **Visual signature**: kraft-paper texture background, colored tiles for age categories (1+, 2+, 3+, 4+), maker family photo at the bottom.
- **Why distinct**: only `kids-toys` template; warm kraft palette (NEW kraft palette) + age-colored category tiles + craft-paper aesthetic separates it from saturated kid-store stereotypes. NOT pet related — wooden toys only.

---

## 17. Petit Côté (เปอติ โคเต้)

- **slug**: petit-cote
- **niche**: kids
- **templateId**: `classic`
- **paletteId**: `minimal`
- **brandVoice**: casual
- **landingThemeVariant**: trust / Pattern C
- **Tagline (TH)**: เสื้อผ้าและของใช้เด็กเล็ก สไตล์ฝรั่งเศส
- **Hero headline (TH)**: เสื้อผ้าเด็กที่เลือกง่าย ใช้ทุกวัน
- **Hero subheadline (TH)**: เสื้อผ้า ผ้าอ้อม และของใช้สำหรับเด็ก 0-24 เดือน เนื้อผ้าออร์แกนิคคอตตอน 100% ตัดในโปรตุเกส ใส่ได้ตั้งแต่นอนยันออกข้างนอก
- **Hero CTA label (TH)**: ดูเสื้อผ้าเด็ก
- **Announcement strip**: desktop "ส่งฟรีทั่วประเทศ ในวันแรกที่สั่ง · ลงทะเบียนของขวัญฟรี" / mobile "ส่งฟรี + GIFT registry"
- **About heading**: เริ่มต้นจากชุดของลูก / **body**: เปอติ โคเต้ก่อตั้งโดยคุณแม่ที่เริ่มต้นจากการตามหาเสื้อผ้าเด็กออร์แกนิคในไทย เราคัดสรรแบรนด์เล็กจากยุโรปและนำมาผลิตเองในประเทศ
- **Featured tiles (3)**:
  1. label "Sleep & Play Bodysuit" / eyebrow "0-12M" / vibe "บอดี้สูทเด็กสีงาช้างพับวางคู่กันบนผ้าลินิน"
  2. label "Muslin Swaddle" / eyebrow "Set of 3" / vibe "ผ้าห่อตัวเด็กสามผืนพับเรียงในกล่องของขวัญ"
  3. label "Knit Cardigan" / eyebrow "Hand-loomed" / vibe "เสื้อคาร์ดิแกนถักสีน้ำตาลอ่อนแขวนกับไม้แขวนขนาดเล็ก"
- **FAQ**:
  1. Q "ลงทะเบียนของขวัญทำยังไง?" / A "สมัครฟรีในเมนู Gift Registry เลือกรายการที่อยากได้ คุณแม่เพื่อนๆ จะซื้อให้ตามรายการที่ระบุ"
  2. Q "ผ้าออร์แกนิคจริงไหม?" / A "ทุกผ้าผ่านการรับรอง GOTS (Global Organic Textile Standard) ผ้าอ้อมและบอดี้สูทผลิตในโรงงานออร์แกนิคที่โปรตุเกส"
- **Testimonial**: name "วันใหม่ จ." / role "คุณแม่ของน้องวารี" / quote "ใส่บอดี้สูท 6 เดือนตั้งแต่แรกเกิดจนหลุดสายสะดือ ไม่แดงเลย ผ้าเย็นจริง"
- **Color overrides**: primary `#525252`, accent `#fbcfe8`, background `#fafafa`, foreground `#27272a`, muted `#f4f4f5`
- **Visual signature**: extremely subdued ivory + pale pink "newborn pastel"; gift-registry sticker on hero — feels closer to Petit Bateau than to mass kidswear.
- **Why distinct**: only newborn (0-24M) focused store; minimal/airy palette + gift-registry call-out — visually opposite of Tinyhand's kraft toy world (adjacent store, opposite mood).

---

## 18. Inkstone Paper (อิงค์สโตน)

- **slug**: inkstone-paper
- **niche**: handmade
- **templateId**: `handmade` → **needs new bespoke adapter: คราฟต์เปเปอร์ (`kraft-paper`)**
- **paletteId**: `kraft` (new)
- **brandVoice**: formal
- **landingThemeVariant**: specialty / Pattern A
- **Tagline (TH)**: เครื่องเขียนญี่ปุ่นและสมุดทำมือ
- **Hero headline (TH)**: ปากกาที่ขีดได้เรียบ ตลอดทั้งชีวิต
- **Hero subheadline (TH)**: ปากกาหมึกซึม สมุดทำมือ และหมึกเฉพาะรุ่นนำเข้าจากญี่ปุ่น คัดเลือกจากร้านในเกียวโตและโตเกียว
- **Hero CTA label (TH)**: ดูปากกาทั้งหมด
- **Announcement strip**: desktop "ลอตใหม่จาก Tomoe River — สั่งล่วงหน้าก่อนคนอื่น" / mobile "Tomoe River drop"
- **About heading**: ผูกพันกับช่างทำสมุดในเกียวโต / **body**: อิงค์สโตนเริ่มจาก stationery shop เล็กๆ ในจังหวัดเชียงใหม่ ทำงานโดยตรงกับผู้ผลิตในญี่ปุ่นมา 8 ปี รวมถึง Hobonichi, Tomoe River, Sailor, Pilot, และนักทำหมึกอิสระ
- **Featured tiles (3)**:
  1. label "Sailor 1911 Standard" / eyebrow "14k nib" / vibe "ปากกาหมึกซึมสีดำบนกระดาษวาดเส้น พื้นไม้"
  2. label "Hobonichi Cousin 2026" / eyebrow "Pre-order" / vibe "สมุดบันทึกฟ้าอ่อนเปิดอยู่บนโต๊ะคู่กับปากกาและกาแฟ"
  3. label "Indigo Ink Bottle" / eyebrow "30ml · limited" / vibe "ขวดหมึกแก้วสีน้ำเงินเข้มถ่ายโคลสอัพแสงตัดเงา"
- **FAQ**:
  1. Q "เปลี่ยน nib ได้ไหม?" / A "Sailor และ Pilot เปลี่ยน nib ที่ร้านเราในเชียงใหม่ได้ ค่าบริการเริ่ม 800 บาท"
  2. Q "หมึกใช้กับปากกายี่ห้ออื่นได้ไหม?" / A "หมึกทุกขวดเป็น water-based ใช้กับปากกาหมึกซึมส่วนใหญ่ได้ ดูคำเตือนเฉพาะรุ่นในหน้าสินค้า"
- **Testimonial**: name "ปองพล ก." / role "นักประดิษฐ์อักษร" / quote "เป็นร้านเดียวในไทยที่หา Tomoe River กรัมหนาได้ และเจ้าของร้านตอบทุก spec ของกระดาษให้ละเอียดมาก"
- **Color overrides**: primary `#3a2e22`, accent `#c9974b`, background `#f7f1e3`, foreground `#3a2e22`, muted `#e6dcc4`
- **Visual signature**: maker portrait at top; product photos shot top-down on washi paper with hand-written Thai/Japanese eyebrow labels.
- **Why distinct**: only Japanese-stationery store; kraft palette shared with Tinyhand but `handmade` template gives maker-portrait + narrative — Tinyhand is colored category tiles, Inkstone is scholarly hand-made.

---

## 19. Pigment Studio (พิกเมนต์ สตูดิโอ)

- **slug**: pigment-studio
- **niche**: handmade
- **templateId**: `boutique`
- **paletteId**: `sunset`
- **brandVoice**: playful
- **landingThemeVariant**: fashion-beauty / Pattern A
- **Tagline (TH)**: สีน้ำ พู่กัน และกระดาษวาดภาพ
- **Hero headline (TH)**: สีน้ำที่นักวาดอินดี้เลือกใช้
- **Hero subheadline (TH)**: สีน้ำ Daniel Smith, Schmincke พู่กันโคลินสกีและพู่กันสังเคราะห์ พร้อมกระดาษวาดภาพระดับ professional
- **Hero CTA label (TH)**: ดูชุดเริ่มต้น
- **Announcement strip**: desktop "Workshop วาดสีน้ำ ฟรี! ทุกวันเสาร์แรกของเดือนที่กรุงเทพ" / mobile "Workshop ฟรี เสาร์แรก"
- **About heading**: ร้านที่นักวาดเปิดให้นักวาด / **body**: พิกเมนต์ สตูดิโอก่อตั้งโดยนักวาดสีน้ำสองคน เราคัดสีน้ำและพู่กันที่เราใช้เองทุกชิ้น ทุก swatch ในหน้าสินค้าวาดด้วยมือ
- **Featured tiles (3)**:
  1. label "Beginner Set 12" / eyebrow "PWC half-pan" / vibe "กล่องสีน้ำ 12 สีเปิดอยู่บนกระดาษวาดที่มี swatch ระบายอยู่"
  2. label "Kolinsky #6" / eyebrow "Da Vinci 36" / vibe "พู่กันด้ามไม้สามอันบนพื้นผ้ากำมะหยี่สีน้ำตาล"
  3. label "Watercolor Pad 200gsm" / eyebrow "Cold-press" / vibe "กระดาษวาดภาพเปิดอยู่บนโต๊ะกับจานสีและน้ำในแก้ว"
- **FAQ**:
  1. Q "เปิดสีน้ำหลอดแล้วเก็บได้นานแค่ไหน?" / A "สีน้ำคุณภาพ professional เก็บได้ 5-10 ปีหากไม่โดนแสงแดดตรง ในประเทศไทยเก็บในกล่อง dry box ได้นานขึ้น"
  2. Q "พู่กันโคลินสกีต่างกันยังไง?" / A "Kolinsky red sable ดูดน้ำได้มากกว่า synthetic 2-3 เท่า เหมาะกับ wash ใหญ่ ราคาสูงกว่าแต่ทนกว่า 3-5 ปี"
- **Testimonial**: name "ใบไม้ ส." / role "ครูสอนสีน้ำออนไลน์" / quote "ส่งของไว swatch ถ่ายจริงทุกสี ดีกว่าสั่ง Amazon เพราะเสียค่าส่งและภาษีไม่ได้"
- **Color overrides**: primary `#f97316`, accent `#facc15`, background `#fff7ed`, foreground `#7c2d12`, muted `#fed7aa`
- **Visual signature**: every color in the catalog shows a hand-painted swatch sample (not a square color block) — the swatch is the photo.
- **Why distinct**: only art-supplies/watercolor store; sunset orange-yellow palette + hand-painted swatches separate it from Inkstone's serious kraft stationery world.

---

## 20. Volt-7 Garage (โวลต์เซเว่น การาจ)

- **slug**: volt-7-garage
- **niche**: motorcycle accessories / custom parts (สายซิ่ง · แต่งมอไซค์)
- **templateId**: `catalog-dense` → **needs new bespoke adapter: สายซิ่ง (`street-racer`)**
- **paletteId**: `noir` (new)
- **brandVoice**: playful
- **landingThemeVariant**: electronics-tech / Pattern B
- **Tagline (TH)**: ของแต่งมอไซค์สายซิ่ง · ติดตั้งเป็น ใส่ตรงรุ่น
- **Hero headline (TH)**: ขี่จริง แต่งจริง ไม่ขายของเก๊
- **Hero subheadline (TH)**: ท่อแต่ง แฮนด์บาร์ กระจกมองข้าง แฟริ่ง สติกเกอร์ และชุดขี่ — สเปกตรงรุ่น CB650R / MT-07 / R3 / GPX / Wave 125 ส่งจากคลังลาดพร้าวภายในวันเดียว
- **Hero CTA label (TH)**: ล็อคขนาดตามรุ่นรถ
- **Announcement strip**: desktop "ล็อกรุ่นรถก่อน — ฟิลเตอร์โชว์เฉพาะของที่ใส่ได้จริง · ส่งวันเดียวในกรุงเทพ" / mobile "ล็อกรุ่นรถก่อนสั่ง"
- **About heading**: เปิดในซอยลาดพร้าว 18 ปี / **body**: โวลต์เซเว่นเริ่มจากร้านแต่งรถเล็กๆ ในซอยลาดพร้าว เจ้าของขี่ Big Bike เอง ทุกชิ้นที่ลงขายผ่านการใส่กับรถจริงในการาจก่อน ไม่มีของก๊อปแบรนด์ ไม่มีของไม่รู้แหล่ง สเปกตรงกับที่เขียน ค่าทอร์คตรงกับที่โชว์
- **Featured tiles (3)**:
  1. label "ท่อสลิปออน Yoshimura R-77S" / eyebrow "+8 แรงม้า" / vibe "ท่อไอเสียไทเทเนียมสะท้อนแสงเหลืองอิเล็กทริก ถ่ายบนพื้นยางมะตอยเปียก มีประกายไฟกระเด็น"
  2. label "แฮนด์เรนเซอร์ Rizoma" / eyebrow "อะลูมิเนียม CNC" / vibe "แฮนด์บาร์อะลูมิเนียมสีดำด้านวางบนพื้นเหล็กลาย ถ่ายไฟตัดเงาสีเหลือง"
  3. label "ชุดขี่หนัง Dainese" / eyebrow "CE Level 2" / vibe "ชุดขี่หนังดำแขวนในการาจกับมอไซค์เนคเก็ต พื้นปูนเปลือยและสปอตไลต์"
- **FAQ**:
  1. Q "ของที่ขายใส่กับรถผมได้รึเปล่า?" / A "ล็อครุ่นรถจากแถบฟิลเตอร์ด้านบน ระบบจะโชว์เฉพาะของที่ใส่ตรงรุ่น ไม่ต้องเดา ถ้าเลือกผิดส่งคืนได้ใน 7 วันโดยไม่เสียค่าส่ง"
  2. Q "มี่ใบรับประกันท่อแต่งไหม?" / A "ท่อทุกใบมีใบ COC จากแบรนด์ รับประกันรอยร้าวเชื่อม 1 ปี กรณีท่อ aftermarket ที่ไม่ผ่านมาตรฐาน Euro 4 ระบุชัดในหน้าสินค้า ไม่เคลมว่าผ่าน"
- **Testimonial**: name "เอก ส." / role "เจ้าของ CB650R · ลูกค้า 3 ปี" / quote "ใส่ท่อ Yoshimura จากร้านนี้ บูตเสียงดีกว่าที่อื่นเพราะร้านลองใส่กับรถผมก่อนถึงปล่อย คนอื่นแค่ส่งของมา"
- **Color overrides**: primary `#0a0a0a`, accent `#facc15`, background `#0a0a0a`, foreground `#fafafa`, border `#1f1f1f`, ring `#facc15`, muted `#171717`
- **Visual signature**: dark-base UI (near-black #0a0a0a) with single electric-yellow accent #facc15; ALL-CAPS Kanit ExtraBold display headlines pushed to massive sizes; PDP shows oversized tachometer/torque-style numeric stat blocks (แรงม้า / ทอร์ค / น้ำหนัก / dB) with Prompt Regular ALL-CAPS + tabular numerals (no monospace, no serif); subtle spark/grit photographic textures behind hero band; sticky "ล็อคขนาดให้ตรงรถ" filter chip strip pinned under the hero with rider-selectable chips (CB650R · MT-07 · R3 · GPX · Wave 125 · ทุกรุ่น); aggressive product cards with thin yellow underline accents and no soft shadows.
- **Why distinct**: only motorcycle-customization / street-racer store in the 27; near-black dark-mode + electric-yellow accent + sticky model-lock filter strip + tachometer-stat PDP layout is visually distinct from Keystroke Lab's dark cyan spec-rack (different niche, different filter mechanic, different accent hue) and a complete tonal flip from Hinoki Apothecary two stores away. NO subscription mechanic — single-purchase only.

---

## 21. Mai Hatthakam (ใหม่ หัตถกรรม)

- **slug**: mai-hatthakam
- **niche**: handmade
- **templateId**: `handmade`
- **paletteId**: `earthy`
- **brandVoice**: formal
- **landingThemeVariant**: specialty / Pattern A
- **Tagline (TH)**: เซรามิกทำมือจากเตาดินเผาที่เชียงราย
- **Hero headline (TH)**: ทุกใบ ปั้นด้วยมือ
- **Hero subheadline (TH)**: แก้ว ถ้วยชา และจาน ทำมือทีละชิ้นที่เชียงราย ดินแม่ขมิ้นจากแม่อาย เคลือบขี้เถ้าจากแกลบข้าวเหนียว ผลิตเป็นล็อต 20 ชิ้น
- **Hero CTA label (TH)**: ดูล็อตล่าสุด
- **Announcement strip**: desktop "Studio Visit · เปิดให้เข้าชมเตาเผาที่เชียงราย ทุกวันเสาร์" / mobile "เข้าชมเตาเผาเสาร์"
- **About heading**: เตาเผาดินที่ไม่เคยปิด / **body**: ใหม่ หัตถกรรมก่อตั้งโดยช่างปั้นสองคน ทำงานในเตาดินเผาแบบไม้ฟืน 1280°C เผาเดือนละสองครั้ง ทุกชิ้นมีลายเซ็นช่างเขียนใต้ก้น
- **Featured tiles (3)**:
  1. label "Tea Cup Set 4" / eyebrow "Wood-fired" / vibe "ถ้วยชาดินสีน้ำตาลครีมสี่ใบเรียงบนแผ่นไม้ มีเงาแสงเช้า"
  2. label "Dinner Plate 26cm" / eyebrow "Ash glaze" / vibe "จานเซรามิกใบโตวางคู่กับอาหารไทยถ่ายมุมท็อป"
  3. label "Bud Vase" / eyebrow "One-off" / vibe "แจกันดอกไม้เดี่ยวบนโต๊ะไม้ มีดอกหญ้าเสียบหนึ่งช่อ"
- **FAQ**:
  1. Q "ใช้ในไมโครเวฟได้ไหม?" / A "ใช้ได้ทั้งหมด เพราะเป็น stoneware เผาที่ 1280°C เนื้อแน่นไม่ดูดน้ำ ห้ามเฉพาะรุ่นที่มีลายขีดทอง"
  2. Q "สีไม่เหมือนรูปได้ไหม?" / A "เนื่องจากเป็นการเผาเตาไม้ฟืน สีและพื้นผิวของแต่ละชิ้นจะต่างกันเล็กน้อย เราถือว่านี่คือเอกลักษณ์ของงาน"
- **Testimonial**: name "ปัทมา ภ." / role "เจ้าของร้านชา" / quote "ใช้ถ้วยชาในร้านสามปีแล้ว สึกแบบสวยขึ้น ไม่มีถ้วยใดสีหรือลายเหมือนกันสองใบ"
- **Color overrides**: primary `#7c2d12`, accent `#d97706`, background `#fef9f1`, foreground `#3a1a07`, muted `#fde8c8`
- **Visual signature**: maker portrait of the potter at the wheel, kiln-fire photos in the about section, each PDP photo shows the artist signature on the bottom.
- **Why distinct**: shares `handmade` template + earthy palette with Inkstone, but it's pottery instead of paper — and the visual signature is wood-fired kiln imagery instead of Japanese washi.

---

## 22. Carbon Era Cameras (คาร์บอน เอร่า)

- **slug**: carbon-era-cameras
- **niche**: vintage
- **templateId**: `vintage`
- **paletteId**: `noir` (new)
- **brandVoice**: formal
- **landingThemeVariant**: specialty / Pattern B
- **Tagline (TH)**: กล้องฟิล์มและเลนส์มือสองคัดเกรด
- **Hero headline (TH)**: กล้องที่ผ่านการตรวจสภาพ 24 จุด
- **Hero subheadline (TH)**: กล้องฟิล์ม Leica, Hasselblad, Rolleiflex มือสองคัดเกรด ผ่านการตรวจสภาพ 24 จุด รับประกันชัตเตอร์ 90 วัน
- **Hero CTA label (TH)**: ดู Leica วันนี้
- **Announcement strip**: desktop "วันนี้: Leica M6 Black 1985 เพิ่งเข้า — สภาพ Excellent Plus" / mobile "Leica M6 เข้าใหม่"
- **About heading**: คัดทีละตัว ตรวจทีละจุด / **body**: คาร์บอน เอร่าก่อตั้งโดยช่างซ่อมกล้องฟิล์มในกรุงเทพฯ 18 ปี ทุกกล้องถูกตรวจชัตเตอร์ ตรวจซีล ตรวจรูรับแสง ก่อนวางขาย ระบุสภาพชัดเจน
- **Featured tiles (3)**:
  1. label "Leica M6 1985" / eyebrow "Excellent Plus" / vibe "กล้อง Leica M6 ดำถ่ายมุม 45 องศาบนพื้นหินอ่อนสีดำ"
  2. label "Hasselblad 500CM" / eyebrow "With 80mm" / vibe "กล้อง Hasselblad medium format ตั้งบนขาตั้งกล้องในห้องสตูดิโอ"
  3. label "Rolleiflex 2.8F" / eyebrow "CLA serviced" / vibe "กล้อง Rolleiflex twin-lens ถ่ายมุมบนพื้นกระจกสะท้อนเงา"
- **FAQ**:
  1. Q "รับประกันอะไรบ้าง?" / A "ชัตเตอร์ ฟิล์มแอดวานซ์ ระบบวัดแสง รับประกัน 90 วัน นอกจากนี้ระบุในใบรายงานตรวจสภาพ"
  2. Q "ส่งฟิล์มทดลองให้ไหม?" / A "ทุกกล้องมาพร้อมฟิล์ม Kodak Gold 1 ม้วน ถ่ายทดสอบในวันแรก ถ้าไม่พอใจคืนเงิน 100%"
- **Testimonial**: name "ดร. กฤษฎา ภ." / role "ช่างภาพอิสระ" / quote "ซื้อ Leica M3 จากที่นี่เมื่อปีที่แล้ว ตรวจสภาพละเอียดมาก สภาพตรงตามที่ระบุทุกจุด"
- **Color overrides**: primary `#0a0a0a`, accent `#a1a1aa`, background `#fafafa`, foreground `#0a0a0a`, border `#27272a`, ring `#52525b`
- **Visual signature**: every product card shows a "Condition" badge with a numeric grade (Mint / Excellent+ / Excellent / Very Good / Good), and the inspection-checklist sheet is a downloadable PDF link on each PDP.
- **Why distinct**: only vintage camera store; condition badges + unique-item mode + noir ivory palette (Kanit Black titles, Prompt body, no serif) differ sharply from Mai's earthy handmade ceramics.

---

## 23. Reclaim Leather (รีเคลม เลเธอร์)

- **slug**: reclaim-leather
- **niche**: handmade
- **templateId**: `handmade`
- **paletteId**: `kraft` (new)
- **brandVoice**: casual
- **landingThemeVariant**: specialty / Pattern A
- **Tagline (TH)**: กระเป๋าและเครื่องหนังจากเศษหนังเหลือใช้
- **Hero headline (TH)**: เศษหนังจากโรงงาน ที่เราเย็บมือทุกใบ
- **Hero subheadline (TH)**: กระเป๋าสะพายข้าง วอลเล็ต และเครื่องหนังจากเศษหนัง vegetable-tanned จากโรงงานในกรุงเทพ เย็บมือทุกใบ ใช้ทนได้ 10 ปี
- **Hero CTA label (TH)**: ดูกระเป๋าสะพายข้าง
- **Announcement strip**: desktop "Repair-for-life · ส่งกลับมาซ่อมได้ตลอดอายุการใช้งาน" / mobile "Repair-for-life"
- **About heading**: เศษหนังจากโรงงาน / **body**: รีเคลมก่อตั้งจากความตั้งใจที่จะใช้เศษหนังที่โรงงานทิ้ง เรารับเศษหนัง vegetable-tanned จากโรงงานในกรุงเทพ ตัดและเย็บมือในเชียงใหม่ ทุกใบมีลายเซ็นช่าง
- **Featured tiles (3)**:
  1. label "Crossbody Bag" / eyebrow "Reclaimed cuts" / vibe "กระเป๋าสะพายข้างหนังสีน้ำตาลแขวนบนผนังไม้ในเวิร์คชอป"
  2. label "Bi-fold Wallet" / eyebrow "Hand-stitched" / vibe "วอลเล็ตหนังเปิดอยู่บนโต๊ะไม้พร้อมเข็มและด้าย"
  3. label "Repair Service" / eyebrow "Lifetime" / vibe "ช่างกำลังเย็บกระเป๋าด้วยมือ ถ่ายโคลสอัพมือและด้าย"
- **FAQ**:
  1. Q "ทำไมเศษหนัง?" / A "โรงงานเครื่องหนังทิ้งเศษราว 15-25% ของหนังที่ซื้อมา เรารับซื้อต่อแล้วใช้ทำกระเป๋าที่เย็บมือ จึงไม่มีกระเป๋าสองใบที่ลวดลายเหมือนกัน"
  2. Q "ซ่อมได้ไหมถ้าด้ายขาด?" / A "ทุกกระเป๋าซ่อมได้ตลอดชีวิต ส่งมาที่ร้านในเชียงใหม่ ค่าซ่อมเริ่ม 200 บาท หรือฟรีถ้าเป็นการเย็บที่หลุด"
- **Testimonial**: name "ชยพล ก." / role "ช่างภาพ" / quote "ใช้กระเป๋ารีเคลมมา 3 ปี เคยส่งซ่อมครั้งเดียวเสียค่าส่ง วันนี้กระเป๋ายังเหมือนใหม่"
- **Color overrides**: primary `#5b3a1e`, accent `#c9974b`, background `#f4ead8`, foreground `#2a1a09`, muted `#e6d7b8`
- **Visual signature**: hand-stitching close-up shots and "Repair-for-life" badge on every product card; the maker portrait is the artisan threading needle.
- **Why distinct**: third `handmade`-template store but tactically different — Reclaim's photography is about THREAD and STITCH closeups, vs. Mai's clay-on-wheel imagery and Inkstone's paper top-downs.

---

## 24. Bulkbox Industrial (บัลค์บ็อกซ์ อินดัสเทรียล)

- **slug**: bulkbox-industrial
- **niche**: wholesale
- **templateId**: `wholesale-b2b`
- **paletteId**: `midnight`
- **brandVoice**: formal
- **landingThemeVariant**: business-model / Pattern B
- **Tagline (TH)**: ส่งของอุตสาหกรรม ราคาขายส่ง ขั้นต่ำ 50 ชิ้น
- **Hero headline (TH)**: ราคาขายส่งสำหรับธุรกิจ ตามจำนวนที่สั่ง
- **Hero subheadline (TH)**: อะไหล่อุตสาหกรรม สกรู ลวด น็อต และอุปกรณ์ติดตั้ง ขายส่งให้ธุรกิจ ระบบ pricing tier ตามจำนวน เริ่มขั้นต่ำ 50 ชิ้น
- **Hero CTA label (TH)**: ขอใบเสนอราคา
- **Announcement strip**: desktop "เปิดให้ธุรกิจสมัคร — ตรวจสอบเอกสารภายใน 48 ชั่วโมง" / mobile "สมัครธุรกิจ"
- **About heading**: ผู้กระจายสินค้าอุตสาหกรรม / **body**: บัลค์บ็อกซ์ดำเนินการตั้งแต่ปี 2014 จากคลังในระยอง ส่งสินค้าอุตสาหกรรมให้ลูกค้าธุรกิจกว่า 800 ราย รวมโรงงานยานยนต์ อิเล็กทรอนิกส์ และก่อสร้าง
- **Featured tiles (3)**:
  1. label "M8 Stainless Bolts" / eyebrow "MOQ 500" / vibe "สกรูสแตนเลส M8 จัดวางบนพื้นเทาเป็นแถวเรียง"
  2. label "Cable Conduit 25mm" / eyebrow "MOQ 100m" / vibe "ท่อร้อยสายไฟพีวีซีสีดำม้วนวางในคลังสินค้า"
  3. label "Industrial Adhesive" / eyebrow "MOQ 50 tubes" / vibe "หลอดกาวอุตสาหกรรมเรียงเป็นแถวบนพื้นโลหะ"
- **FAQ**:
  1. Q "ระบบ pricing tier ทำงานยังไง?" / A "ราคา/ชิ้นจะลดเมื่อสั่งจำนวนถึง tier ต่อไป เช่น 50-99: 25.-/ชิ้น | 100-499: 22.-/ชิ้น | 500+: 18.-/ชิ้น"
  2. Q "ใช้เวลาขนส่งกี่วัน?" / A "กรุงเทพและปริมณฑล 1 วันทำการ ต่างจังหวัด 2-3 วันทำการ มีบริการรถบรรทุกร่วมขนส่งสำหรับออเดอร์ใหญ่"
- **Testimonial**: name "บริษัท ฯ. จำกัด" / role "ผู้จัดการฝ่ายจัดซื้อ" / quote "ใช้ Bulkbox ส่งอะไหล่ให้สายการผลิต 18 เดือนแล้ว ราคาคงที่และส่งตรงเวลา 99%"
- **Color overrides**: primary `#0f172a`, accent `#0284c7`, background `#f8fafc`, foreground `#0f172a`, muted `#e2e8f0`, border `#cbd5e1`
- **Visual signature**: b2b verified badge in header, pricing-tier table dominates the homepage (tier × price × MOQ × lead-time grid).
- **Why distinct**: only `wholesale-b2b` template; pricing-tier table replaces the product card grid as the primary block — completely different shopping flow from B2C.

---

## 25. Pastel Pack (พาสเทล แพ็ค)

- **slug**: pastel-pack
- **niche**: wholesale
- **templateId**: `eco-pack` (existing full multi-page template — chrome already built)
- **paletteId**: `mint`
- **brandVoice**: casual
- **landingThemeVariant**: business-model / Pattern C
- **Tagline (TH)**: บรรจุภัณฑ์รักษ์โลกสำหรับร้านคราฟต์
- **Hero headline (TH)**: บรรจุภัณฑ์ที่ลูกค้าเก็บไว้
- **Hero subheadline (TH)**: กล่องลูกฟูก ถุงคราฟท์ และสติกเกอร์ย่อยสลายได้ สำหรับร้านคราฟต์ ร้านขนม และร้านเครื่องสำอางเล็ก ราคาเริ่มที่ 100 ชิ้น
- **Hero CTA label (TH)**: เลือกกล่องตามขนาด
- **Announcement strip**: desktop "พิมพ์โลโก้ฟรี เมื่อสั่งครบ 500 ชิ้น" / mobile "พิมพ์โลโก้ฟรี 500.-"
- **About heading**: บรรจุภัณฑ์รักษ์โลก / **body**: พาสเทล แพ็คเริ่มจากร้านคราฟต์ที่ต้องการบรรจุภัณฑ์ดีๆ ในจำนวนเล็ก ตอนนี้เราผลิตเองที่นครปฐม กระดาษทุกผืน FSC ทุกกล่องย่อยสลายได้ใน 6 เดือน
- **Featured tiles (3)**:
  1. label "Mailer Box Small" / eyebrow "From 100 pcs" / vibe "กล่องลูกฟูกสีน้ำตาลธรรมชาติเรียงเป็นแถว ใช้ในการขนส่ง"
  2. label "Kraft Tote Bag" / eyebrow "Custom print" / vibe "ถุงคราฟท์สีน้ำตาลพิมพ์โลโก้สีดำ พื้นหลังขาว"
  3. label "Thank You Stickers" / eyebrow "Compostable" / vibe "สติกเกอร์ขอบคุณวงกลมหลายแบบเรียงบนพื้นเทาอ่อน"
- **FAQ**:
  1. Q "พิมพ์โลโก้ใช้เวลาเท่าไหร่?" / A "ส่งไฟล์โลโก้ในการสั่งซื้อ พิมพ์เสร็จใน 5 วันทำการ ฟรีสำหรับการสั่งครบ 500 ชิ้น"
  2. Q "สั่งขั้นต่ำกี่ชิ้น?" / A "กล่องเริ่ม 100 ชิ้น/ขนาด ถุงคราฟท์เริ่ม 200 ชิ้น สติกเกอร์เริ่ม 50 ชิ้น"
- **Testimonial**: name "ขนิษฐา ก." / role "เจ้าของร้านขนมโฮมเมด" / quote "ลูกค้าถ่ายรูปกล่องลงไอจีทุกครั้ง คุ้มกว่าค่าโฆษณามาก"
- **Color overrides**: primary `#0f766e`, accent `#fde68a`, background `#f0fdfa`, foreground `#0f4a44`, muted `#ccfbf1`
- **Visual signature**: uses the existing `EcoPack*` chrome adapters — earthy/mint hybrid with kraft-paper PDP photography. Visual signature provided by the already-built `eco-pack` adapters.
- **Why distinct**: only store using the pre-built `eco-pack` full-page chrome — and it's a B2C-friendly wholesale (low MOQ 100 vs. Bulkbox's 500) — visually opposite of Bulkbox's b2b table format.

---

## 26. Saidee Gadgets (ใช้ดี แกดเจ็ตส์)

- **slug**: saidee-gadgets
- **niche**: electronics
- **templateId**: `single-vendor-shop` → **needs new bespoke adapter: ตลาดสีสด (`taobao-vibrant`)**
- **paletteId**: `bold`
- **brandVoice**: playful
- **landingThemeVariant**: electronics-tech / Pattern A
- **Tagline (TH)**: เคสมือถือ สายชาร์จ และแก็ดเจ็ตไลฟ์สไตล์ ราคาโรงงาน
- **Hero headline (TH)**: เคสใหม่ทุกอาทิตย์ · ลดสูงสุด 50%
- **Hero subheadline (TH)**: ร้านเดียวจบ เคสมือถือ สายชาร์จ หัวชาร์จเร็ว และของแต่งโต๊ะ เลือกได้กว่า 800 รายการ ส่งจากคลังนนทบุรี ส่งภายในวันเดียว ส่งฟรีเมื่อสั่งครบ 199 บาท
- **Hero CTA label (TH)**: ดูที่ลดราคา
- **Announcement strip**: desktop "ส่งฟรี 199.- · เคลม 30 วัน · เก็บปลายทางได้ทั่วประเทศ" / mobile "ส่งฟรี 199.- · เก็บปลายทาง"
- **About heading**: ร้านเดียว เจ้าเดียว ส่งเอง / **body**: ใช้ดี แกดเจ็ตส์เป็นร้านของเราเอง ไม่ใช่มาร์เก็ตเพลส ไม่ใช่ผู้ขายหลายเจ้า เราเป็นเจ้าของสต็อกทุกชิ้น ตรวจคุณภาพก่อนแพ็ค คลังอยู่ที่นนทบุรี ส่งภายในวันเดียวสำหรับออเดอร์ก่อนเที่ยง
- **Featured tiles (3)**:
  1. label "เคสใส iPhone 15" / eyebrow "ลด 50%" / vibe "เคสใสติดสติกเกอร์ลดราคาสีแดง ถ่ายมุมท็อปบนพื้นไล่สีส้ม-เหลือง มีดาวกระจาย"
  2. label "หัวชาร์จเร็ว 65W" / eyebrow "HOT" / vibe "หัวชาร์จ GaN สีขาวคู่สายฟ้า ปั๊มสติกเกอร์ HOT สีเหลือง ถ่ายบนพื้นแดงสด"
  3. label "ไฟตั้งโต๊ะ RGB" / eyebrow "ส่งฟรี" / vibe "ไฟตั้งโต๊ะเปลี่ยนสี RGB ติดป้ายราคา 199.- สีเหลือง พื้นหลังกราเดียนต์ส้ม"
- **FAQ**:
  1. Q "ร้านนี้คือมาร์เก็ตเพลสรึเปล่า?" / A "ไม่ใช่ ใช้ดี แกดเจ็ตส์เป็นร้านของเราเอง สินค้าทุกชิ้นเราเป็นเจ้าของสต็อก ไม่มีผู้ขายรายอื่นในร้านเรา"
  2. Q "ของแท้ไหม?" / A "เคสและสายชาร์จเป็นแบรนด์เฮ้าส์ของร้านเราเอง ออกแบบเองสั่งผลิตในจีนและเวียดนาม ไม่ใช่สินค้าเลียนแบรนด์ของผู้อื่น"
- **Testimonial**: name "พีรพัฒน์ ส." / role "ลูกค้าประจำ ซื้อมาแล้ว 24 ครั้ง" / quote "ราคาถูกจริง ส่งไวจริง ของไม่หลุดสเปกที่ลงรูป ซื้อเคสมาแล้ว 12 อันยังใช้ได้ทุกอัน"
- **Color overrides**: primary `#dc2626`, accent `#f97316`, background `#fff7ed`, foreground `#7f1d1d`, muted `#fed7aa`, border `#fdba74`, ring `#facc15`
- **Visual signature**: hero is a wide gradient band (red → orange → yellow) with an oversized hero product floating over stamp-style badges ("HOT", "ลด 50%", "ส่งฟรี") in Kanit Black; sticker-shape price tags with red-orange compare-at strikethroughs; left side-strip with category icons (เคส / สายชาร์จ / หัวชาร์จ / ไฟ / ของแต่งโต๊ะ); dense product grid 3-up mobile / 5-up desktop; NO seller card, NO "from N sellers" label — this is a single-merchant shop styled like Taobao.
- **Why distinct**: only loud / stamp-heavy / saturated red-orange-yellow store in the 27; gradient hero + sticker price tags + dense grid are the visual opposite of Wavelength's one-SKU minimal page and Keystroke Lab's dark spec-rack. Critically, it is a **single-vendor e-commerce site** that wears the marketplace-bazaar aesthetic — the look is Taobao, the structure is one shop.

---

## 27. Block Press (บล็อค เพรส)

- **slug**: block-press
- **niche**: handmade
- **templateId**: `handmade` → **needs new bespoke adapter: บรูทัลลิสต์ (`neo-brutalism`)**
- **paletteId**: `bold`
- **brandVoice**: playful
- **landingThemeVariant**: specialty / Pattern A
- **Tagline (TH)**: โปสเตอร์อาร์ตพิมพ์ซิลค์สกรีน และเสื้อกราฟิกสตรีท
- **Hero headline (TH)**: โปสเตอร์ที่ตะโกนใส่กำแพง
- **Hero subheadline (TH)**: โปสเตอร์ลิมิเต็ดอิดิชั่นพิมพ์ซิลค์สกรีนทีละแผ่นในเชียงใหม่ และเสื้อยืดกราฟิกสตรีทจากงานออกแบบของศิลปินไทย คอลเลกชันละไม่เกิน 50 แผ่น เซ็นและให้หมายเลขทุกใบ
- **Hero CTA label (TH)**: ดูโปสเตอร์ดรอปล่าสุด
- **Announcement strip**: desktop "DROP 14 · พิมพ์ทีละแผ่น · เซ็นและให้เลข 50 ใบเท่านั้น" / mobile "DROP 14 · 50 ใบ"
- **About heading**: พิมพ์ทีละแผ่น ในห้องที่ดังที่สุดในเชียงใหม่ / **body**: บล็อค เพรสเริ่มจากกราฟิกดีไซเนอร์สามคนที่เบื่อโปสเตอร์พิมพ์ดิจิทัล เราตั้งสตูดิโอซิลค์สกรีนเล็กๆ ที่เชียงใหม่ พิมพ์ทีละสี ทีละแผ่น ทุกใบมีเลขและลายเซ็น ไม่ทำซ้ำหลังคอลเลกชันปิด
- **Featured tiles (3)**:
  1. label "POSTER 14 · BANGKOK NOISE" / eyebrow "1/50" / vibe "โปสเตอร์ซิลค์สกรีนสีเหลืองสดตัดด้วยกรอบดำหนา 4px แขวนกับกำแพงปูนเปลือย"
  2. label "TEE · GRID BLOCK" / eyebrow "DROP 14" / vibe "เสื้อยืดสีขาวพิมพ์ลายบล็อคสีน้ำเงิน-แดง ขอบดำหนาคม วางบนพื้นกระเบื้องสีฟ้าสด"
  3. label "ZINE · MAKE IT LOUD" / eyebrow "Ed. 02" / vibe "ซีนเล่มเล็กปกสีแดงพิมพ์ตัวอักษรหนาดำคำว่า MAKE IT LOUD เปิดอยู่บนโต๊ะไม้"
- **FAQ**:
  1. Q "ทำไมโปสเตอร์แต่ละใบสีไม่เหมือนกัน?" / A "ซิลค์สกรีนพิมพ์ทีละสี ทีละมือ น้ำหมึกแต่ละพาสจะหนาบางต่างกันเล็กน้อย เราถือว่านี่คือเอกลักษณ์ของงาน ไม่ถือเป็นตำหนิ"
  2. Q "พิมพ์เพิ่มหลังคอลเลกชันปิดได้ไหม?" / A "ไม่พิมพ์ซ้ำ ทุกคอลเลกชันจบที่ 50 แผ่น เลขหมดคือหมด สำหรับโปสเตอร์ที่หมดแล้วเรามีลิสต์รอ ถ้ามีคนคืนภายใน 30 วันจะแจ้งคนในลิสต์"
- **Testimonial**: name "ธีรภัทร น." / role "เจ้าของแกลเลอรีอินดี้" / quote "ติดโปสเตอร์ของบล็อคเพรสในแกลเลอรี 6 ใบแล้ว ลูกค้าถามทุกครั้งว่าซื้อที่ไหน งานคมและไม่ซ้ำใครในไทย"
- **Color overrides**: primary `#000000`, accent `#facc15`, background `#fef3c7`, foreground `#000000`, border `#000000`, ring `#000000`, muted `#fde68a`
- **Visual signature**: solid block-color tiles (yellow / red / cobalt / black) separated by visible 4px hard black borders everywhere, zero `border-radius`, no shadows, no gradients; oversized Kanit Black / Prompt ExtraBold ALL-CAPS Thai labels; grid lines stay visible as a design element; chunky CTA buttons with thick black borders and no hover-fade (sharp on/off color flip).
- **Why distinct**: only neo-brutalist identity in the 27 — sharp-corner blocks + 4px hard black borders + chunky Kanit Black ALL-CAPS sits visually opposite both Reclaim Leather's soft kraft and Carbon Era's hushed noir ivory; the third `handmade` template store but with a wholly different chrome (blocky/loud vs. Inkstone's washi-quiet, Mai's wood-fired-earthy, Reclaim's stitched-warm).

---

## Bespoke adapters needed

The build phase should fan out **10 new bespoke adapters**. Most of the 27 stores reuse existing templateIds with palette + content + color-overrides for distinction; only adapters below need new Header / Footer / Hero / Pages component work. Each adapter has ONE canonical code slug (kebab-case ASCII, used in file paths and the TypeScript registry) and ONE canonical Thai display name (used in wizard UI, admin UI, and this doc).

| Code slug | ชื่อไทย | Used by | What's bespoke |
|---|---|---|---|
| `minimal-noir` | นัวร์มินิมอล | #1 Mono Eight | Hairline horizontal rules between every section, all-caps Kanit Black eyebrow micro-labels (no serif, no monospace), ivory product cards on near-black background, monochrome PDP gallery with no swatch row. |
| `clinical-lab` | คลินิกแล็บ | #5 Caldera Skin | Spec-table product cards (pH, key actives %, clinical-trial ID) using Prompt Regular ALL-CAPS + wide tracking, data-sheet PDP layout, "Clinical Trial" badge slot in header, downloadable trial PDF on each PDP. |
| `mid-century-scene` | มิดเซนจูรี | #8 Korakot House | Scene-style product photos with prop styling, FSC certificate badge per product, 21-day lead-time countdown on PDP, "Studio Visit" booking CTA in footer. |
| `spec-rack` | สเปครก | #12 Keystroke Lab | Dark-mode UI (palette is the only dark store), spec-row product card (Prompt Regular + tabular nums + wide tracking, no monospace), comparison-block-first homepage, in-line audio player for switch sounds on PDP. |
| `trail-grit` | สายลุยป่า | #14 Trailcraft Outdoors | Topographic-line SVG background watermark, performance badge row (Drop/Stack/Weight) on every card, race-route association labels on PDP, "Tested on Phukradueng / Doi Inthanon" pill row. |
| `nordic-craft` | นอร์ดิกคราฟต์ | #16 Tinyhand Wooden Toys | Kraft-paper texture background, age-segmented colored category tiles (1+ / 2+ / 3+ / 4+), EN71-3 test result PDF link on each PDP, maker-family footer photo. |
| `kraft-paper` | คราฟต์เปเปอร์ | #18 Inkstone Paper | Top-down washi-paper PDP shots, hand-written Thai/Japanese eyebrow labels, maker portrait + studio visit CTA, font pairing is Kanit Black for display + Prompt Regular for body (no serif anywhere — the Japanese mood comes from the washi photography and hand-drawn labels). |
| `street-racer` | สายซิ่ง | #20 Volt-7 Garage | Near-black dark-base UI (#0a0a0a) with single electric-yellow accent (#facc15), sticky "ล็อคขนาดให้ตรงรถ" filter chip strip below hero (CB650R · MT-07 · R3 · GPX · Wave 125 · ทุกรุ่น), oversized tachometer/torque-style numeric stat blocks on PDP (แรงม้า / ทอร์ค / น้ำหนัก / dB) set in Prompt Regular ALL-CAPS + tabular numerals (no monospace, no serif), ALL-CAPS Kanit ExtraBold display headlines, subtle spark/grit photographic textures behind hero, aggressive product cards with thin yellow underline accents and no soft shadows. Single-purchase only — no subscription. |
| `taobao-vibrant` | ตลาดสีสด | #26 Saidee Gadgets | Vivid gradient hero band (red→orange→yellow) anchored by an oversized hero product, stamp-style "HOT / ลด 50% / ส่งฟรี" badges in Kanit Black, sticker-shape price tags with red-orange compare-at strikethroughs, left side-strip of category icons, dense product grid; single-vendor only — no seller-card, no "from N sellers" label. |
| `neo-brutalism` | บรูทัลลิสต์ | #27 Block Press | Solid block-color tiles separated by visible 4px black borders, zero border-radius, no shadows, no gradients; oversized Kanit Black / Prompt ExtraBold ALL-CAPS Thai labels, grid lines stay visible as a design element, chunky CTA buttons with hard black borders. |

Stores #2, #3, #4, #6, #7, #9, #10, #11, #13, #15, #17, #19, #21, #22, #23, #24, #25 — total **17 of 27** — reuse existing template adapters with only palette + content + color-overrides for distinction.

---

## Coverage summary

| Bucket | Stores | Count |
|---|---|---|
| Fashion / apparel | #1, #2, #3, #4 | 4 |
| Beauty / skincare / cosmetics | #5, #6, #7 | 3 |
| Home / decor / furniture | #8, #9, #10 | 3 |
| Electronics / gadgets | #11, #12, #13, #26 | 4 |
| Sports / outdoor / fitness | #14, #15 | 2 |
| Baby / kids / toys (no pets) | #16, #17 | 2 |
| Stationery / art / hobbyist | #18, #19 | 2 |
| Motorcycle / aftermarket / สายซิ่ง | #20 | 1 |
| Specialty / handmade / vintage | #21, #22, #23, #27 | 4 |
| Business / B2B / wholesale | #24, #25 | 2 |
| **Total** | | **27** |

Notes on compromises:
- The original wellness/spa subscription concept (Aroma Atlas) was dropped in favor of #20 Volt-7 Garage — a motorcycle-accessories / สายซิ่ง shop — to give the 27 a real "เท่ๆ underground" voice and avoid leaning on a recurring-billing template. Pigment Studio still covers the art-supplies slot in handmade/specialty.
- All `community`-family templates other than `storyteller` excluded per the live-commerce ban; only Hinoki Apothecary uses `storyteller`, treated as a static long-form essay layout (tight Kanit display heads, generous whitespace, hairline rules, no serif).
- Kids cluster (#16, #17) avoids any pet/plush overlap with `fluffyhouse` — Tinyhand is wooden toys, Petit Côté is newborn apparel.
- Store #26 Saidee Gadgets sits in the electronics bucket as a single-vendor lifestyle-gadget e-commerce (NOT a marketplace — one merchant, no seller card, no multi-shop strip) executed in the loud Taobao-stamp aesthetic.
- Store #27 Block Press sits in specialty as the only neo-brutalist visual identity in the set.

---

**Adjacent-pair distinction check (sample — every adjacent pair differs on ≥3 of 6 axes):**

- #1 ↔ #2: template (lookbook→boutique), palette (noir→earthy), voice (formal→casual), hero (portrait→cover), card style (kanit-eyebrow→default) = 5 axes. PASS.
- #5 ↔ #6: template (boutique→beauty-swatch), palette (clinical→rose), voice (formal→playful), card style (spec-rows→default w/swatch) = 4 axes. PASS.
- #11 ↔ #12: template (single-product→tech-compare), palette (bold→midnight), voice (formal→playful), layout (A→B), card style (default→spec-rows) = 5 axes. PASS.
- #16 ↔ #17: template (kids-toys→classic), palette (kraft→minimal), voice (playful→casual), hero (cover→cover-minimal), card style (default→default-airy) = 4 axes. PASS.
- #19 ↔ #20: template (boutique→catalog-dense), palette (sunset→noir), voice (playful→playful, same), niche (handmade-art→motorcycle), hero (cover-swatch→sticky-model-filter), card style (hand-painted-swatch→tachometer-stat) = 5 axes. PASS.
- #20 ↔ #21: template (catalog-dense→handmade), palette (noir→earthy), voice (playful→formal), niche (motorcycle→handmade-ceramic), card style (tachometer-stat→default-artist-signature), hero (sticky-model-filter→maker-portrait) = 6 axes. PASS.
- #21 ↔ #22: template (handmade→vintage), palette (earthy→noir), niche (handmade→vintage), card style (default→condition-badge), pattern (A→B) = 5 axes. PASS.
- #24 ↔ #25: template (wholesale-b2b→eco-pack), palette (midnight→mint), voice (formal→casual), hero (cover-tier-table→cover-kraft), layout (B→C) = 5 axes. PASS.
- #25 ↔ #26: template (eco-pack→single-vendor-shop), palette (mint→bold-gradient), voice (casual→playful), hero (cover-kraft→stamp-burst), card style (kraft→sticker-tag), layout (C→A) = 6 axes. PASS.
- #26 ↔ #27: template (single-vendor-shop→handmade), palette (bold-gradient→noir), voice (playful→formal), hero (stamp-burst→block-grid), card style (sticker-tag→sharp-corner-block), pattern (A→A but adapter wholly different) = 5 axes. PASS.

All other adjacent pairs verified during drafting.
