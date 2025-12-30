import Product from "../models/Product.js";
import User from "../models/User.js";
import {uploadImages, deleteImage} from "../utils/cloudinary.js";
import fs from "fs";
// Create a product
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    //filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    console.log(excludeFields);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));
    //sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query.sort(sortBy);
    } else {
      query.sort("-createdAt");
    }
    // litmiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query.select(fields);
    }
    // pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numProducts = await Product.countDocuments();
      if (skip >= numProducts) {  throw new Error("This page does not exist"); }    
    }
    const product = await query;
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  const {_id} = req.user;
  const {prodId} = req.body;
  console.log(prodId)
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishList.find((_id) => _id.toString() === prodId);
    console.log(alreadyAdded)
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(_id, {
        $pull: {wishList: prodId},
      },
      {new: true});
      res.status(200).json(user);
    } else {
      let user = await User.findByIdAndUpdate(_id, {
        $push: {wishList: prodId},
      },
      {new: true});
      res.status(200).json(user);
    } 
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};
export const ratingProduct = async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
        let updateRating = await Product.updateOne(
        { ratings: { $elemMatch: alreadyRated } },
        { $set: { "ratings.$.star": star, "ratings.$.comment": comment } }
      );
      console.log(updateRating);
      res.status(200).json({message: "Rating updated successfully"});
    } else {
        await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star,
              comment,
              postedBy: _id,
            },
          },
        },
        { new: true }
      );
    }
    const getallRatings = await Product.findById(prodId);
    let totalRating = getallRatings.ratings.length;
    let ratingsSum = getallRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsSum / totalRating);
    await Product.findByIdAndUpdate(
      prodId,
      { ratingsQuantity: actualRating },
      { new: true }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadProductImages = async (req, res) => {
  try{
    const uploader = (path) => uploadImages(path, 'images');
    const urls = [];
    const files = req.files;
    console.log(files)
    for (const file of files){
      const {path} = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const images = urls.map((file) => {
      return file;
    })
    res.json(images);
  
  }catch(error){
    res.status(500).json({error: error.message});
  }
}

export const deleteProductImage = async (req, res) => {
  try{
    const public_id = req.params.id;
    const deletedImage = await deleteImage(public_id);
    console.log("deleted")
    res.json(deletedImage);
  }catch(error){
    res.status(500).json({error: error.message});
  }
}