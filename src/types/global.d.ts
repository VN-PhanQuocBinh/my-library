import type { IDocGiaWithId } from "./doc-gia.ts";
import type { INhanVienWithId } from "./user-schema.ts";

declare global {
  namespace Express {
    interface Request {
      user?: (IDocGiaWithId | INhanVienWithId) & { role?: "reader" | "admin" };
    }
  }
}

export {};
