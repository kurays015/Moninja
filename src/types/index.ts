export interface GameObject {
  id: number;
  type: "fruit" | "bomb" | "monad";
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  sliced: boolean;
  gravity: number;
  fruitName: string | null;
  // Monad-specific properties
  slashCount?: number; // Number of times slashed (max 10)
  maxSlashCount?: number; // Maximum slashes allowed (10 for monad)
  pointsPerSlash?: number; // Points per slash (20 for monad)
}

export interface GameStats {
  score: number;
  objectsSliced: number;
  speedLevel: number;
}

export interface SlashPoint {
  x: number;
  y: number;
}

export interface SliceEffect {
  id: number;
  x: number;
  y: number;
  type:
    | "fruit"
    | "bomb"
    | "start"
    | "monad"
    | "monad-explosion"
    | "monad-shatter";
  imageSrc?: string; // actual image to render in halves
  width?: number; // pixels
  height?: number; // pixels
  angle: number;
}

export interface ComboEffect {
  id: number;
  x: number;
  y: number;
  count: number;
}

export interface StartButton {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  sliced: boolean;
  gravity: number;
}

export interface UserData {
  hasUsername: boolean;
  user: {
    id: number;
    username: string;
    walletAddress: string;
  };
}

export interface AuthState {
  accountAddress: string | null;
  username: string | null;
  isLoadingUsername: boolean;
  message: string;
  error: string | null;
}
