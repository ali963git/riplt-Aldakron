import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import appLogo from '../../../assets/images/app_logo.jpg';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-[#02130F]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* Geometric Halo Pulse */}
        <motion.div 
          className="absolute w-[40vw] h-[40vw] rounded-full border border-[#D4AF37]/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1.5, opacity: 0 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />
        
        <motion.div 
          className="w-40 h-40 mb-10 rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-[0_0_80px_rgba(212,175,55,0.3)] relative z-20"
          initial={{ scale: 0, rotate: 90 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 90 }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.5 }}
        >
          <img src={appLogo} alt="الذاكرون" className="w-full h-full object-cover" />
        </motion.div>

        <motion.h1 
          className="text-[6vw] font-display text-[#FAF6EE] mb-6 relative z-20"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          الذاكرون
        </motion.h1>

        <motion.p 
          className="text-[3vw] font-quran text-[#D4AF37] relative z-20"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1.2 }}
        >
          ذاكرون على كل حال
        </motion.p>
      </div>
    </motion.div>
  );
}
