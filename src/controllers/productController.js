import Product from "../models/Product.js";
import User from "../models/User.js";
import { uploadImages, deleteImage } from "../utils/cloudinary.js";
import fs from "fs";
import asyncHandler from "express-async-handler";

// ============================
// CREATE PRODUCT
// ============================
export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

// ============================
// GET ALL PRODUCTS
// ============================
export const getProducts = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Product.find(JSON.parse(queryStr))
    .populate("category")
    .populate("brand");

  // sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  }

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numProducts = await Product.countDocuments();
    if (skip >= numProducts) {
      res.status(404);
      throw new Error("This page does not exist");
    }
  }

  const products = await query;
  res.status(200).json(products);
});

// ============================
// GET PRODUCT BY ID
// ============================
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json(product);
});

// ============================
// UPDATE PRODUCT
// ============================
export const updateProduct = asyncHandler(async (req, res) => {
  console.log("RAW BODY:", req.body);

  let { removedImages = [], newImages = [], ...updateData } = req.body;

  if (!Array.isArray(removedImages)) {
    removedImages = JSON.parse(removedImages || "[]");
  }
  if (!Array.isArray(newImages)) {
    newImages = JSON.parse(newImages || "[]");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (removedImages.length > 0) {
    await Promise.all(removedImages.map((id) => deleteImage(id)));

    product.images = product.images.filter(
      (img) => !removedImages.includes(img.public_id),
    );
  }

  if (newImages.length > 0) {
    product.images = [...product.images, ...newImages];
  }

  Object.assign(product, updateData);

  product.markModified("images");

  const saved = await product.save();

  console.log("AFTER SAVE:", saved.images);

  res.status(200).json(saved);
});

// ============================
// DELETE PRODUCT
// ============================
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  const imgIds = product.images.map((img) => img.public_id);
  console.log("imgIds", imgIds)
  if (imgIds.length > 0) {
    await Promise.all(imgIds.map((id => deleteImage(id) )))
  }
  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Product deleted successfully" });
});

// ============================
// ADD / REMOVE WISHLIST
// ============================
export const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;

  const user = await User.findById(_id);

  const alreadyAdded = user.wishList.find((id) => id.toString() === prodId);

  let updatedUser;

  if (alreadyAdded) {
    updatedUser = await User.findByIdAndUpdate(
      _id,
      { $pull: { wishList: prodId } },
      { new: true },
    );
  } else {
    updatedUser = await User.findByIdAndUpdate(
      _id,
      { $push: { wishList: prodId } },
      { new: true },
    );
  }

  res.status(200).json(updatedUser);
});

// ============================
// RATE PRODUCT
// ============================
export const ratingProduct = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;

  const product = await Product.findById(prodId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyRated = product.ratings.find(
    (r) => r.postedBy.toString() === _id.toString(),
  );

  if (alreadyRated) {
    await Product.updateOne(
      { "ratings._id": alreadyRated._id },
      { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
    );
  } else {
    await Product.findByIdAndUpdate(prodId, {
      $push: {
        ratings: { star, comment, postedBy: _id },
      },
    });
  }

  const updatedProduct = await Product.findById(prodId);

  const totalRating = updatedProduct.ratings.length;
  const ratingsSum = updatedProduct.ratings.reduce(
    (sum, item) => sum + item.star,
    0,
  );

  const actualRating = Math.round(ratingsSum / totalRating);

  await Product.findByIdAndUpdate(prodId, {
    ratingsQuantity: actualRating,
  });

  res.status(200).json({ message: "Rating submitted successfully" });
});

// ============================
// UPLOAD PRODUCT IMAGES
// ============================
export const uploadProductImages = asyncHandler(async (req, res) => {
  const uploader = (path) => uploadImages(path, "images");
  const urls = [];

  for (const file of req.files) {
    const newPath = await uploader(file.path);
    urls.push(newPath);
    fs.unlinkSync(file.path);
  }

  res.status(200).json(urls);
});

// ============================
// DELETE PRODUCT IMAGE
// ============================
export const deleteProductImage = asyncHandler(async (req, res) => {
  const public_id = req.params.id;
  const deletedImage = await deleteImage(public_id);

  res.status(200).json(deletedImage);
});
