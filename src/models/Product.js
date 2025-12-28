import mongoose from "mongoose";

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    des: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allow multiple docs without sku
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      trim: true,
      uppercase: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    images: [ImageSchema],

    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, default: "kg" },
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    ratingsAverage: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10, // keep one decimal
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
);
const Product = mongoose.model("Product", ProductSchema);
export default Product;