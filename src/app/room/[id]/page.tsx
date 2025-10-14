"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { useRouter } from "next/router";

let socket: Socket;

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id;
  const [effect, setEffect] = useState<"none" | "flash" | "pulse">("none");
  const [isTabActive, setIsTabActive] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Atualiza sempre que a rota muda
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

  // Detecta mudança de aba
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

  // Conecta ao socket apenas 1x
  useEffect(() => {
    socket = io("http://localhost:3000", { query: { room: roomId } });

    socket.on("connect", () => {
      console.log("Connected to room:", roomId, "Socket ID:", socket.id);
    });

    socket.on("message", (msg) => {
      console.log("Message received:", msg);

      if (msg === "flash") setEffect("flash");
      else if (msg === "pulse") setEffect("pulse");

      setTimeout(() => setEffect("none"), 1000);

      setTimeout(() => playNotification());
    });

    return () => {
      socket.disconnect();
    };
  });

  const playNotification = () => {
    const sound = new Audio(
      isTabActive ? "/sounds/not.mp3" : "/sounds/not-inactive.mp3",
    );
    sound.play().catch((err) => console.error("Erro ao tocar som:", err));
  };

  const handleFlash = () => {
    socket.emit("message", "flash");
    setEffect("flash");
    setTimeout(() => setEffect("none"), 1000);
  };

  const handlePulse = () => {
    socket.emit("message", "pulse");
    setEffect("pulse");
    setTimeout(() => setEffect("none"), 1000);
  };

  return (
    <div
      className={`w-screen h-screen flex flex-col items-center justify-center transition-all duration-500 bg-black  ${effect === "flash" && "animate-flash"}`}
    >
      <h1 className="text-4xl mb-8">Sala: {roomId}</h1>
      <div className={`flex gap-4 ${effect === "pulse" && "animate-pulse"}`}>
        <button
          onClick={handleFlash}
          className="w-20 h-20 hvs bg-zinc-600 text-white rounded-xl hover:bg-zinc-600/90 hover:translate-y-[2px] hover:translate-x-[2px] cursor-pointer transition-all"
        >
          Flash
        </button>
        <button
          onClick={handlePulse}
          className="w-20 h-20 hvs bg-rose-600 text-white rounded-xl hover:bg-rose-600/90 hover:translate-y-[2px] hover:translate-x-[2px] cursor-pointer transition-all"
        >
          Pulse
        </button>
      </div>

      <style jsx>{`
        @keyframes flash {
          0%,
          100% {
            background-color: white;
          }
          50% {
            background-color: black;
          }
        }
        .animate-flash {
          animation: flash 0.5s infinite;
        }
      `}</style>
    </div>
  );
}
