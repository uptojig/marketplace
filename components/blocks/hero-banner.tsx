"use client";

/**
 * HeroBanner — top-of-page brand impression.
 *
 * Rebuilt on daisyUI 5's `hero` component:
 *   - .hero               full-bleed centering container
 *   - .hero-overlay       semi-opaque scrim over the bg image
 *   - .hero-content       caps copy width + handles split layouts
 *   - .btn .btn-primary   primary CTA — picks up theme color
 *   - .btn .btn-outline   secondary CTA
 *
 * The framer-motion entrance animations are preserved — they
 * play once on first reveal regardless of theme.
 *
 * Family-specific overrides survive via className hooks:
 *   - .theme-cyber injects the purple grid pattern + neon glow
 *   - .theme-A serif-promotes the h1 + drops min-h to 60vh
 * (both via globals.css selectors, no per-component branching)
 */

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

interface HeroBannerProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  themeColor?: string;
  imageUrl?: string;
  svgCode?: string;
  layoutStyle?: "text-left" | "text-center" | "split-image";
}

export function HeroBannerBlock({
  headline,
  subheadline,
  ctaText,
  imageUrl,
  svgCode,
  layoutStyle = "text-center",
}: HeroBannerProps) {
  const isSplit = layoutStyle === "split-image";
  const isLeft = layoutStyle === "text-left";

  // Background image only when not split-image — split lays the
  // image to the side in hero-content rather than as a backdrop.
  const showBgImage = !isSplit && imageUrl;

  return (
    <div
      className="hero relative min-h-[80vh] overflow-hidden bg-base-200"
      style={
        showBgImage
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {showBgImage && <div className="hero-overlay bg-base-300/40" />}

      {/* Soft brand-color halos — kept as decoration; daisyUI
          theme tokens carry primary through. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[50vh] w-[50vw] rounded-full blur-[120px] opacity-30 bg-primary" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[30vh] w-[30vw] rounded-full blur-[100px] opacity-20 bg-secondary" />
      </div>

      <div
        className={`hero-content relative z-10 max-w-6xl px-4 py-20 ${
          isSplit
            ? "flex-col md:flex-row gap-12"
            : isLeft
              ? "flex-col items-start text-left"
              : "text-center flex-col"
        }`}
      >
        <div
          className={`space-y-8 ${
            isSplit || isLeft ? "text-left" : "text-center mx-auto max-w-4xl"
          }`}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-5xl font-extrabold tracking-tight sm:text-7xl ${
              !isSplit && !isLeft ? "mx-auto" : ""
            }`}
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className={`text-lg sm:text-xl max-w-2xl text-base-content/80 ${
              isSplit || isLeft ? "" : "mx-auto"
            }`}
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, type: "spring", bounce: 0.4 }}
            className={`flex ${
              isSplit || isLeft ? "justify-start" : "justify-center"
            }`}
          >
            <button className="btn btn-primary btn-lg rounded-full">
              <ShoppingCart className="h-5 w-5" />
              {ctaText}
            </button>
          </motion.div>
        </div>

        {isSplit && (imageUrl || svgCode) && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            {svgCode ? (
              <div
                className="w-full h-auto text-primary"
                dangerouslySetInnerHTML={{ __html: svgCode }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={headline}
                className="w-full max-w-lg rounded-2xl shadow-2xl object-cover aspect-square"
              />
            )}
          </motion.div>
        )}
      </div>

      {/* Subtle grid backdrop — purple on cyber, hidden on .theme-A. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
    </div>
  );
}
