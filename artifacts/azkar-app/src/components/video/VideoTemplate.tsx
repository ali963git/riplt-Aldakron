import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { open: 4000, quran: 6000, azkar: 7000, ai: 7000, close: 6000 };

const patternPos = [
  { scale: 1, opacity: 0.3, rotate: 0 },
  { scale: 1.2, opacity: 0.1, rotate: 15 },
  { scale: 1.5, opacity: 0.2, rotate: 30 },
  { scale: 1.1, opacity: 0.4, rotate: -15 },
  { scale: 1.3, opacity: 0.3, rotate: 45 },
];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#02130F]" style={{ direction: 'rtl' }}>
      {/* Background layer - Persistent */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[80vw] h-[80vw] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0A2818, transparent)' }}
          animate={{ x: ['-20%', '20%', '-10%'], y: ['-10%', '30%', '10%'], scale: [1, 1.2, 0.9] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[60vw] h-[60vw] rounded-full opacity-20 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }}
          animate={{ x: ['10%', '-30%', '5%'], y: ['10%', '-40%', '-20%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* Midground pattern - Transforms with scene */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{ 
          backgroundImage: `url(${import.meta.env.BASE_URL}images/islamic-pattern.png)`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat'
        }}
        animate={patternPos[currentScene]}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />
      
      {/* Persistent Gold Accent Line */}
      <motion.div
        className="absolute h-[2px] bg-[#D4AF37]"
        animate={{
          left: ['20%', '0%', '40%', '10%', '30%'][currentScene],
          width: ['60%', '100%', '20%', '80%', '40%'][currentScene],
          top: ['80%', '15%', '85%', '25%', '70%'][currentScene],
          opacity: currentScene === 4 ? 0 : 0.6,
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="quran" />}
        {currentScene === 2 && <Scene3 key="azkar" />}
        {currentScene === 3 && <Scene4 key="ai" />}
        {currentScene === 4 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}
