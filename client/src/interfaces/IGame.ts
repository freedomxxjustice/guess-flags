export interface IQuestion {
  index: number;
  flag_id: number;
  image: string;
  options: string[];
  mode: string;
}

export interface IGame {
  match_id: string;
  num_questions: number;
  current_question: IQuestion;
}
