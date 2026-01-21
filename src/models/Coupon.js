import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      set: (value) => value.replace(/\s+/g, "").toUpperCase().trim(),
    },
    des: {
      type: String,
      trim: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: 0,
      min: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", CouponSchema);
export default Coupon;
