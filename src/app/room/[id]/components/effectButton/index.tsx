import { AnyEffect } from "../../types/effect";
import { TailwindColorClass } from "../../types/tw";

export function EffectButton({
  children,
  effect,
  color,
  onClick,
}: {
  children: React.ReactNode;
  effect: AnyEffect;
  color: TailwindColorClass;
  onClick: (effect: AnyEffect) => void;
}) {
  return (
    <button
      onClick={() => onClick(effect)}
      className={`w-20 h-20 bg-${color} text-black rounded-xl hover:bg-${color}/90 hover:translate-y-[2px] hover:translate-x-[2px] cursor-pointer transition-all`}
    >
      {children}
    </button>
  );
}

export function CustomEffectButton({
  children,
  effect,
  color,
  onClick,
}: {
  children: React.ReactNode;
  effect: Base64URLString;
  color: string;
  onClick: (effect: Base64URLString) => void;
}) {
  return (
    <div
      onClick={() => onClick(effect)}
      className={`w-20 h-20 px-1 text-white flex items-center justify-center rounded-xl hover:translate-y-[2px] hover:opacity-90 hover:translate-x-[2px] cursor-pointer transition-all relative`}
      style={{ background: color }}
    >
      {children}
    </div>
  );
}
