export interface ImageInfo {
  url: string;
  publicId: string;
  folder?: string;
  originalName?: string;
  size?: number;
  format?: string;
  width?: number;
  height?: number;
  uploadedAt?: Date;
}

export interface ISach extends Document {
  name: string;
  normalizedName?: string;
  description?: string;
  slug?: string;
  price: {
    original: number;
    sale?: number;
  };
  quantity: number;
  publisher: string; // Reference to NhaXuatBan ID
  author: string;
  normalizedAuthor?: string;
  genre?: string;
  normalizedGenre?: string;
  pages?: number;
  language?: string;
  publishedDate?: Date;
  status?: boolean;

  // media
  coverImage?: ImageInfo;
  detailedImages?: ImageInfo[];
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
