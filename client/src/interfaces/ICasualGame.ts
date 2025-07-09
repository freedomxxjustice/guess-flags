export interface ICasualQuestion {
  index: number;
  flag_id: number;
  image: string;
  options: string[];
}

export interface ICasualGame {
  match_id: string;
  current_question: ICasualQuestion;
}
