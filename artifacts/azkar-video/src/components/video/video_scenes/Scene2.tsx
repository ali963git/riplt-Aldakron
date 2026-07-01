import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center"
      initial={{ clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' }}
      animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="w-1/2 h-full flex flex-col justify-center px-24 z-10">
        <motion.div
          className="w-16 h-1 bg-[#D4AF37] mb-8"
          initial={{ width: 0 }}
          animate={phase >= 1 ? { width: 64 } : { width: 0 }}
          transition={{ duration: 0.6 }}
        />

        <motion.h2
          className="text-[4.5vw] text-[#FAF6EE] leading-tight mb-6"
          style={{ fontFamily: 'var(--font-arabic-body)' }}
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8 }}
        >
          القرآن الكريم<br />
          <span className="text-[#D4AF37]">بين يديك</span>
        </motion.h2>

        <div className="space-y-6">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-12 rounded-full border border-[#D4AF37] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#D4AF37] stroke-2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <p className="text-[1.8vw] text-[#FAF6EE]/80" style={{ fontFamily: 'var(--font-arabic-body)' }}>604 صفحة مصورة عالية الدقة</p>
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-12 rounded-full border border-[#D4AF37] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#D4AF37] stroke-2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <p className="text-[1.8vw] text-[#FAF6EE]/80" style={{ fontFamily: 'var(--font-arabic-body)' }}>استمع مع 16 قارئاً مميزاً</p>
          </motion.div>
        </div>
      </div>

      <div className="w-1/2 h-full absolute left-0 top-0 overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#02130F] z-10" />
        <motion.img
          src={`${import.meta.env.BASE_URL}images/mosque-bg.png`}
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
          initial={{ scale: 1.2, x: -50 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ duration: 6, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
