import User from "../models/User.js";
import createPasswordResetToken from "../models/User.js";
import Session from "../models/Session.js";
import crypto from "crypto";
import { sendResetEmail } from "../utils/emailHandler.js";

// CREATE user
// export const createUser = async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     res.status(201).json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// READ all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// READ single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-hashedPassword");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { _id } = req.user;
    const { password } = req.body;
    const token = req.cookies?.refreshToken;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      if (token) {
        // delete refresstoken in database
        await Session.deleteOne({ refreshToken: token });
        // delete cookie
        res.clearCookie("refreshToken");
      }

      res.json(updatedPassword);
      return res.sendStatus(204);
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate password reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi, Please click on this link to reset your password, this link is valid for 10 minutes: http://localhost:5001/api/user/reset-password/${resetToken}`;
    const data = {
      to: email,
      text: "Hello, User",
      subject: "Password Reset Link",
      html: resetUrl,
    };
    sendResetEmail(email, data);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // console.log(hashedToken)
    const user = await User.findOne({
      passWordResetToken: token,
      passWordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.passWordResetToken = undefined;
    user.passWordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};