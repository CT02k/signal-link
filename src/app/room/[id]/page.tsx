"use client";

import { ArrowLeft, Check, Copy, Trash } from "lucide-react";

import { CustomEffectButton, EffectButton } from "./components/effectButton";
import { CustomSoundPopup } from "./components/popup";

import { CustomAudio } from "./types/custom";
import { Effect, SoundEffect } from "./types/effect";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { useCopyToClipboard } from "./hooks/copyToClipboard";
import { useCustomAudios } from "./hooks/customAudios";
// import { useNotification } from "./hooks/playNotification";
import { useCustomSound } from "./hooks/playCustomSound";
import { useSoundEffect } from "./hooks/playSoundEffect";
import { useRoomSocket } from "./hooks/useRoomSocket";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const router = useRouter();

  const [currentEffect, setCurrentEffect] = useState<Effect>(Effect.NONE);
  const [currentSoundEffect, setCurrentSoundEffect] = useState<SoundEffect>(
    SoundEffect.NONE,
  );
  const [currentCustomSound, setCurrentCustomSound] = useState<
    Base64URLString | undefined
  >(undefined);

  // const playNotification = useNotification();
  const playCustomSound = useCustomSound();
  const playSoundEffect = useSoundEffect();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [copiedRoomId, copyRoomId] = useCopyToClipboard(roomId);

  const socketOptions = useMemo(
    () => ({
      onEffect: (effect: Effect) => {
        setCurrentEffect(effect);
        setTimeout(() => setCurrentEffect(Effect.NONE), 1000);
      },
      onSoundEffect: (sound: SoundEffect) => {
        setCurrentSoundEffect(sound);
        setTimeout(() => setCurrentSoundEffect(SoundEffect.NONE), 1000);
      },
      onCustomSound: (audio: Base64URLString) => {
        playCustomSound(audio);
        setCurrentCustomSound(audio);
        setTimeout(() => setCurrentCustomSound(undefined), 2000);
      },
    }),
    [playCustomSound],
  );

  const { customSounds, setCustomSounds, loadingCustomSounds } =
    useCustomAudios();

  const { roomCount, sendEffect, sendSoundEffect, sendCustomSound } =
    useRoomSocket(roomId, socketOptions);

  useEffect(() => {
    if (currentSoundEffect !== SoundEffect.NONE) {
      playSoundEffect(currentSoundEffect);
    }
  }, [currentSoundEffect, playSoundEffect]);

  useEffect(() => {
    if (currentCustomSound) {
      playCustomSound(currentCustomSound);
    }
  }, [currentCustomSound, playCustomSound]);

  const handleCustomSoundSubmit = useCallback(
    (data: CustomAudio) => {
      setCustomSounds((prev) => [...prev, data]);
    },
    [setCustomSounds],
  );

  const handleOpenCustomSoundPopup = useCallback(() => {
    setIsPopupOpen(true);
  }, []);

  const handleDeleteCustomSound = (b64: Base64URLString) => {
    setCustomSounds((prev) => prev.filter((audio) => audio.audio !== b64));
  };

  return (
    <div
      className={`w-screen h-screen flex flex-col items-center justify-center transition-all duration-500 bg-zinc-950  ${currentEffect === Effect.FLASH ? "animate-flash" : ""}`}
    >
      <CustomSoundPopup
        open={isPopupOpen}
        closePopup={() => setIsPopupOpen(false)}
        onSubmit={handleCustomSoundSubmit}
      />
      <div className="flex flex-col items-start gap-2">
        <button className="text-xl cursor-pointer transition hover:text-zinc-200">
          <ArrowLeft className="inline" onClick={() => router.back()} />
        </button>
        <h1 className="text-4xl">
          Room: {roomId}
          <button
            className="cursor-pointer transition hover:text-zinc-200 ml-4"
            onClick={copyRoomId}
          >
            {copiedRoomId ? <Check /> : <Copy />}
          </button>
        </h1>
        <div className="text-g mb-8 gap-1.5 flex items-center">
          <div className="bg-green-500 rounded-full w-3 h-3">
            <div className="bg-green-500 rounded-full w-3 h-3 animate-ping"></div>
          </div>
          <p>{roomCount} connected users</p>
        </div>
      </div>

      <div
        className={`flex flex-wrap gap-4 w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg p-4 items-center justify-center transition-all`}
      >
        <EffectButton
          effect={Effect.FLASH}
          onClick={(e) => sendEffect(e as Effect)}
          color="white"
        >
          Flash
        </EffectButton>
        <EffectButton
          effect={SoundEffect.PULSE}
          onClick={(e) => sendSoundEffect(e as SoundEffect)}
          color="white"
        >
          Pulse
        </EffectButton>
        {loadingCustomSounds &&
          [1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-xl w-20 h-20 bg-zinc-800 animate-pulse"
            ></div>
          ))}
        {customSounds.map((data) => (
          <CustomEffectButton
            key={data.name}
            effect={data.audio}
            onClick={(audio) => sendCustomSound(audio)}
            color={data.color}
          >
            {data.name}
            <button
              className=" text-black hover:text-zinc-900 transition inver rounded cursor-pointer absolute top-1 right-1"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCustomSound(data.audio);
              }}
            >
              <Trash size={"1.25rem"} />
            </button>
          </CustomEffectButton>
        ))}
        <button
          className="w-full py-2 bg-zinc-800 rounded-lg transition cursor-pointer hover:bg-zinc-800/90"
          onClick={handleOpenCustomSoundPopup}
        >
          Upload custom audio
        </button>
      </div>
    </div>
  );
}
