import asyncHandler from "express-async-handler";
import Brand from "../models/Brand.js";

// Create a new brand
export const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Brand name is required");
  }

  const brand = await Brand.create({ name });
  res.status(201).json({
    message: "Brand created successfully",
    brand,
  });
});

// Get all brands
export const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  res.status(200).json(brands);
});

// Get brand by ID
export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  res.status(200).json(brand);
});

// Update brand
export const updateBrand = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true, runValidators: true }
  );

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  res.status(200).json({
    message: "Brand updated successfully",
    brand,
  });
});

// Delete brand
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  res.status(200).json({
    message: "Brand deleted successfully",
  });
});
