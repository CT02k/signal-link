"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { Effect, SoundEffect } from "./types/effect";

let socket: Socket;

export default function RoomPage() {
  const params = useParams();
  const { id: roomId } = params;

  const [roomCount, setRoomCount] = useState(0);

  const [effect, setEffect] = useState<Effect>(Effect.NONE);
  const [soundEffect, setSoundEffect] = useState<SoundEffect>(SoundEffect.NONE);

  const [isTabActive, setIsTabActive] = useState(true);

  const [copied, setCopied] = useState(false);

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

    return () => {
      socket.disconnect();
    };
  });

  function playSoundEffect(soundEffect: SoundEffect) {
    const effect = new Audio(`/sounds/effects/${soundEffect}.mp3`);
    effect.play();
  }

  useEffect(() => {
    if (soundEffect !== SoundEffect.NONE) playSoundEffect(soundEffect);
  }, [soundEffect]);

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

  function handleCopyRoomCode() {
    const cb = navigator.clipboard;

    if (!roomId) return;

    cb.writeText(roomId as string).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  }

  return (
    <div
      className={`w-screen h-screen flex flex-col items-center justify-center transition-all duration-500 bg-zinc-950  ${effect === Effect.FLASH && "animate-flash"}`}
    >
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
      <div className={`flex gap-4`}>
        <button
          onClick={() => handleEffect(Effect.FLASH)}
          className="w-20 h-20 hvs bg-zinc-600 text-white rounded-xl hover:bg-zinc-600/90 hover:translate-y-[2px] hover:translate-x-[2px] cursor-pointer transition-all"
        >
          Flash
        </button>
        <button
          onClick={() => handleSoundEffect(SoundEffect.PULSE)}
          className="w-20 h-20 bg-rose-600 text-white rounded-xl hover:bg-rose-600/90 hover:translate-y-[2px] hover:translate-x-[2px] cursor-pointer transition-all"
        >
          Pulse
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
