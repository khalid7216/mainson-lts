const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect("mongodb+srv://khalidsanawer2_db_user:X3BDIfXrCXwRe8Zz@maison-elite.adygpjh.mongodb.net/?appName=maison-elite")
  .then(async () => {
    console.log("Connected to DB");
    const adminEmail = "admin@maison.com";
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
       console.log("Admin string already exists. Updating role and password...");
       existing.role = "admin";
       existing.password = "admin123";
       await existing.save();
    } else {
       console.log("Creating new admin user...");
       await User.create({
         name: "Admin User",
         email: adminEmail,
         password: "admin123",
         role: "admin",
         isVerified: true
       });
    }
    console.log("Admin credentials created: admin@maison.com / admin123");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
