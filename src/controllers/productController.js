import Product from "../models/Product.js";
import User from "../models/User.js";
import { uploadImages, deleteImage } from "../utils/cloudinary.js";
import fs from "fs";
import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js"
import mongoose from "mongoose";

// ============================
// CREATE PRODUCT
// ============================
export const createProduct = asyncHandler(async (req, res) => {
  const { category,brand } = req.body;

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    res.status(400);
    throw new Error("Category not found");
  }
  const brandDoc = await Brand.findById(brand);
  if (!brandDoc) {
    res.status(400);
    throw new Error("Brand not found");
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.create([req.body], { session });

    await Category.findByIdAndUpdate(
      category,
      { $addToSet: { products: product[0]._id } }, // no duplicates
      { session }
    );
    await Brand.findByIdAndUpdate(
      brand,
      { $addToSet: { products: product[0]._id } }, // no duplicates
      { session }
    );
    await session.commitTransaction();
    res.status(201).json(product[0]);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
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

  const parsedQuery = JSON.parse(queryStr);

  // if (!parsedQuery.expiryDate) {
  //   parsedQuery.expiryDate = { $gte: new Date() };
  // }

  let query = Product.find(parsedQuery)
    .populate("category")
    .populate("brand");

  // sorting
  if (req.query.sort) {
    query = query.sort(req.query.sort.split(",").join(" "));
  } else {
    query = query.sort("-harvestDate");
  }

  // field limiting
  if (req.query.fields) {
    query = query.select(req.query.fields.split(",").join(" "));
  }

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const products = await query;
  res.status(200).json(products);
});



// ============================
// GET PRODUCT BY ID
// ============================
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    // .populate("category")
    // .populate("brand")
    // .populate("ratings.postedBy", "name");

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

  // ✅ Save old references
  const oldBrand = product.brand?.toString();
  const oldCategory = product.category?.toString();

  // ---------- IMAGE LOGIC ----------
  if (removedImages.length > 0) {
    await Promise.all(removedImages.map((id) => deleteImage(id)));
    product.images = product.images.filter(
      (img) => !removedImages.includes(img.public_id)
    );
  }

  if (newImages.length > 0) {
    product.images = [...product.images, ...newImages];
  }

  // ---------- UPDATE PRODUCT ----------
  Object.assign(product, updateData);

  product.markModified("images");

  const saved = await product.save();

  // ✅ New references
  const newBrand = saved.brand?.toString();
  const newCategory = saved.category?.toString();

  // ---------- BRAND SYNC ----------
  if (oldBrand && newBrand && oldBrand !== newBrand) {
    await Brand.findByIdAndUpdate(oldBrand, {
      $pull: { products: saved._id },
    });

    await Brand.findByIdAndUpdate(newBrand, {
      $addToSet: { products: saved._id },
    });
  }

  if (!oldBrand && newBrand) {
    await Brand.findByIdAndUpdate(newBrand, {
      $addToSet: { products: saved._id },
    });
  }

  // ---------- CATEGORY SYNC ----------
  if (oldCategory && newCategory && oldCategory !== newCategory) {
    await Category.findByIdAndUpdate(oldCategory, {
      $pull: { products: saved._id },
    });

    await Category.findByIdAndUpdate(newCategory, {
      $addToSet: { products: saved._id },
    });
  }

  if (!oldCategory && newCategory) {
    await Category.findByIdAndUpdate(newCategory, {
      $addToSet: { products: saved._id },
    });
  }

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
  if (imgIds.length > 0) {
    await Promise.all(imgIds.map((id => deleteImage(id) )))
  }
  await Product.findByIdAndDelete(req.params.id);
  
  if (product.brand) {
    await Brand.findByIdAndUpdate(product.brand, {
      $pull: { products: product._id },
    });
  }
  
  if (product.category) {
    await Category.findByIdAndUpdate(product.category, {
      $pull: { products: product._id },
    });
  }

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

  const existingRating = product.ratings.find(
    (r) => r.postedBy.toString() === _id.toString()
  );

  if (existingRating) {
    existingRating.star = star;
    existingRating.comment = comment;
  } else {
    product.ratings.push({ star, comment, postedBy: _id });
  }

  product.ratingsQuantity = product.ratings.length;
  product.ratingsAverage =
    product.ratings.reduce((sum, r) => sum + r.star, 0) /
    product.ratingsQuantity;

  await product.save();

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
