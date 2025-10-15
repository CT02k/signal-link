import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { Effect, SoundEffect } from "../types/effect";

interface RoomSocketOptions {
  onEffect?: (effect: Effect) => void;
  onSoundEffect?: (effect: SoundEffect) => void;
  onCustomSound?: (audio: Base64URLString) => void;
}

interface UseRoomSocketResult {
  roomCount: number;
  sendEffect: (effect: Effect) => void;
  sendSoundEffect: (effect: SoundEffect) => void;
  sendCustomSound: (audio: Base64URLString) => void;
  socketId?: string;
}

export function useRoomSocket(
  roomId: string,
  options?: RoomSocketOptions,
): UseRoomSocketResult {
  const socketRef = useRef<Socket | null>(null);
  const [roomCount, setRoomCount] = useState(0);
  const [socketId, setSocketId] = useState<string>();

  const sendEffect = useCallback((effect: Effect) => {
    socketRef.current?.emit("message", effect);
  }, []);

  const sendSoundEffect = useCallback((effect: SoundEffect) => {
    socketRef.current?.emit("message", effect);
  }, []);

  const sendCustomSound = useCallback((audio: Base64URLString) => {
    socketRef.current?.emit("customAudio", audio);
  }, []);

  useEffect(() => {
    const socket = io({ query: { room: roomId } });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log(`[Socket] Connected to room ${roomId}, id: ${socket.id}`);
    });

    socket.on("roomCount", (count: number) => {
      setRoomCount(count);
    });

    socket.on("message", (msg: Effect | SoundEffect) => {
      if (Object.values(Effect).includes(msg as Effect)) {
        options?.onEffect?.(msg as Effect);
      } else if (Object.values(SoundEffect).includes(msg as SoundEffect)) {
        options?.onSoundEffect?.(msg as SoundEffect);
      }
    });

    socket.on("customAudio", (audio: Base64URLString) => {
      options?.onCustomSound?.(audio);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, options]);

  return {
    roomCount,
    socketId,
    sendEffect,
    sendSoundEffect,
    sendCustomSound,
  };
}
