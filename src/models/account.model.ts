import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  accountId: string;
  name: string;
  balance: number;
  createdAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

export const Account = mongoose.model<IAccount>(
  "Account",
  accountSchema
);