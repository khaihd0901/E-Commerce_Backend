import mongoose from "mongoose";

const CategorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      }
    ]
  },
);
const Category = mongoose.model("Category", CategorySchema);
export default Category;