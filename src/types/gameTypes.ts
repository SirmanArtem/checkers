export enum PieceType {
  NONE = 'NONE',
  WHITE = 'WHITE',
  BLACK = 'BLACK',
  WHITE_KING = 'WHITE_KING',
  BLACK_KING = 'BLACK_KING'
}

export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export enum PlayerColor {
  WHITE = 'WHITE',
  BLACK = 'BLACK'
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Position;
  chain?: Move;
}

export interface Board {
  squares: PieceType[][];
}

export interface Game {
  id: string;
  board: Board;
  currentPlayer: PlayerColor;
  status: GameStatus;
  playerWhiteId?: string;
  playerBlackId?: string;
  playerWhiteName?: string;
  playerBlackName?: string;
  winner?: PlayerColor;
  createdAt?: Date;
}

export interface Player {
  id: string;
  name: string;
} 

export type GameErrorCode =
  | 'GAME_NOT_FOUND'
  | 'GAME_FULL'
  | 'NOT_YOUR_TURN'
  | 'INVALID_MOVE'
  | 'FAILED_TO_CREATE'
  | 'FAILED_TO_JOIN'
  | 'FAILED_TO_MAKE_MOVE';

export interface GameError {
  code: GameErrorCode;
  message: string;
}