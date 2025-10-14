"use client";

import { X, Music } from "lucide-react";
import { useState, useRef } from "react";
import { CustomAudio } from "../../types/custom";

export function CustomSoundPopup({
  open,
  closePopup,
  onSubmit,
}: {
  open: boolean;
  closePopup: () => void;
  onSubmit: (data: CustomAudio) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e11d48");
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleAudioUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAudioBase64(base64);
      setAudioName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function togglePlay() {
    if (!audioBase64) return;
    if (!audioRef.current) {
      const audio = new Audio(audioBase64);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function handleSubmit() {
    if (!audioBase64 || name.trim().length === 0) return;
    onSubmit({ name: name.trim(), color, audio: audioBase64 });
    closePopup();
    setName("");
    setColor("#e11d48");
    setAudioBase64(null);
    setAudioName(null);
    setIsPlaying(false);
  }

  return open ? (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/90 backdrop-blur z-40">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-96 p-6 flex flex-col justify-center items-center relative shadow-lg">
        <button
          className="absolute top-2 right-2 cursor-pointer transition hover:text-zinc-200"
          onClick={closePopup}
        >
          <X />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-white">Custom Sound</h2>

        <input
          type="text"
          maxLength={10}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Sound name (max. 10)"
          className="w-full py-2 px-3 mb-3 text-lg text-center rounded-lg outline-none bg-zinc-800 text-white placeholder:text-zinc-500"
        />

        <div className="flex items-center justify-between w-full mb-4">
          <label className="text-zinc-400 text-sm">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-zinc-700"
          />
        </div>

        <label
          htmlFor="audio-upload"
          className="group flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-700 rounded-lg bg-zinc-800 hover:border-zinc-500 transition-all cursor-pointer mb-3"
        >
          {audioBase64 ? (
            <>
              <Music className="text-zinc-300 mb-1" />
              <span className="text-sm text-zinc-400 text-center">
                {audioName}
              </span>
            </>
          ) : (
            <>
              <Music className="text-zinc-500 mb-1" />
              <span className="text-sm text-zinc-500 group-hover:text-zinc-300">
                Drag or drop a file here
              </span>
            </>
          )}
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="absolute opacity-0 cursor-pointer"
          />
        </label>

        {audioBase64 && (
          <button
            onClick={togglePlay}
            className="text-white mb-4 text-sm bg-zinc-800 hover:bg-zinc-800/90 cursor-pointer px-4 py-1 rounded-full transition"
          >
            {isPlaying ? "⏸️ Pause" : "▶️ Preview"}
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!audioBase64 || name.trim().length === 0}
          className="px-10 py-2 rounded-full text-lg font-semibold transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              !audioBase64 || name.trim().length === 0 ? "#3f3f46" : color,
          }}
        >
          Upload
        </button>
      </div>
    </div>
  ) : null;
}
