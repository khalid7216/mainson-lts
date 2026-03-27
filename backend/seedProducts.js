const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const productsToInsert = [
  { 
    _id: "65f010000000000000000001",
    name: "Obsidian Slip Dress",
    slug: "obsidian-slip-dress",
    price: 289,
    compareAtPrice: 389,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80"],
    variants: [
      { color: "Black", size: "S", price: 289, stock: 15 },
      { color: "Black", size: "M", price: 289, stock: 20 },
      { color: "Black", size: "L", price: 289, stock: 15 }
    ]
  },
  { 
    _id: "65f010000000000000000002",
    name: "Midnight Tailored Blazer",
    slug: "midnight-tailored-blazer",
    price: 445,
    badge: "Bestseller",
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"],
    variants: [
      { color: "Navy", size: "M", price: 445, stock: 25 },
      { color: "Navy", size: "L", price: 445, stock: 25 }
    ]
  },
  { 
    _id: "65f010000000000000000003",
    name: "Cashmere Veil Turtleneck",
    slug: "cashmere-veil-turtleneck",
    price: 198,
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80"],
    variants: [
      { color: "Cream", size: "One Size", price: 198, stock: 50 }
    ]
  },
  { 
    _id: "65f010000000000000000004",
    name: "Palazzo Wide-Leg Trousers",
    slug: "palazzo-wide-leg-trousers",
    price: 262,
    compareAtPrice: 312,
    badge: "Sale",
    images: ["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&q=80"],
    variants: [
      { color: "White", size: "M", price: 262, stock: 10 },
      { color: "White", size: "L", price: 262, stock: 40 }
    ]
  },
  { 
    _id: "65f010000000000000000005",
    name: "Linen Atelier Dress",
    slug: "linen-atelier-dress",
    price: 225,
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80"],
    variants: [
      { color: "Beige", size: "S", price: 225, stock: 20 },
      { color: "Beige", size: "M", price: 225, stock: 30 }
    ]
  },
  { 
    _id: "65f010000000000000000006",
    name: "Onyx Kitten Mules",
    slug: "onyx-kitten-mules",
    price: 178,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80"],
    variants: [
      { color: "Black", size: "7", price: 178, stock: 20 },
      { color: "Black", size: "8", price: 178, stock: 30 }
    ]
  },
  { 
    _id: "65f010000000000000000007",
    name: "Graphite Merino Coat",
    slug: "graphite-merino-coat",
    price: 680,
    images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&q=80"],
    variants: [
      { color: "Grey", size: "M", price: 680, stock: 15 },
      { color: "Grey", size: "L", price: 680, stock: 35 }
    ]
  },
  { 
    _id: "65f010000000000000000008",
    name: "18K Gold Sculptured Cuff",
    slug: "18k-gold-sculptured-cuff",
    price: 295,
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80"],
    variants: [
      { color: "Gold", size: "One Size", price: 295, stock: 50 }
    ]
  },
  { 
    _id: "65f010000000000000000009",
    name: "Satin Bias-Cut Skirt",
    slug: "satin-bias-cut-skirt",
    price: 195,
    compareAtPrice: 280,
    badge: "Sale",
    images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80"],
    variants: [
      { color: "Pink", size: "S", price: 195, stock: 25 },
      { color: "Pink", size: "M", price: 195, stock: 25 }
    ]
  },
  { 
    _id: "65f010000000000000000010",
    name: "Ivory Silk Blouse",
    slug: "ivory-silk-blouse",
    price: 165,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=500&q=80"],
    variants: [
      { color: "Ivory", size: "S", price: 165, stock: 25 },
      { color: "Ivory", size: "M", price: 165, stock: 25 }
    ]
  },
  { 
    _id: "65f010000000000000000011",
    name: "Pointed Leather Boots",
    slug: "pointed-leather-boots",
    price: 420,
    badge: "Bestseller",
    images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80"],
    variants: [
      { color: "Black", size: "7", price: 420, stock: 20 },
      { color: "Black", size: "8", price: 420, stock: 30 }
    ]
  },
  { 
    _id: "65f010000000000000000012",
    name: "Baroque Silk Scarf",
    slug: "baroque-silk-scarf",
    price: 145,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80"],
    variants: [
      { color: "Multicolor", size: "One Size", price: 145, stock: 50 }
    ]
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const ids = productsToInsert.map(p => p._id);
    await Product.deleteMany({ _id: { $in: ids } });
    await Product.insertMany(productsToInsert);
    console.log("Seeded 12 products successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
