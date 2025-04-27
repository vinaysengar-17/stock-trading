import mongoose from "mongoose";

// Lot Schema
const lotSchema = new mongoose.Schema(
  {
    trade_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      required: true,
    },
    stock_name: { type: String, required: true },
    lot_quantity: { type: Number, required: true },
    realized_quantity: { type: Number, default: 0 },
    realized_trade_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trade",
      },
    ],
    lot_status: {
      type: String,
      enum: ["OPEN", "PARTIALLY_REALIZED", "FULLY_REALIZED"],
      default: "OPEN",
    },
    method: { type: String, enum: ["FIFO", "LIFO"], required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const Lot = mongoose.model("Lot", lotSchema);

export default Lot;
