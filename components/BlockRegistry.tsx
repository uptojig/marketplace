import { HeroBannerBlock } from "@/components/blocks/hero-banner";
import { ProductHeroBlock } from "@/components/blocks/product-hero";
import { FeaturesBlock } from "@/components/blocks/features";
import { OfferGridBlock } from "@/components/blocks/offer-grid";
import { TestimonialBlock } from "@/components/blocks/testimonial";
import { FaqBlock } from "@/components/blocks/faq";
import { CtaBlock } from "@/components/blocks/cta";
import { StatsBlock } from "@/components/blocks/stats";
import { FooterBlock } from "@/components/blocks/footer";
import type { BlockType } from "@/lib/landing-schema";

export const COMPONENT_REGISTRY: Record<BlockType, React.ComponentType<any>> = {
  HeroBanner: HeroBannerBlock,
  ProductHero: ProductHeroBlock,
  Features: FeaturesBlock,
  OfferGrid: OfferGridBlock,
  Testimonial: TestimonialBlock,
  FAQ: FaqBlock,
  CTA: CtaBlock,
  Stats: StatsBlock,
};
