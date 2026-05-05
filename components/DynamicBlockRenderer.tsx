import dynamic from "next/dynamic";

// 🌟 1. ใช้ Dynamic Import เพื่อแยก Code Splitting 
// (ถ้าหน้านั้นไม่มี HeroBanner มันก็จะไม่โหลดไฟล์ hero-banner มาให้หนักเว็บ)
const HeroBanner = dynamic(() => import("@/components/blocks/hero-banner").then(mod => mod.HeroBannerBlock), {
  loading: () => <div className="h-[50vh] w-full animate-pulse bg-stone-100" /> // Skeleton โหลด
});
const ProductHero = dynamic(() => import("@/components/blocks/product-hero").then(mod => mod.ProductHeroBlock));
const OfferGrid = dynamic(() => import("@/components/blocks/offer-grid").then(mod => mod.OfferGridBlock));
const Features = dynamic(() => import("@/components/blocks/features").then(mod => mod.FeaturesBlock));
const Testimonial = dynamic(() => import("@/components/blocks/testimonial").then(mod => mod.TestimonialBlock));
const CTA = dynamic(() => import("@/components/blocks/cta").then(mod => mod.CtaBlock));
const FAQ = dynamic(() => import("@/components/blocks/faq").then(mod => mod.FaqBlock));
const Stats = dynamic(() => import("@/components/blocks/stats").then(mod => mod.StatsBlock));
const Footer = dynamic(() => import("@/components/blocks/footer").then(mod => mod.FooterBlock));

interface BlockRendererProps {
  block: {
    type: string;
    props: any;
  };
  themeColor?: string; // เผื่อส่งต่อสีหลักให้ Block ที่ต้องการใช้ (เช่น Spotlight)
  storeSlug?: string; // สำหรับสร้าง URL สินค้า
}

export function DynamicBlockRenderer({ block, themeColor, storeSlug }: BlockRendererProps) {
  const { type, props } = block;

  // 🌟 2. สับราง (Switch) ตามชื่อ Block ที่ AI ส่งมา
  switch (type) {
    case "HeroBanner":
      return <HeroBanner {...props} themeColor={themeColor} />;
    
    case "ProductHero":
      return <ProductHero {...props} themeColor={themeColor} />;
    
    case "OfferGrid":
      return <OfferGrid {...props} storeSlug={storeSlug} themeColor={themeColor} />;
    
    case "Features":
      return <Features {...props} />;
    
    case "Testimonial":
      return <Testimonial {...props} />;
    
    case "CTA":
      return <CTA {...props} themeColor={themeColor} />;
    
    case "FAQ":
      return <FAQ {...props} />;

    case "Stats":
      return <Stats {...props} />;

    case "Footer":
      return <Footer {...props} />;

    default:
      // 🚨 สำคัญมาก: กันเหนียวเผื่อ AI หลอนส่งชื่อ Block แปลกๆ มา เว็บจะได้ไม่พัง
      console.warn(`[DynamicBlockRenderer] ไม่พบคอมโพเนนต์สำหรับประเภท: "${type}"`);
      return null; 
  }
}
