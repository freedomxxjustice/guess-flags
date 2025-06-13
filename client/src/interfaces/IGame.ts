export interface Question {
  image: string;
  options: string[];
  answer: string;
}

export interface Game {
  questions: Question[];
}