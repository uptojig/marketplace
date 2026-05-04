/**
 * Standalone agent config — compact system prompt + tool schema.
 */

export const AGENT_MODEL = "claude-haiku-4-5-20251001";

export const SYSTEM_PROMPT = `You are a Thai e-commerce shop builder. Emit a v12 multi-page JSON schema via generate_page_schema.

## Design Families (auto-select from brief, NEVER ask)
A=Nordic(฿2k+,stone+amber) B=K-Fashion(rose+serif) C=Luxe(฿5k+,black+gold) D=Industrial(black+zinc) E=Cyberpunk(purple+green) F=Sport(blue+red) G=Botanical(green+emerald) H=Cozy(cream+brown) I=GenZ(฿49-499,pink+amber)

## Schema v12
{schemaVersion:"12", metadata:{title,description,language:"th",themeColor}, designFamily:"A"-"I", globalHeader:{logo,nav,showCart,sticky}, globalFooter:{brand,columns,contact,copyright}, pages:[{slug,isHomepage?,blocks:[{blockType,content}]}], reasoning}

## Block types
Visual: HeroBanner, CategoryBanner | Product: ProductHero, OfferGrid, Gallery, Bundle | Trust: Stats, Features, Testimonial, Reviews, FAQ | CTA, Countdown

## Pages (5 required, 3-4 blocks each, BE CONCISE)
- home: HeroBanner + OfferGrid(4-6 products) + Stats + CTA
- products: HeroBanner + OfferGrid(all products)
- about: HeroBanner + Features(3 items) + Testimonial
- contact: Features(phone,email,LINE,hours) + CTA
- faq: FAQ(6-8 questions about ordering/shipping/returns)

## Rules
- Products come from the brief. Use ONLY those. Rewrite titles to Thai.
- If 0 products: reply "ไม่มีสินค้าในระบบ กรุณาเพิ่มสินค้าก่อนสร้างร้าน" and do NOT call tool.
- Every image needs altText in Thai (50-125 chars).
- Ratings 4.6-4.8 only. No Nav/Footer blocks (platform handles those).
- Keep output COMPACT. No unnecessary nesting.`;

export const GENERATE_PAGE_SCHEMA_TOOL = {
  name: "generate_page_schema",
  description: "Emit the final multi-page shop schema. Call ONCE.",
  input_schema: {
    type: "object" as const,
    properties: {
      schemaVersion: { type: "string", enum: ["12"] },
      metadata: { type: "object", description: "title, description, language, themeColor" },
      designFamily: { type: "string", enum: ["A","B","C","D","E","F","G","H","I"] },
      globalHeader: { type: "object", description: "logo, nav[], showCart, sticky" },
      globalFooter: { type: "object", description: "brand, columns[], contact, copyright" },
      pages: {
        type: "array",
        minItems: 4,
        maxItems: 7,
        items: {
          type: "object",
          properties: {
            slug: { type: "string" },
            isHomepage: { type: "boolean" },
            blocks: {
              type: "array",
              minItems: 1,
              maxItems: 6,
              items: {
                type: "object",
                properties: {
                  blockType: { type: "string", enum: ["HeroBanner","CategoryBanner","ProductHero","OfferGrid","Gallery","Bundle","Stats","Features","Testimonial","Reviews","FAQ","CTA","Countdown"] },
                  content: { type: "object", additionalProperties: true },
                },
                required: ["blockType", "content"],
              },
            },
          },
          required: ["slug", "blocks"],
        },
      },
      reasoning: { type: "string" },
    },
    required: ["schemaVersion","metadata","designFamily","globalHeader","globalFooter","pages"],
  },
};
