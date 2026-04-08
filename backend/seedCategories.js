require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const connectDB = require("./config/db");

const categories = [
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Kids", slug: "kids" },
  { name: "Accessories", slug: "accessories" },
];

const seed = async () => {
  try {
    await connectDB();
    
    // Optional: delete old categories
    // await Category.deleteMany({});
    
    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
    }
    
    console.log("? Categories seeded successfully: Men, Women, Kids, Accessories");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding categories:", err.message);
    process.exit(1);
  }
};

seed();
