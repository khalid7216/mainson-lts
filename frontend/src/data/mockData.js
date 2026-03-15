// frontend/src/data/mockData.js
// ═════════════════════════════════════════════════════════════
//  UPDATED: Added slug field to all products for SEO
// ═════════════════════════════════════════════════════════════

export const PRODUCTS = [
  { 
    id: "65f010000000000000000001",
    name: "Obsidian Slip Dress",
    slug: "obsidian-slip-dress",  // ✅ ADDED
    price: 289,
    orig: 389,
    cat: "Dresses",
    badge: "New",
    rating: 4.8,
    reviews: 42,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80"
  },
  { 
    id: "65f010000000000000000002",
    name: "Midnight Tailored Blazer",
    slug: "midnight-tailored-blazer",  // ✅ ADDED
    price: 445,
    orig: null,
    cat: "Outerwear",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"
  },
  { 
    id: "65f010000000000000000003",
    name: "Cashmere Veil Turtleneck",
    slug: "cashmere-veil-turtleneck",  // ✅ ADDED
    price: 198,
    orig: null,
    cat: "Tops",
    badge: "",
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80"
  },
  { 
    id: "65f010000000000000000004",
    name: "Palazzo Wide-Leg Trousers",
    slug: "palazzo-wide-leg-trousers",  // ✅ ADDED
    price: 262,
    orig: 312,
    cat: "Bottoms",
    badge: "Sale",
    rating: 4.6,
    reviews: 33,
    image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&q=80"
  },
  { 
    id: "65f010000000000000000005",
    name: "Linen Atelier Dress",
    slug: "linen-atelier-dress",  // ✅ ADDED
    price: 225,
    orig: null,
    cat: "Dresses",
    badge: "",
    rating: 4.5,
    reviews: 29,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80"
  },
  { 
    id: "65f010000000000000000006",
    name: "Onyx Kitten Mules",
    slug: "onyx-kitten-mules",  // ✅ ADDED
    price: 178,
    orig: null,
    cat: "Shoes",
    badge: "New",
    rating: 4.8,
    reviews: 61,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80"
  },
  { 
    id: "65f010000000000000000007",
    name: "Graphite Merino Coat",
    slug: "graphite-merino-coat",  // ✅ ADDED
    price: 680,
    orig: null,
    cat: "Outerwear",
    badge: "",
    rating: 4.9,
    reviews: 44,
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&q=80"
  },
  { 
    id: "65f010000000000000000008",
    name: "18K Gold Sculptured Cuff",
    slug: "18k-gold-sculptured-cuff",  // ✅ ADDED
    price: 295,
    orig: null,
    cat: "Accessories",
    badge: "",
    rating: 4.4,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80"
  },
  { 
    id: "65f010000000000000000009",
    name: "Satin Bias-Cut Skirt",
    slug: "satin-bias-cut-skirt",  // ✅ ADDED
    price: 195,
    orig: 280,
    cat: "Bottoms",
    badge: "Sale",
    rating: 4.6,
    reviews: 37,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80"
  },
  { 
    id: "65f010000000000000000010",
    name: "Ivory Silk Blouse",
    slug: "ivory-silk-blouse",  // ✅ ADDED
    price: 165,
    orig: null,
    cat: "Tops",
    badge: "New",
    rating: 4.7,
    reviews: 51,
    image: "https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=500&q=80"
  },
  { 
    id: "65f010000000000000000011",
    name: "Pointed Leather Boots",
    slug: "pointed-leather-boots",  // ✅ ADDED
    price: 420,
    orig: null,
    cat: "Shoes",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80"
  },
  { 
    id: "65f010000000000000000012",
    name: "Baroque Silk Scarf",
    slug: "baroque-silk-scarf",  // ✅ ADDED
    price: 145,
    orig: null,
    cat: "Accessories",
    badge: "New",
    rating: 4.5,
    reviews: 28,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80"
  },
];

export const ORDERS = [
  { id: "#ME-8821", customer: "Valentina Cruz",  date: "Feb 15, 2026", total: 734,  status: "Delivered",  items: 3, avatar: "V" },
  { id: "#ME-8820", customer: "Sofia Marchetti", date: "Feb 14, 2026", total: 289,  status: "Shipped",    items: 1, avatar: "S" },
  { id: "#ME-8819", customer: "Anya Petrova",    date: "Feb 13, 2026", total: 1125, status: "Processing", items: 4, avatar: "A" },
  { id: "#ME-8818", customer: "Mei Lin Zhang",   date: "Feb 12, 2026", total: 445,  status: "Delivered",  items: 2, avatar: "M" },
  { id: "#ME-8817", customer: "Isabelle Moreau", date: "Feb 11, 2026", total: 273,  status: "Cancelled",  items: 1, avatar: "I" },
  { id: "#ME-8816", customer: "Emma Laurent",    date: "Feb 10, 2026", total: 892,  status: "Delivered",  items: 3, avatar: "E" },
];

export const CUSTOMERS = [
  { id: 1, name: "Valentina Cruz",  email: "v.cruz@email.com",   joined: "Jan 2026", orders: 8,  spent: 2340, tier: "VIP" },
  { id: 2, name: "Sofia Marchetti", email: "sofia@email.com",    joined: "Dec 2025", orders: 3,  spent: 890,  tier: "Active" },
  { id: 3, name: "Anya Petrova",    email: "anya.p@email.com",   joined: "Nov 2025", orders: 12, spent: 5670, tier: "Elite" },
  { id: 4, name: "Mei Lin Zhang",   email: "mei.z@email.com",    joined: "Feb 2026", orders: 1,  spent: 445,  tier: "New" },
  { id: 5, name: "Isabelle Moreau", email: "i.moreau@email.com", joined: "Oct 2025", orders: 6,  spent: 1840, tier: "Active" },
];

export const REV_DATA   = [28400, 34200, 39800, 53300, 47100, 48290];
export const REV_LABELS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

export const NAV_CATEGORIES = ["All", "Dresses", "Outerwear", "Tops", "Bottoms", "Shoes", "Accessories"];