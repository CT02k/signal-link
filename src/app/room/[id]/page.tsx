"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { Effect, SoundEffect } from "./types/effect";
import { CustomEffectButton, EffectButton } from "./components/effectButton";
import { CustomSoundPopup } from "./components/popup";
import { CustomAudio } from "./types/custom";

let socket: Socket;

export default function RoomPage() {
  const params = useParams();
  const { id: roomId } = params;

  const [roomCount, setRoomCount] = useState(0);

  const [effect, setEffect] = useState<Effect>(Effect.NONE);
  const [soundEffect, setSoundEffect] = useState<SoundEffect>(SoundEffect.NONE);
  const [customSound, setCustomSound] = useState<Base64URLString>();

  const [isTabActive, setIsTabActive] = useState(true);

  const [copied, setCopied] = useState(false);

  const [popup, setPopup] = useState(false);
  const [customSounds, setCustomSounds] = useState<CustomAudio[]>([]);

  const pathname = usePathname();

  const router = useRouter();

  useEffect(() => {
    setIsTabActive(true);
  }, [pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsTabActive(true);
      } else {
        setIsTabActive(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsTabActive(false);
      } else {
        setIsTabActive(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange, false);
  });

  useEffect(() => {
    socket = io("http://localhost:3000", { query: { room: roomId } });

    socket.on("connect", () => {
      console.log("Connected to room:", roomId, "Socket ID:", socket.id);
    });

    const effectsEvent = (message: string) => {
      const msg = message as Effect | SoundEffect;

      if (Object.values(Effect).includes(msg as Effect)) {
        setEffect(msg as Effect);
        setTimeout(() => setEffect(Effect.NONE), 1000);
      }

      if (Object.values(SoundEffect).includes(msg as SoundEffect)) {
        setSoundEffect(msg as SoundEffect);
        setTimeout(() => setSoundEffect(SoundEffect.NONE), 1000);
      }

      playNotification();
    };

    socket.on("roomCount", (count: number) => {
      setRoomCount(count);
    });

    socket.on("message", (msg: Effect | SoundEffect) => {
      console.log("Message received:", msg);

      effectsEvent(msg);
    });

    socket.on("customAudio", (audio: Base64URLString) => {
      playCustomSound(audio);
    });

    return () => {
      socket.disconnect();
    };
  });

  function playSoundEffect(soundEffect: SoundEffect) {
    const effect = new Audio(`/sounds/effects/${soundEffect}.mp3`);
    effect.play();
  }

  function playCustomSound(sound: Base64URLString) {
    const custom = new Audio(sound);
    custom.play();
  }

  useEffect(() => {
    if (soundEffect !== SoundEffect.NONE) playSoundEffect(soundEffect);
  }, [soundEffect]);

  useEffect(() => {
    if (customSound) playCustomSound(customSound);
  }, [customSound]);

  function playNotification() {
    const sound = new Audio(
      isTabActive ? "/sounds/not.mp3" : "/sounds/not-inactive.mp3",
    );
    sound.play();
  }

  function handleEffect(effect: Effect) {
    socket.emit("message", effect);
    setEffect(effect);
    setTimeout(() => setEffect(Effect.NONE), 2000);
  }

  function handleSoundEffect(effect: SoundEffect) {
    socket.emit("message", effect);
    setSoundEffect(effect);
    setTimeout(() => setEffect(Effect.NONE), 1000);
  }

  function handleCustomSound(audio: Base64URLString) {
    socket.emit("customAudio", audio);
    setCustomSound(audio);
    setTimeout(() => setCustomSound(undefined), 2000);
  }

  function handleCopyRoomCode() {
    const cb = navigator.clipboard;

    if (!roomId) return;

    cb.writeText(roomId as string).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  }

  function handleCustomSoundUpload() {
    setPopup(true);
  }

  function handleCustomSoundSubmit(data: CustomAudio) {
    setCustomSounds((prev) => [...prev, data]);
  }

  useEffect(() => {
    socket.on("customSound", (base64: string) => {
      console.log("arribaa hermano", base64);
      const audio = new Audio(base64);
      audio.play();
    });

    return () => {
      socket.off("customSound");
    };
  }, []);

  return (
    <div
      className={`w-screen h-screen flex flex-col items-center justify-center transition-all duration-500 bg-zinc-950  ${effect === Effect.FLASH && "animate-flash"}`}
    >
      <CustomSoundPopup
        open={popup}
        closePopup={() => setPopup(false)}
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
            onClick={handleCopyRoomCode}
          >
            {copied ? <Check /> : <Copy />}
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
        className={`flex flex-wrap gap-4 w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg p-4 items-center justify-center`}
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
          onClick={handleCustomSoundUpload}
        >
          Upload custom audio
        </button>
      </div>

      <style jsx>{`
        @keyframes flash {
          0%,
          100% {
            filter: invert(100%);
          }
          50% {
            filter: invert(0%);
          }
        }
        .animate-flash {
          animation: flash 0.5s infinite;
        }
      `}</style>
    </div>
  );
}
