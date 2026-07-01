import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 2900),
      setTimeout(() => setPhase(5), 6000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const features = [
    { title: "مساعد الذكاء الاصطناعي", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-1 4h2v6h-2z", delay: 2 },
    { title: "حاسبة الزكاة الذكية", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", delay: 3 },
    { title: "اتجاه القبلة بدقة", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v4m0 0l2-2m-2 2l-2-2", delay: 4 },
  ];

  return (
    <motion.div className="absolute inset-0"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <motion.path
          d="M 100 500 Q 300 200 500 500 T 900 500"
          fill="none" stroke="#D4AF37" strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={phase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M 100 200 Q 500 500 900 800"
          fill="none" stroke="#D4AF37" strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={phase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-24">
        <motion.h2
          className="text-[4vw] text-[#FAF6EE] mb-16"
          style={{ fontFamily: 'var(--font-arabic-body)' }}
          initial={{ opacity: 0, y: -30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8 }}
        >
          أدوات إسلامية متكاملة
        </motion.h2>

        <div className="grid grid-cols-3 gap-12 w-full max-w-6xl">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              className="bg-[#0A2818]/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-8 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={phase >= feat.delay ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 45 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <svg viewBox="0 0 24 24" className="w-16 h-16 mb-6 fill-none stroke-[#D4AF37] stroke-[1.5]">
                <path d={feat.icon} />
              </svg>
              <h3 className="text-[2vw] text-[#D4AF37]" style={{ fontFamily: 'var(--font-arabic-body)' }}>{feat.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
