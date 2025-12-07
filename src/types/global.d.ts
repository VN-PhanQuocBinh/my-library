import type { IDocGiaWithId } from "./doc-gia.ts";
import type { INhanVienWithId } from "./user-schema.ts";
import type { UserRole } from "./common.ts";

declare global {
  namespace Express {
    interface Request {
      user?: (IDocGiaWithId | INhanVienWithId) & { role?: UserRole };
    }
  }
}

export {};
