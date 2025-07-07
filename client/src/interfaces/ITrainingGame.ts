export interface ITrainingQuestion {
  id: number;
  image: string;
  options: string[];
  answer: string;
}

export interface ITrainingGame {
  questions: ITrainingQuestion[];
}
