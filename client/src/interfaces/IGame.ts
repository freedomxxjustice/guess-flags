export interface IQuestion {
  id: number;
  image: string;
  options: string[];
  answer: string;
}

export interface IGame {
  questions: IQuestion[];
}
