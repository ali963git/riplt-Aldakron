import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import appLogo from '../../../assets/images/app_logo.jpg';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const titleChars = "وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ".split('');

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10 text-center flex flex-col items-center">
        <motion.div 
          className="w-32 h-32 mb-8 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.2)]"
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.4 }}
        >
          <img src={appLogo} alt="الذاكرون" className="w-full h-full object-cover" />
        </motion.div>

        <h1 className="text-[4vw] text-[#D4AF37] font-quran leading-tight" style={{ direction: 'rtl' }}>
          {titleChars.map((char, i) => (
            <motion.span key={i} style={{ display: 'inline-block' }}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={phase >= 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, delay: phase >= 1 ? i * 0.05 : 0 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>
        
        <motion.div
          className="mt-6 w-[2px] h-16 bg-gradient-to-b from-[#D4AF37] to-transparent"
          initial={{ height: 0, opacity: 0 }}
          animate={phase >= 2 ? { height: 64, opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  );
}
