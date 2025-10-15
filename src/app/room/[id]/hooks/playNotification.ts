import { useCallback } from "react";
import { useTabVisibility } from "./tabVisibility";

export const useNotification = () => {
  const isTabActive = useTabVisibility();

  const playNotification = useCallback(() => {
    const soundPath = isTabActive
      ? "/sounds/not.mp3"
      : "/sounds/not-inactive.mp3";
    const audio = new Audio(soundPath);
    audio.play();
  }, [isTabActive]);

  return playNotification;
};
