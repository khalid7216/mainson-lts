// backend/seedCategories.js
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const connectDB = require("./config/db");

const categories = [
  { name: "Dresses", slug: "dresses" },
  { name: "Outerwear", slug: "outerwear" },
  { name: "Tops", slug: "tops" },
  { name: "Bottoms", slug: "bottoms" },
  { name: "Shoes", slug: "shoes" },
  { name: "Accessories", slug: "accessories" },
];

const seed = async () => {
  try {
    await connectDB();
    
    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
    }
    
    console.log("✦ Categories seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding categories:", err.message);
    process.exit(1);
  }
};

seed();
