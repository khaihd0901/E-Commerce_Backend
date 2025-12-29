import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { sendVerificationEmail } from "./emailController.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //14 days

export const signUp = async (req, res) => {
  try {
    const { username, password, email, phone, firstName, lastName } = req.body;
    if (!username || !password || !email || !phone || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Cannot miss username, password, email, phone, firstName, lastName !!!",
      });
    }
    //check exit user?
    const userExited = await User.findOne({ username });
    if (userExited) {
      return res.status(409).json({ message: "User Exited !!!" });
    }
    //create new user
    await User.create({
      username,
      password,
      email,
      phone,
      displayName: `${firstName} ${lastName}`,
    });
    //return
    return res.sendStatus(204);
  } catch (error) {
    console.log("error when call signup", error);
    res.status(500).json({ message: "System Error" });
  }
};
export const signIn = async (req, res) => {
  try {
    //get input from req.body
    const { username, password } = req.body;
    console.log(password)
    if (!username || !password) {
      res.status(400).json({ message: "missing username or password !!!" });
    }
    //call hasedPassword on data base and compare with password user input
    const user = await User.findOne({ username });
    if (!user) throw new Error("User not found");
    if (!user.password) throw new Error("User has no stored password");
    if (!user) {
      return res
        .status(401)
        .json({ massage: "Username or Password not correct !!!" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Username or Password not correct !!!" });
    }
    //if valid create a accesstoken with jwt
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    //create refress token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    //store refress token in session
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    //return token to client throuth cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", //access from differnt domain
      maxAge: REFRESH_TOKEN_TTL,
    });
    //return access token in resposne
    return res
      .status(200)
      .json({ message: `User ${user.displayName} login success`, accessToken });
  } catch (error) {
    console.log("error when call signin", error);
    res.status(500).json({ message: "System Error" });
  }
};
export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      // delete refresstoken in database
      await Session.deleteOne({ refreshToken: token });
      // delete cookie
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.log("error when call signout", error);
    return res.status(500).json({ message: "system error" });
  }
};

// POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
  const { email } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "User with this email does not exist"
    });
  }

  const otp = user.createOTP();
  console.log(otp)
  await user.save({ validateBeforeSave: false });

  console.log("OTP:", otp);
  // TODO: send OTP via email or SMS
  sendVerificationEmail(email, otp);

  res.json({
    message: "OTP sent successfully"
  });
};
 //Verify OTP Controller
// POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  const user = await User.findOne({
    email,
    otp: hashedOTP,
    otpExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired OTP"
    });
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  user.isVerified = true;

  await user.save();

  res.json({
    message: "OTP verified successfully"
  });
};


