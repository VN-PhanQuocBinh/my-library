import Blacklist from "../models/Blacklist.ts";
import jwt from "jsonwebtoken";

class BlacklistService {
  async addToBlacklist(token: string, expiresAt?: Date): Promise<void> {
    try {
      let tokenExpiresAt = expiresAt;

      if (!tokenExpiresAt) {
        try {
          const decoded = jwt.decode(token) as any;
          tokenExpiresAt = decoded?.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 1 day
        } catch {
          tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 1 day
        }
      }

      await Blacklist.create({
        token,
        expiresAt: tokenExpiresAt,
      });
    } catch (error) {
      if ((error as any).code !== 11000) {
        throw error;
      }
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await Blacklist.findOne({ token });
    return !!blacklistedToken;
  }

  
  async cleanupExpiredTokens(): Promise<number> {
    const result = await Blacklist.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  }

  async getBlacklistStats(): Promise<{
    total: number;
    expired: number;
    active: number;
  }> {
    const total = await Blacklist.countDocuments();
    const expired = await Blacklist.countDocuments({
      expiresAt: { $lt: new Date() },
    });
    const active = total - expired;

    return { total, expired, active };
  }
}

export default new BlacklistService();
