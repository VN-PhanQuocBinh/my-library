export interface ISach extends Document {
  name: string;
  description?: string;
  slug?: string;
  price: {
    original: number;
    sale?: number;
  };
  quantity: number;
  publisher: string; // Reference to NhaXuatBan ID
  author: string;
  genre?: string;
  pages?: number;
  language?: string;
  publishedDate?: Date;
  status?: boolean;

  // media
  coverImage?: string;
  detailedImages?: string[];
}

export type TGenre =
  | "fiction"
  | "nonFiction"
  | "scienceFiction"
  | "fantasy"
  | "mystery"
  | "biography"
  | "history"
  | "poetry"
  | "self-help"
  | "business";

export const GENRES: TGenre[] = [
  "fiction",
  "nonFiction",
  "scienceFiction",
  "fantasy",
  "mystery",
  "biography",
  "history",
  "poetry",
  "self-help",
  "business",
];
