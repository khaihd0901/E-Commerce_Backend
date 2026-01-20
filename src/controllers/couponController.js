import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";

// Create a new coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({
    success: true,
    data: coupon,
  });
});

// Get all coupons
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

// Get single coupon by ID
export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});

// Update coupon
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});

// Delete coupon
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
