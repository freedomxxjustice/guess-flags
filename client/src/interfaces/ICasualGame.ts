export interface ICasualQuestion {
  id: number;
  image: string;
  options: string[];
  answer: string;
}

export interface ICasualGame {
  id: number;
  questions: ICasualQuestion[];
}
