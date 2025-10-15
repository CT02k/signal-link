"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { Effect, SoundEffect } from "./types/effect";
import { CustomEffectButton, EffectButton } from "./components/effectButton";
import { CustomSoundPopup } from "./components/popup";
import { CustomAudio } from "./types/custom";
import { useCopyToClipboard } from "./hooks/copyToClipboard";
import { useCustomAudios } from "./hooks/customAudios";
import { useTabVisibility } from "./hooks/tabVisibility";

let socket: Socket;

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const router = useRouter();

  const [roomCount, setRoomCount] = useState(0);
  const [currentEffect, setCurrentEffect] = useState<Effect>(Effect.NONE);
  const [currentSoundEffect, setCurrentSoundEffect] = useState<SoundEffect>(
    SoundEffect.NONE,
  );
  const [currentCustomSound, setCurrentCustomSound] = useState<
    Base64URLString | undefined
  >(undefined);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [copiedRoomId, copyRoomId] = useCopyToClipboard(roomId);
  const isTabActive = useTabVisibility();
  const { customSounds, setCustomSounds, loadingCustomSounds } =
    useCustomAudios();

  const playSoundEffect = useCallback((sound: SoundEffect) => {
    const audio = new Audio(`/sounds/effects/${sound}.mp3`);
    audio.play();
  }, []);

  const playCustomSound = useCallback((sound: Base64URLString) => {
    const audio = new Audio(sound);
    audio.play();
  }, []);

  const playNotification = useCallback(() => {
    const soundPath = isTabActive
      ? "/sounds/not.mp3"
      : "/sounds/not-inactive.mp3";
    const audio = new Audio(soundPath);
    audio.play();
  }, [isTabActive]);

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

  useEffect(() => {
    socket = io("http://localhost:3000", { query: { room: roomId } });

    socket.on("connect", () => {
      console.log("Connected to room:", roomId, "Socket ID:", socket.id);
    });

    socket.on("roomCount", (count: number) => {
      setRoomCount(count);
    });

    socket.on("message", (msg: Effect | SoundEffect) => {
      console.log("Message received:", msg);
      const messageType = msg as Effect | SoundEffect;

      if (Object.values(Effect).includes(messageType as Effect)) {
        setCurrentEffect(messageType as Effect);
        setTimeout(() => setCurrentEffect(Effect.NONE), 1000);
      }

      if (Object.values(SoundEffect).includes(messageType as SoundEffect)) {
        setCurrentSoundEffect(messageType as SoundEffect);
        setTimeout(() => setCurrentSoundEffect(SoundEffect.NONE), 1000);
      }

      // playNotification();
      // TODO: Fix notifications duplicated
    });

    socket.on("customAudio", (audio: Base64URLString) => {
      playCustomSound(audio);
    });

    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("roomCount");
      socket.off("message");
      socket.off("customAudio");
    };
  }, [roomId, playNotification, playCustomSound]);

  const handleEffect = useCallback((effect: Effect) => {
    socket.emit("message", effect);
    setCurrentEffect(effect);
    setTimeout(() => setCurrentEffect(Effect.NONE), 2000);
  }, []);

  const handleSoundEffect = useCallback((effect: SoundEffect) => {
    socket.emit("message", effect);
    setCurrentSoundEffect(effect);
    setTimeout(() => setCurrentSoundEffect(SoundEffect.NONE), 1000);
  }, []);

  const handleCustomSound = useCallback((audio: Base64URLString) => {
    socket.emit("customAudio", audio);
    setCurrentCustomSound(audio);
    setTimeout(() => setCurrentCustomSound(undefined), 2000);
  }, []);

  const handleCustomSoundSubmit = useCallback(
    (data: CustomAudio) => {
      setCustomSounds((prev) => [...prev, data]);
    },
    [setCustomSounds],
  );

  const handleOpenCustomSoundPopup = useCallback(() => {
    setIsPopupOpen(true);
  }, []);

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
          onClick={(e) => handleEffect(e as Effect)}
          color="white"
        >
          Flash
        </EffectButton>
        <EffectButton
          effect={SoundEffect.PULSE}
          onClick={(e) => handleSoundEffect(e as SoundEffect)}
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
            onClick={(audio) => handleCustomSound(audio)}
            color={data.color}
          >
            {data.name}
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
