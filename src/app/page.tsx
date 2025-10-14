"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Popup({
  open,
  closePopup,
  onSubmit,
}: {
  open: boolean;
  closePopup: () => void;
  onSubmit: (code: string) => void;
}) {
  const [code, setCode] = useState("");

  return open ? (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/90 backdrop-blur z-40">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-96 h-48 p-5 flex flex-col justify-center items-center relative">
        <button className="absolute top-1 right-1 cursor-pointer transition hover:text-zinc-200" onClick={closePopup}><X/></button>
        <input type="text" className="w-full py-2.5 text-xl text-center rounded-lg outline-none bg-zinc-800" placeholder="000-000" onChange={(e) => setCode(e.currentTarget.value)} />
        <button
          className="px-10 py-1.5 bg-white hover:bg-zinc-100 disabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-black rounded-full text-xl transition mt-4"
          disabled={code.length < 1 || code.length > 16}
          onClick={() => onSubmit(code)}
        >
          Join room
        </button>
      </div>
    </div>
  ) : null;
}

export default function Home() {
  const [popup, setPopup] = useState(false);

  const router = useRouter();

  function joinRoom(code: string) {
    return router.push("/room/" + code);
  }

  function handleRoomCode() {
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10);
      if (i === 2) code += "-";
    }

    return joinRoom(code);
  }

  function handleJoinRoom() {
    setPopup(!popup);
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <Popup open={popup} closePopup={handleJoinRoom} onSubmit={joinRoom} />
      <div className="w-fit h-fit relative">
        <h1 className="text-8xl font-black text-blue-500 absolute -z-10 translate-0.5 animate-pulse">
          Signal Link
        </h1>
        <h1 className="text-8xl font-black text-red-500 absolute -z-10 -translate-0.5 animate-pulse">
          Signal Link
        </h1>
        <h1 className="text-8xl font-black">Signal Link</h1>
      </div>
      <div className="flex gap-4">
        <button
          className="px-10 py-2 bg-white hover:bg-zinc-200 cursor-pointer text-black rounded-full text-xl transition mt-10"
          onClick={handleRoomCode}
        >
          Create room
        </button>
        <button
          className="px-10 py-2 border border-white hover:bg-white/5 cursor-pointer text-white rounded-full text-xl transition mt-10"
          onClick={handleJoinRoom}
        >
          Join room
        </button>
      </div>
    </div>
  );
}
