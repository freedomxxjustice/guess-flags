export interface ITournament {
  tournament_id: number;
  tournament_name: string;
  type: string;
  created_at: string;
  started_at: string;
  will_finish_at: string;
  finished_at: string;
  prizes: ITournamentPrizes[];
  participation_cost: number;
  min_participants: number;
  num_questions: number;
  gamemode: string;
  category: string;
  tags: string[];
  difficulty_multiplier: number;
  base_score: number;
  participants: ITournamentParticipant[];
  tries: number;
}
export interface ITournamentPrizes {
  place: number;
  type: string;
  link?: string;
  amount?: number;
  [key: string]: any;
}

export interface ITournamentParticipant {
  user_id: number;
  username: string;
  score: number;
  place?: number | null;
  prize?: ITournamentPrizes | null;
}
