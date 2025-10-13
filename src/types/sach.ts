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
  coverImage?: ImageInfo | null;
  detailedImages?: ImageInfo[] | null;
}

export type TGenre =
  | "Tiểu thuyết"
  | "Marketing - Bán hàng"
  | "Kỹ năng sống"
  | "Tâm lý";

export const GENRES: TGenre[] = [
  "Tiểu thuyết",
  "Marketing - Bán hàng",
  "Kỹ năng sống",
  "Tâm lý",
];
