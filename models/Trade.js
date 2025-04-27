import mongoose from "mongoose";


// Trade Schema
const tradeSchema = new mongoose.Schema(
  {
    stock_name: {
      type: String,
      required: [true, "Stock name is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    broker_name: {
      type: String,
      required: [true, "Broker name is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    amount: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Automatically calculate amount before saving
tradeSchema.pre("save", function (next) {
  this.amount = this.price * Math.abs(this.quantity);
  next();
});

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;
