// seedCategories.ts (or .js)
// Assumption: DB is already connected in app.js
import Category from "../models/categoryModel.js"; // change path

const ROOTS = ["Beauty & Cosmetics", "General Store", "Gift Center"] as const;

const TREE: Record<(typeof ROOTS)[number], { name: string; children: string[] }[]> = {
  "Beauty & Cosmetics": [
    { name: "Skin Care", children: ["Face Wash", "Moisturizer", "Face Serum", "Sunscreen", "Toner", "Face Mask", "Face Scrub"] },
    { name: "Hair Care", children: ["Shampoo", "Conditioner", "Hair Oil", "Hair Mask", "Hair Serum", "Hair Color", "Hair Styling"] },
    { name: "Bath & Body", children: ["Body Wash", "Soap", "Body Lotion", "Hand Wash", "Body Scrub", "Deodorant", "Body Mist"] },
    { name: "Makeup - Face", children: ["Foundation", "Compact", "Concealer", "Blush", "Highlighter", "Bronzer", "Primer", "Setting Spray"] },
    { name: "Makeup - Eyes", children: ["Kajal", "Eyeliner", "Mascara", "Eyeshadow", "Brow Pencil", "Brow Gel", "False Lashes"] },
    { name: "Makeup - Lips", children: ["Lipstick", "Liquid Lipstick", "Lip Gloss", "Lip Tint", "Lip Liner", "Lip Balm"] },
    { name: "Makeup - Nails", children: ["Nail Polish", "Nail Remover", "Nail Care"] },
    { name: "Fragrance", children: ["Perfume", "Deodorant Spray", "Roll On"] },
    { name: "Men's Grooming", children: ["Shaving", "Beard Care", "Grooming Kits", "Men Face Wash"] },
    { name: "Tools & Accessories", children: ["Brushes", "Combs", "Trimmers", "Straighteners"] },
  ],
  "General Store": [
    { name: "Groceries & Staples", children: ["Rice", "Atta & Flour", "Dals & Pulses", "Edible Oils & Ghee", "Masalas & Spices", "Salt, Sugar & Jaggery"] },
    { name: "Beverages", children: ["Tea", "Coffee", "Juices", "Soft Drinks", "Health Drinks"] },
    { name: "Snacks & Branded Foods", children: ["Namkeen", "Biscuits", "Chips", "Noodles & Pasta", "Sauces & Spreads", "Breakfast Cereals"] },
    { name: "Dairy & Bakery", children: ["Milk", "Curd", "Butter & Cheese", "Bread & Buns", "Eggs"] },
    { name: "Home Cleaning", children: ["Floor Cleaner", "Toilet Cleaner", "Dish Wash", "Detergent", "Fabric Softener", "Air Freshener"] },
    { name: "Paper & Disposables", children: ["Tissue", "Napkin", "Aluminium Foil", "Cling Wrap", "Disposable Plates", "Disposable Cups"] },
    { name: "Stationery", children: ["Notebook", "Pen", "Pencil", "Marker", "Files & Folders", "School Kit"] },
    { name: "Pooja Items", children: ["Agarbatti", "Diya", "Camphor", "Kumkum", "Roli", "Pooja Thali"] },
    { name: "Baby Care", children: ["Diapers", "Baby Wipes", "Baby Shampoo", "Baby Lotion"] },
    { name: "Pet Care", children: ["Dog Food", "Cat Food", "Pet Shampoo", "Pet Treats"] },
  ],
  "Gift Center": [
    { name: "Flowers & Plants", children: ["Flower Bouquets", "Roses", "Indoor Plants", "Designer Pots"] },
    { name: "Cakes & Desserts", children: ["Cakes", "Pastries", "Cupcakes"] },
    { name: "Chocolates & Sweets", children: ["Chocolate Boxes", "Chocolate Combos", "Indian Sweets"] },
    { name: "Soft Toys", children: ["Teddy Bears", "Soft Toys"] },
    { name: "Hampers", children: ["Dry Fruit Hampers", "Chocolate Hampers", "Festive Hampers"] },
    { name: "Personalized Gifts", children: ["Mugs", "Cushions", "Photo Frames", "LED Lamps"] },
    { name: "Decor & Surprises", children: ["Scented Candles", "String Lights", "Showpieces", "Greeting Cards"] },
  ],
};

async function upsertCat(args: {
  name: string;
  parent: any | null;
  level: 0 | 1 | 2;
  path: any[];
}) {
  const name = args.name.trim();
  return Category.findOneAndUpdate(
    { name, parent: args.parent ?? null, level: args.level },
    {
      $set: { isActive: true, path: args.path },
      $setOnInsert: { name, parent: args.parent ?? null, level: args.level },
    },
    { upsert: true, new: true, collation: { locale: "en", strength: 2 } }
  );
}

/**
 * Two-phase seeding:
 * 1) Seed ONLY 3 roots (level 0)
 * 2) Seed rest tree (level 1 & 2) under those roots
 * Safe to run multiple times (idempotent).
 */
export async function seedCategoriesTwoPhase() {
  // ---------- Phase 1: roots ----------
  const rootMap = new Map<string, any>();
  for (const r of ROOTS) {
    const doc = await upsertCat({ name: r, parent: null, level: 0, path: [] });
    rootMap.set(r, doc);
  }

  // ---------- Phase 2: tree ----------
  for (const r of ROOTS) {
    const rootDoc = rootMap.get(r);
    const subs = TREE[r] || [];

    for (const sub of subs) {
      const subDoc = await upsertCat({
        name: sub.name,
        parent: rootDoc._id,
        level: 1,
        path: [rootDoc._id],
      });

      for (const leaf of sub.children) {
        await upsertCat({
          name: leaf,
          parent: subDoc._id,
          level: 2,
          path: [rootDoc._id, subDoc._id],
        });
      }
    }
  }
}
