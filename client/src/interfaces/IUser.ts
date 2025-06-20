export interface IUser {
  id: number;
  created_at: DataTransfer;
  name: string;
  tries_left: number;
  rating: number;
  games_played: number;
  games_won: number;
  total_score: number;
  best_score: number;
  casual_score: number;
}
