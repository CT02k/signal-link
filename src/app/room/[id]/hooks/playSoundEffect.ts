import { useCallback } from "react";
import { SoundEffect } from "../types/effect";

export const useSoundEffect = () => {
  const playSoundEffect = useCallback((sound: SoundEffect) => {
    const audio = new Audio(`/sounds/effects/${sound}.mp3`);
    audio.play();
  }, []);

  return playSoundEffect;
};
