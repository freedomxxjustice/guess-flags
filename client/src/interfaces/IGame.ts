export interface IQuestion {
  image: string;
  options: string[];
  answer: string;
}

export interface IGame {
  questions: IQuestion[];
}