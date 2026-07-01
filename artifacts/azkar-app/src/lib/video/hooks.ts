import { useState, useEffect } from 'react';

interface UseVideoPlayerProps {
  durations: Record<string, number>;
}

export function useVideoPlayer({ durations }: UseVideoPlayerProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const durationValues = Object.values(durations);

  useEffect(() => {
    // @ts-ignore
    window.startRecording?.();

    let timeout: NodeJS.Timeout;
    let isFirstPass = true;

    const advanceScene = (sceneIndex: number) => {
      setCurrentScene(sceneIndex);

      if (sceneIndex === 0 && !isFirstPass) {
        // @ts-ignore
        window.stopRecording?.();
      }

      if (sceneIndex === durationValues.length - 1) {
        isFirstPass = false;
      }

      timeout = setTimeout(() => {
        advanceScene((sceneIndex + 1) % durationValues.length);
      }, durationValues[sceneIndex]);
    };

    advanceScene(0);

    return () => clearTimeout(timeout);
  }, []); // Run once on mount

  return { currentScene };
}
