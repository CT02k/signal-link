"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function handleRoomCode() {
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10);
      if (i === 2) code += "-";
    }

    return router.push("/room/" + code);
  }

  function handleJoinRoom() {
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10);
      if (i === 2) code += "-";
    }

    return router.push("/room/" + code);
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center">
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
