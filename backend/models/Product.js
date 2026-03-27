// backend/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Product name is required"],
      trim:     true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type:   String,
      unique: true,
      lowercase: true,
      trim:   true,
    },
    description: {
      type:    String,
      default: "",
    },
    shortDescription: {
      type:    String,
      default: "",
    },
    subCategory: {
      type:    String,
      default: "",
    },
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type:    Number,
      default: null,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Category",
    },
    badge: {
      type: String,
      enum: ["New", "Sale", "Bestseller", "Limited", "Exclusive", ""],
      default: "",
    },
    images: {
      type:    [String],
      default: [],
    },
    variants: [
      {
        color: String,
        size:  String,
        price: Number,
        stock: {
          type: Number,
          default: 0
        }
      }
    ],
    materials: {
      type:    String,
      default: "",
    },
    careInstructions: {
      type:    String,
      default: "",
    },
    madeIn: {
      type:    String,
      default: "",
    },
    tags: {
      type:    [String],
      default: [],
    },
    isFeatured: {
      type:    Boolean,
      default: false,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ── Auto-generate slug from name ───────────────── */
productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

/* ── Virtual: aggregateRating ───────────────────── */
productSchema.virtual("ratings", {
  ref:          "Rating",
  localField:   "_id",
  foreignField: "product",
});

productSchema.set("toJSON",   { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
