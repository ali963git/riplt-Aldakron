import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS = {
  open: 4000,
  quran: 6000,
  azkar: 7000,
  ai: 7000,
  close: 6000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1,
  quran: Scene2,
  azkar: Scene3,
  ai: Scene4,
  close: Scene5,
};

const patternPos = [
  { scale: 1, opacity: 0.3, rotate: 0 },
  { scale: 1.2, opacity: 0.1, rotate: 15 },
  { scale: 1.5, opacity: 0.2, rotate: 30 },
  { scale: 1.1, opacity: 0.4, rotate: -15 },
  { scale: 1.3, opacity: 0.3, rotate: 45 },
];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#02130F]" style={{ direction: 'rtl' }}>
      {/* Persistent background layer */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0A2818, transparent)' }}
          animate={{ x: ['-20%', '20%', '-10%'], y: ['-10%', '30%', '10%'], scale: [1, 1.2, 0.9] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] rounded-full opacity-20 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }}
          animate={{ x: ['10%', '-30%', '5%'], y: ['10%', '-40%', '-20%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Persistent Islamic pattern overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/islamic-pattern.png)`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
        }}
        animate={patternPos[sceneIndex] ?? patternPos[0]}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Persistent gold accent line */}
      <motion.div
        className="absolute h-[2px] bg-[#D4AF37]"
        animate={{
          left: ['20%', '0%', '40%', '10%', '30%'][sceneIndex] ?? '20%',
          width: ['60%', '100%', '20%', '80%', '40%'][sceneIndex] ?? '60%',
          top: ['80%', '15%', '85%', '25%', '70%'][sceneIndex] ?? '80%',
          opacity: sceneIndex === 4 ? 0 : 0.6,
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      <audio
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
