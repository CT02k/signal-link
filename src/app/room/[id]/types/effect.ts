export enum Effect {
  NONE = "none",
  FLASH = "flash",
}

export enum SoundEffect {
  NONE = "none",
  PULSE = "pulse",
}

export type AnyEffect = Effect | SoundEffect;
