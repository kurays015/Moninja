export interface GameObject {
  id: number;
  type: "fruit" | "bomb" | "monad" | "john";
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  sliced: boolean;
  gravity: number;
  objectName: string | null;
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
  type: "fruit" | "bomb" | "monad" | "monad-shatter" | "john" | "john-shatter";
  imageSrc?: string; // actual image to render in halves
  width?: number; // pixels
  height?: number; // pixels
  angle: number;
  particleColor?: string;
  particleCount?: number;
}

export interface ComboEffect {
  id: number;
  x: number;
  y: number;
  count: number;
  text?: string; // Optional custom text for special bonuses
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

export interface SessionData {
  player: string;
  sessionId: string;
  startTime: number;
  iat: number;
}

export interface StartGameSessionRequest {
  walletAddress: string;
}

export interface StartGameSessionResponse {
  gameTime: number | undefined;
}

export interface EndGameSessionRequest {
  sessionId: string;
}

export interface SubmitScoreRequest {
  player: string;
  transactionAmount: number;
  scoreAmount: number;
  nonce: string;
}

export interface SubmitScoreResponse {
  success: true;
  transactionHash: string;
  player: `0x${string}`;
  scoreAmount: number;
  transactionAmount: number;
}

export interface UsernameResponse {
  hasUsername: boolean;
  user?: {
    username: string;
  };
  error?: string;
}

export interface PlayerScoreResponse {
  totalScore: number;
}

export interface GameState {
  score: number;
  submittedScore: number;
  gameOver: boolean;
  gameStarted: boolean;
  gamePaused: boolean;
  bombHit: boolean;
  gameEnded: boolean;
  isSlashing: boolean;
  isMonadSlashing: boolean;
  monadSlashCount: number;
  frenzyMode: boolean;
  frenzyTimeRemaining: number;
  isSubmitting: boolean;
  isJohnSlashing: boolean;
  johnSlashCount: number;
}

export interface GameSession {
  sessionId: string;
  player: string;
  privy_token: string;
  startTime: number;
  isActive: boolean;
}

export interface NoncePayload {
  sessionId: string;
  player: string;
  timestamp: number;
  random: string;
}

export interface GenerateNonceRequest {
  player: string;
}
