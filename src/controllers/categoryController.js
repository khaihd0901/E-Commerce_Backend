import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

// Create a category
export const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;
  if (!categoryName) {
    res.status(400);
    throw new Error("Brand name is required");
  }

  const category = await Category.create({ categoryName });
  res.status(201).json(category);
});

// Read all categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories || categories.length === 0) {
    res.status(404);
    throw new Error("No categories found");
  }

    res.status(200).json(categories);
});

// Read a single category
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json(category);
});

// Update a category
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

   res.status(200).json(category);
});

// Delete a category
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

    res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
