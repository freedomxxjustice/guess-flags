export interface ITournament {
  tournament_id: number;
  name: string;
  created_at: Date;
  prizes: ITournamentPrizes[];
  participants: ITournamentParticipant[];
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
