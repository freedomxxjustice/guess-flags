export interface ISeasonPrize {
  id: number;
  title: string;
  link: string | undefined;
  place: number;
  quantity: number;
}

export interface ISeason {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  prizes: ISeasonPrize[];
}
