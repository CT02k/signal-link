import { useState, useEffect } from "react";
import { CustomAudio } from "../types/custom";

export const useCustomAudios = () => {
  const [customSounds, setCustomSounds] = useState<CustomAudio[]>([]);
  const [loadingCustomSounds, setLoadingCustomSounds] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("custom_audios");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomSounds(parsed);
      }
    } catch (error) {
      console.error("Erro ao carregar custom_audios do localStorage:", error);
    }
    setLoadingCustomSounds(false);
  }, []);

  useEffect(() => {
    if (!loadingCustomSounds) {
      try {
        localStorage.setItem("custom_audios", JSON.stringify(customSounds));
      } catch (error) {
        console.error("Erro ao salvar custom_audios no localStorage:", error);
      }
    }
  }, [customSounds, loadingCustomSounds]);

  return { customSounds, setCustomSounds, loadingCustomSounds };
};
