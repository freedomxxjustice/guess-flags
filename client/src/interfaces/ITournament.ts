export interface ITournament {
  tournament_id: number;
  tournament_name: string;
  created_at: string;
  prizes: ITournamentPrizes[];
  participants: ITournamentParticipant[];
  started_at: string;
  type: string;
  finished_at: string;
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
