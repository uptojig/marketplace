"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react"; // ไอคอนจาก lucide-react (มาพร้อม shadcn)

interface HeroBannerProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  themeColor?: string;
  imageUrl?: string;
  svgCode?: string;
  layoutStyle?: "text-left" | "text-center" | "split-image";
}

export function HeroBannerBlock({ headline, subheadline, ctaText, themeColor = "#3b82f6", imageUrl, svgCode, layoutStyle = "text-center" }: HeroBannerProps) {
  const isSplit = layoutStyle === "split-image";
  const isLeft = layoutStyle === "text-left";
  
  return (
    <div className={`relative flex min-h-[80vh] w-full overflow-hidden px-4 py-20 ${isSplit ? "items-center" : "flex-col items-center justify-center text-center"}`} style={{ color: 'var(--shop-ink)' }}>
      
      <div className="absolute top-0 flex w-full justify-center">
        <div 
          className="absolute top-[-20%] h-[50vh] w-[50vw] rounded-full blur-[120px] opacity-30" 
          style={{ backgroundColor: themeColor }}
        />
        <div 
          className="absolute top-[-10%] h-[30vh] w-[30vw] rounded-full blur-[100px] opacity-20" 
          style={{ backgroundColor: themeColor }}
        />
      </div>

      <div className={`relative z-10 mx-auto w-full max-w-6xl ${isSplit ? "grid md:grid-cols-2 gap-12 items-center" : ""}`}>
        <div className={`space-y-8 ${isSplit || isLeft ? "text-left" : "text-center mx-auto max-w-4xl"}`}>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`text-5xl font-extrabold tracking-tight sm:text-7xl ${!isSplit && !isLeft && "mx-auto"}`}
            >
            {headline}
          </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className={`text-lg sm:text-xl max-w-2xl ${isSplit || isLeft ? "" : "mx-auto"}`}
              style={{ color: 'var(--shop-ink-muted)' }}
            >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, type: "spring", bounce: 0.4 }}
            whileTap={{ scale: 0.95 }}
            className={`flex ${isSplit || isLeft ? "justify-start" : "justify-center"}`}
          >
            <Button 
              size="lg" 
              className="h-14 rounded-full px-8 text-lg font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--shop-primary)', color: '#fff' }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {ctaText}
            </Button>
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
                className="w-full h-auto" 
                style={{ color: 'var(--shop-primary)' }}
                dangerouslySetInnerHTML={{ __html: svgCode }} 
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={headline} className="w-full max-w-lg rounded-2xl shadow-2xl object-cover aspect-square" />
            )}
          </motion.div>
        )}
      </div>

      {/* Grid พื้นหลังแบบบางๆ (เพิ่มความ Tech/Premium) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
    </div>
  );
}
