import mongoose, { Schema, Document } from "mongoose";
const accountSchema = new Schema({
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
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
});
export const Account = mongoose.model("Account", accountSchema);
