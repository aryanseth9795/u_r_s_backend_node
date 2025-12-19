import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true
    },

    level: {
      type: Number,
      required: true,
      index: true // 0 = category, 1 = sub, 2 = sub-sub
    },

    path: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        index: true
      }
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

CategorySchema.index({ parent: 1, level: 1, name: 1 }, { unique: true });


export default mongoose.model("Category", CategorySchema);
