import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { sendVerificationEmail } from "../utils/emailHandler.js";

const ACCESS_TOKEN_TTL = "60m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Cannot miss username, password, email");
  }

  const userExist = await User.findOne({ username });
  if (userExist) {
    res.status(409);
    throw new Error("User already exists");
  }

  await User.create({ username, email, password });
  res.sendStatus(204);
});


export const signIn = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error("Missing username or password");
  }

  const user = await User.findOne({ username });
  if (!user || !user.password) {
    res.status(401);
    throw new Error("Username or password not correct");
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);
  if (!passwordCorrect) {
    res.status(401);
    throw new Error("Username or password not correct");
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");

  await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: REFRESH_TOKEN_TTL,
  });

  res.status(200).json({
    _id: user._id,
    email: user.email,
    message: `User ${user.username} login success`,
    accessToken,
  });
});


export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Missing email or password");
  }

  const user = await User.findOne({ email });
  if (!user || user.isAdmin !== true) {
    res.status(403);
    throw new Error("Not authorised");
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);
  if (!passwordCorrect) {
    res.status(401);
    throw new Error("Email or password not correct");
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");

  await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: REFRESH_TOKEN_TTL,
  });

  res.status(200).json({
    _id: user._id,
    email: user.email,
    message: `Admin ${user.username} login success`,
    accessToken,
  });
});


export const authMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});


export const signOut = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await Session.deleteOne({ refreshToken: token });
    res.clearCookie("refreshToken");
  }

  res.sendStatus(204);
});


export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User with this email does not exist");
  }

  const otp = user.createOTP();
  await user.save({ validateBeforeSave: false });

  sendVerificationEmail(email, otp);

  res.json({ message: "OTP sent successfully" });
});


export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await User.findOne({
    email,
    otp: hashedOTP,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  user.isVerified = true;

  await user.save();

  res.json({ message: "OTP verified successfully" });
});
