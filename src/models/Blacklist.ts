import mongoose, { Document, Schema } from "mongoose";

interface IBlacklist extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const BlacklistSchema = new Schema<IBlacklist>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

BlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Blacklist = mongoose.model<IBlacklist>("Blacklist", BlacklistSchema);

export default Blacklist;
export type { IBlacklist };
