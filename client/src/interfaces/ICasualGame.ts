export interface ICasualQuestion {
  index: number;
  id: number;
  image: string;
  options: string[];
}

export interface ICasualGame {
  id: number;
  current_question: ICasualQuestion;
}
