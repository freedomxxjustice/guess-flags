export interface IAchievement {
    id: number;
    title: string;         
    category: "country" | "us_state" | "ru_region" | "ua_region" | "by_region";
    image: string;          
    description: string;    
    progress: number;       
    target: number;         
    achieved?: boolean;     
  }
  