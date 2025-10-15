import { useRef, useCallback } from "react";

export const useCustomSound = () => {
  const customAudioRef = useRef<HTMLAudioElement | null>(
    typeof window !== "undefined" ? new Audio() : null,
  );

  const playCustomSound = useCallback((sound: string) => {
    const audio = customAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = sound;
      audio.play();
    }
  }, []);

  return playCustomSound;
};
