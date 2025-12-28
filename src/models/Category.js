import mongoose from "mongoose";

const CategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }
  },
);
const Category = mongoose.model("Category", CategorySchema);
export default Category;