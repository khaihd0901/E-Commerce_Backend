import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    cart: [
      {
        type: Array,
        default: [],
      },
    ],
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: [],
      },
    ],
    otp: String,
    otpExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    passWordChangedAt: Date,
    passWordResetToken: String,
    passWordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);
// Hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passWordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passWordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken; // send this via email
};
UserSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

  this.otp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  this.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

  return otp;
};
const User = mongoose.model("User", UserSchema);
export default User;
