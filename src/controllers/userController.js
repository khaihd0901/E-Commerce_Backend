import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Session from "../models/Session.js";
import { sendResetPasswordOTP } from "../utils/emailHandler.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import crypto from "crypto";


// ============================
// GET ALL USERS
// ============================
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-hashedPassword");
  res.status(200).json(users);
});

export const authMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});
// ============================
// GET USER BY ID
// ============================
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-hashedPassword");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

// ============================
// UPDATE USER
// ============================
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, address } = req.body;

  const updateData = {
    firstName,
    lastName,
    phone,
    address,
    fullName: `${firstName} ${lastName}`,
  };

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

// ============================
// DELETE USER
// ============================
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// ============================
// UPDATE PASSWORD
// ============================
export const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  const token = req.cookies?.refreshToken;

  const user = await User.findById(_id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  user.password = password;
  await user.save();

  if (token) {
    await Session.deleteOne({ refreshToken: token });
    res.clearCookie("refreshToken");
  }

  res.status(200).json({ message: "Password updated successfully" });
});

// ============================
// FORGOT PASSWORD TOKEN
// ============================
export const forgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const OTP = await user.createOTP();
  await user.save();
  await sendResetPasswordOTP(email, OTP);

  res.status(200).json({ message: "Email sent successfully" });
});
export const verifyOTP = asyncHandler(async (req, res) => {
  const {OTP,email}= req.body
  const hashedOTP = crypto.createHash("sha256").update(OTP).digest("hex");

  const user = await User.findOne({
    email,
    passWordResetOTP: hashedOTP,
    passWordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
  res.json({ message: "OTP verified successfully" });
});
// ============================
// RESET PASSWORD
// ============================
export const resetPassword = asyncHandler(async (req, res) => {
  const { password, OTP,email } = req.body;
console.log(req.body)
  const hashedOTP = crypto.createHash("sha256").update(OTP).digest("hex");

  const user = await User.findOne({
    email: email,
    passWordResetOTP: hashedOTP,
    passWordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  user.password = password;
  user.passWordResetOTP = undefined;
  user.passWordResetExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});

// ============================
// GET WISHLIST
// ============================
export const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const wishList = await User.findById(_id).select("wishList");
  res.status(200).json(wishList);
});

// ============================
// USER CART
// ============================
export const userCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cart } = req.body;

  const user = await User.findById(_id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // Find existing cart
  let userCart = await Cart.findOne({ orderBy: _id });
  if (!userCart) {
    userCart = new Cart({
      orderBy: _id,
      items: [],
      cartTotal: 0,
    });
  }

  for (const item of cart) {
    const product = await Product.findById(item.prodId).select("price");
    if (!product) continue;

    const existingItemIndex = userCart.items.findIndex(
      (i) => i.prodId.toString() === item.prodId
    );

    if (existingItemIndex > -1) {
      // 🔥 Product exists → increase quantity
      userCart.items[existingItemIndex].quantity += item.quantity;
      userCart.items[existingItemIndex].price = product.price; // keep price updated
    } else {
      // 🆕 New product
      userCart.items.push({
        prodId: item.prodId,
        quantity: item.quantity,
        price: product.price,
      });
    }
  }

  // 🔄 Recalculate total
  userCart.cartTotal = userCart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await userCart.save();

  res.status(200).json(userCart);
});


// ============================
// GET USER CART
// ============================
export const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const cart = await Cart.findOne({ orderBy: _id }).populate("items.prodId");
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  res.status(200).json(cart);
});

// ============================
// EMPTY CART
// ============================
export const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  await Cart.findOneAndDelete({ orderBy: _id });

  res.status(200).json({
    success: true,
    message: "Cart emptied successfully",
  });
});

// ============================
// APPLY COUPON
// ============================
export const applyCoupon = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { coupon } = req.body;

  if (!coupon) {
    res.status(400);
    throw new Error("Coupon code is required");
  }

  const couponCode = coupon.trim().toUpperCase()
  const validCoupon = await Coupon.findOne({ code: couponCode });

  if (
    !validCoupon ||
    !validCoupon.isActive ||
    validCoupon.expiryDate < new Date()
  ) {
    res.status(400);
    throw new Error("Invalid or expired coupon");
  }

  const cart = await Cart.findOne({ orderBy: _id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  if (cart.cartTotal < validCoupon.minPurchaseAmount) {
    res.status(400);
    throw new Error(
      `Minimum purchase amount is ${validCoupon.minPurchaseAmount}`
    );
  }

  const totalAfterDiscount = (
    cart.cartTotal -
    (cart.cartTotal * validCoupon.discountValue) / 100
  ).toFixed(2);

  cart.totalAfterDiscount = totalAfterDiscount;
  await cart.save();

  res.status(200).json({
    success: true,
    coupon: couponCode,
    totalAfterDiscount,
  });
});

// ============================
// CREATE ORDER
// ============================
export const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;

  if (!COD) {
    res.status(400);
    throw new Error("Create cash order failed");
  }

  const userCart = await Cart.findOne({ orderBy: _id });
  if (!userCart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const finalAmount =
    couponApplied && userCart.totalAfterDiscount
      ? userCart.totalAfterDiscount
      : userCart.cartTotal;

  await Order.create({
    orderBy: _id,
    items: userCart.items,
    totalAmount: finalAmount,
    paymentIntent: {
      amount: finalAmount,
      status: "processing",
      method: "cod",
    },
  });

  const updates = userCart.items.map((item) => ({
    updateOne: {
      filter: { _id: item.prodId },
      update: {
        $inc: {
          stock: -item.quantity,
          sold: +item.quantity,
        },
      },
    },
  }));

  await Product.bulkWrite(updates);

  res.status(200).json({ message: "Order created successfully" });
});

// ============================
// GET ORDER BY USER
// ============================
export const getOrderbyUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const order = await Order.findOne({ orderBy: _id })
    .populate("items.prodId")
    .populate("orderBy");

  res.status(200).json(order);
});

// ============================
// GET ALL ORDERS
// ============================
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("orderBy");
  res.status(200).json(orders);
});

// ============================
// UPDATE ORDER STATUS
// ============================
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  res.status(200).json(order);
});
