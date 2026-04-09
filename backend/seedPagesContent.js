require("dotenv").config();
const mongoose = require("mongoose");
const Page = require("./models/Page");
const connectDB = require("./config/db");

const pagesToSeed = [
  {
    title: "Sizing Guide",
    slug: "sizing-guide",
    content: `<h3>Understanding Our Sizes</h3>
<p>We use standard sizing. Please refer to the chart below to find your perfect fit. All measurements are in inches.</p>
<table border="1" cellpadding="8" style="width:100%; text-align:left; border-collapse:collapse; border-color:#e2e8f0; margin-top: 15px;">
  <thead>
    <tr style="background:#f8fafc">
      <th>Size</th><th>Bust</th><th>Waist</th><th>Hips</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><b>XS</b></td><td>32-33"</td><td>24-25"</td><td>34-35"</td></tr>
    <tr><td><b>S</b></td><td>34-35"</td><td>26-27"</td><td>36-37"</td></tr>
    <tr><td><b>M</b></td><td>36-37"</td><td>28-29"</td><td>38-39"</td></tr>
    <tr><td><b>L</b></td><td>38.5-40"</td><td>30.5-32"</td><td>40.5-42"</td></tr>
    <tr><td><b>XL</b></td><td>41.5-43"</td><td>33.5-35"</td><td>43.5-45"</td></tr>
  </tbody>
</table>`
  },
  {
    title: "Returns & Exchanges",
    slug: "returns",
    content: `<h3>30-Day Return Policy</h3>
<p>If you are not entirely satisfied with your purchase, we're here to help.</p>
<ul>
  <li>Items must be returned within 30 days of receipt.</li>
  <li>Items must be unworn, unwashed, and have original tags attached.</li>
  <li>Sale items are considered final sale and cannot be returned.</li>
</ul>
<h3>How to Return</h3>
<p>Contact our support team at <strong>support@khalidsanawer.online</strong> with your order number to initiate the return process and receive your prepaid label.</p>`
  },
  {
    title: "Shipping Information",
    slug: "shipping",
    content: `<h3>Domestic Shipping</h3>
<p><b>Standard Shipping</b> (3-5 business days): $5.00 (Free over $150).</p>
<p><b>Express Shipping</b> (1-2 business days): $15.00.</p>
<br/>
<h3>International Shipping</h3>
<p>We currently ship to over 50 countries globally. Shipping rates are calculated at checkout based on destination and package weight.</p>
<p><em>Note: Customs and import duties may apply to international orders and are the responsibility of the customer.</em></p>`
  },
  {
    title: "Our Story",
    slug: "our-story",
    content: `<h3>Maison Luxe</h3>
<p>Founded in 2026, Maison Luxe was created with a specific vision: to provide timeless, elegant, and high-quality fashion to everyone.</p>
<p>We believe in craftsmanship, ethical production, and meticulous attention to detail. Every piece in our collection is designed to empower, inspire, and elevate your everyday wardrobe.</p>
<p>We aren't just making clothes; we're crafting the future of accessible luxury.</p>`
  },
  {
    title: "Sustainability",
    slug: "sustainability",
    content: `<h3>Our Commitment to the Planet</h3>
<p>Fashion shouldn't cost the Earth. We are deeply committed to sustainable and ethical practices:</p>
<ul>
  <li><b>Eco-Friendly Materials:</b> Using 100% organic cotton and recycled materials where possible.</li>
  <li><b>Ethical Supply Chain:</b> Ensuring fair wages and safe working conditions across all our factories.</li>
  <li><b>Less Waste:</b> Minimizing packaging waste and exclusively using biodegradable mailers.</li>
</ul>
<p>We are constantly looking for ways to reduce our carbon footprint.</p>`
  },
  {
    title: "Press",
    slug: "press",
    content: `<h3>Press & Media Inquiries</h3>
<p>For all press, media, and PR inquiries, please email our communications team at <strong>pr@khalidsanawer.online</strong>.</p>
<br/>
<p><i>Check out our latest features in Vogue, GQ, and Hypebeast! Media kits and high-res brand assets are available upon request.</i></p>`
  },
  {
    title: "Careers",
    slug: "careers",
    content: `<h3>Join the Maison Team</h3>
<p>We are always looking for passionate, creative, and driven individuals to join us.</p>
<br/>
<b>Current Openings:</b>
<ul>
  <li>Senior Frontend Engineer (Remote)</li>
  <li>Marketing Coordinator (London)</li>
  <li>Store Manager (New York)</li>
</ul>
<p>If you don't see a perfect fit but believe you'd be a great addition to the team, email your resume to <strong>careers@khalidsanawer.online</strong>.</p>`
  },
  {
    title: "Stockists",
    slug: "stockists",
    content: `<h3>Find Us In-Store</h3>
<p>Experience Maison in person at our flagship locations and trusted retail partners.</p>
<br/>
<b>Flagship Stores:</b>
<ul>
  <li><b>London:</b> 15 Oxford Street, W1D 2BA</li>
  <li><b>New York:</b> 100 5th Ave, NY 10011</li>
  <li><b>Dubai:</b> The Dubai Mall, Fashion Avenue</li>
</ul>`
  },
  {
    title: "Gift Cards",
    slug: "gift-cards",
    content: `<h3>The Perfect Gift</h3>
<p>Not sure what to get them? Give the gift of choice with a Maison digital gift card.</p>
<p>Gift cards are delivered securely by email and contain simple instructions to redeem them at checkout. Our gift cards have no additional processing fees and never expire.</p>`
  },
  {
    title: "Contact Us",
    slug: "contact",
    content: `<h3>Get In Touch</h3>
<p>Our dedicated customer service team is available Monday to Friday, 9:00 AM - 6:00 PM (EST).</p>
<br/>
<p><b>Email:</b> support@khalidsanawer.online</p>
<p><b>Phone:</b> +1 (800) 123-4567</p>
<br/>
<p>We aim to respond to all inquiries within 24 hours.</p>`
  }
];

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");
    
    for (const page of pagesToSeed) {
      await Page.findOneAndUpdate(
        { slug: page.slug },
        page,
        { upsert: true, new: true }
      );
      console.log(`Seeded or Updated Page: ${page.title} (/page/${page.slug})`);
    }
    
    console.log("? All Store Policy/Information pages seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding pages:", err.message);
    process.exit(1);
  }
};

seed();
