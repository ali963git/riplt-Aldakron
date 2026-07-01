import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function Counter({ from, to }: { from: number; to: number }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = from;
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / (to - from)));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= to) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [from, to]);

  return <>{count}</>;
}

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3500),
      setTimeout(() => setPhase(5), 6000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#D4AF37]/40 blur-[1px]"
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${110 + (i * 7) % 20}%`,
              scale: 0.5 + (i % 4) * 0.5,
            }}
            animate={{
              y: [`0px`, `-${120 + (i % 3) * 30}vh`],
              x: [`0px`, `${(i % 2 === 0 ? 1 : -1) * (i % 5 + 1) * 2}vw`],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              ease: "linear",
              delay: (i % 4) * 0.8,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center flex flex-col items-center max-w-4xl">
        <motion.div
          className="relative w-48 h-48 mb-12 flex items-center justify-center"
          initial={{ scale: 0, rotate: -90 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#0A2818" strokeWidth="4" />
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="4"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={phase >= 3 ? { strokeDashoffset: 0 } : { strokeDashoffset: 283 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </svg>

          <motion.div className="text-[4vw] text-[#FAF6EE]" style={{ fontFamily: 'var(--font-arabic-body)' }}>
            {phase >= 3 ? <Counter from={0} to={100} /> : "0"}
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-[5vw] text-[#D4AF37] mb-6"
          style={{ fontFamily: 'var(--font-arabic-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          أذكار الصباح والمساء
        </motion.h2>

        <motion.p
          className="text-[2vw] text-[#FAF6EE]/70"
          style={{ fontFamily: 'var(--font-arabic-body)' }}
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          حصن يومك وتتبع تقدمك مع المسبحة الإلكترونية
        </motion.p>
      </div>
    </motion.div>
  );
}
