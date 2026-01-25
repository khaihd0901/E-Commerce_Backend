import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      lowercase: true,
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    passWordChangedAt: Date,
    passWordResetExpires: Date,
    passWordResetOTP: String,

    accountVerifyToken: String,
    accountVerifyExpires: Date,
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
// UserSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");
//   this.passWordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   this.passWordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//   return resetToken; // send this via email
// };
UserSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

  this.passWordResetOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  this.passWordResetExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

  return otp;
};

UserSchema.methods.createAccountVerifyToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex')
  this.accountVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex')

  this.accountVerifyExpires = Date.now() + 24 * 60 * 60 * 1000 // 1 day
}
UserSchema.index({ accountVerifyExpires: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model("User", UserSchema);
export default User;
