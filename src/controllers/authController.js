import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import {
  sendVerificationEmail,
  sendAccountVerificationEmail,
} from "../utils/emailHandler.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_SORT_TTL = 24 * 60 * 60 * 1000; // 1 days
const REFRESH_TOKEN_LONG_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export const signUp = asyncHandler(async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    res.status(400);
    throw new Error("Email, password and confirm password are required");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = await User.create({ email, password });

  await user.createAccountVerifyToken();
  await user.save();

  const verifyLink = `${process.env.CLIENT_URL}/verify-email/${user.accountVerifyToken}`;
  const verifyExpireTime = user.accountVerifyExpires;
  await sendAccountVerificationEmail(email, verifyLink, verifyExpireTime);

  res.status(201).json({
    message: "Account created. Please verify your email",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    accountVerifyToken: token,
    accountVerifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  user.isVerified = true;
  user.accountVerifyToken = undefined;
  user.accountVerifyExpires = undefined;

  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");

  await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LONG_TTL),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_SORT_TTL,
  });

  res.status(200).json({
    message: "Email verified & logged in",
    accessToken,
      id: user._id,
      email: user.email,
  });
});


export const signIn = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  console.log(req.body);
  if (!email || !password) {
    res.status(400);
    throw new Error("Missing email or password");
  }

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    res.status(401);
    throw new Error("email or password not correct");
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);
  if (!passwordCorrect) {
    res.status(401);
    throw new Error("email or password not correct");
  }

  if (!user.isVerified) {
    res.status(403).json({ message: "Please verify your email first" });
    throw new Error("Please verify your email first");
  }
  const REFRESH_TOKEN_TTL = rememberMe
    ? REFRESH_TOKEN_LONG_TTL // 30 days
    : REFRESH_TOKEN_SORT_TTL; // 1 day
  console.log(REFRESH_TOKEN_TTL);
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL },
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
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL,
  });

  res.status(200).json({
    _id: user._id,
    email: user.email,
    message: `User ${user.email} login success`,
    accessToken,
  });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

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

  const REFRESH_TOKEN_TTL = rememberMe
    ? REFRESH_TOKEN_LONG_TTL // 30 days
    : REFRESH_TOKEN_SORT_TTL; // 1 day

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
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

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }
  const session = await Session.findOne({ refreshToken: token });
  if (!session) {
    return res.status(403).json({ message: "Invalid token or expired" });
  }

  if (session.expiresAt < new Date()) {
    return res.status(403).json({ message: "Token expired" });
  }

  const accessToken = jwt.sign(
    {
      userId: session.userId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  res.json({ accessToken: accessToken });
};

export const signOut = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await Session.deleteOne({ refreshToken: token });
    res.clearCookie("refreshToken");
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
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

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

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
