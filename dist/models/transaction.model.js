import mongoose, { Schema, Document } from "mongoose";
const transactionSchema = new Schema({
    accountId: {
        type: String,
        required: true,
        index: true,
        immutable: true,
    },
    referenceId: {
        type: String,
        required: true,
        trim: true,
        immutable: true,
    },
    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01,
        immutable: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
        immutable: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
});
transactionSchema.index({ accountId: 1, referenceId: 1 }, { unique: true });
export const Transaction = mongoose.model("Transaction", transactionSchema);
