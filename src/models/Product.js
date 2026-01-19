import mongoose from "mongoose";

const ProductSchema = mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
    unique: false,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  des: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  tags: [],
  images: [],
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  sold: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: String,
    trim: true,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  ratings: [
    {
      star: Number,
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
    },
  ],
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
});
const Product = mongoose.model("Product", ProductSchema);
export default Product;
