export interface IUser {
  id: number;
  created_at: Date;
  name: string;
  tries_left: number;
  rating: number;
  rating_games_played: number;
  rating_games_won: number;
  total_score: number;
  best_score: number;
  casual_score: number;
  training_score: number;
  casual_games_played: number;
  today_casual_score: number;
}
