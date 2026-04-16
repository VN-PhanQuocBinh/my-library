import type { IDocGiaWithId } from "./doc-gia";
import type { INhanVienWithId } from "./user-schema";
import type { UserRole } from "./common";

declare global {
  namespace Express {
    interface Request {
      user?: (IDocGiaWithId | INhanVienWithId) & { role?: UserRole };
    }
  }
}

export {};
