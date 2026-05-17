'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnnouncementStripProps {
  messages: string[]; // List of announcement messages e.g., promotions
  rotateMs: number; // Time in milliseconds before rotating to next message
}

export function AnnouncementStrip({ messages, rotateMs }: AnnouncementStripProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, rotateMs);
    return () => clearInterval(interval);
  }, [messages, rotateMs]);

  if (!messages || messages.length === 0) return null;

  return (
    <div className="bg-[var(--meg-highlight)] bg-gradient-to-r from-[var(--shop-primary)] to-[var(--shop-accent)] text-white text-xs sm:text-sm font-medium py-1.5 px-4 overflow-hidden relative flex justify-center items-center h-8 sm:h-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute text-center w-full truncate px-4"
        >
          {messages[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
