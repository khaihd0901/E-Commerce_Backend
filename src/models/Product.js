import mongoose from "mongoose";

const ProductSchema = mongoose.Schema({
  title: { type: String, required: true, trim: true },

  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },

  des: String,

  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },

  unit: {
    type: String,
    enum: ["kg", "g", "bundle", "piece"],
    default: "kg",
  },
  weight: { type: Number, min: 0 },

  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  tags: [],
  images: [],

  harvestDate: Date,
  expiryDate: Date,

  origin: String,
  farmName: String,

  isOrganic: { type: Boolean, default: false },
  certifications: [],

  storage: String,

  status: {
    type: String,
    enum: ["available", "out_of_stock", "seasonal"],
    default: "available",
  },
  ratings: [
    {
      star: Number,
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: String,
    },
  ],
  ratingsQuantity: { type: Number, default: 0 },
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;