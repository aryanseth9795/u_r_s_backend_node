import mongoose, { Schema, HydratedDocument, Types } from "mongoose";

export enum ProductCategory {
  BEAUTY = "beauty",
  COSMETICS = "cosmetics",
  GENERAL_STORE = "general_store",
  GIFTS = "gifts",
}

export enum ProductSubCategory {
  // BEAUTY
  BEAUTY_SKINCARE = "beauty_skincare",
  BEAUTY_HAIRCARE = "beauty_haircare",
  BEAUTY_BATH_BODY = "beauty_bath_body",
  BEAUTY_FRAGRANCES = "beauty_fragrances",
  BEAUTY_MEN_GROOMING = "beauty_men_grooming",
  BEAUTY_TOOLS_ACCESSORIES = "beauty_tools_accessories",

  // COSMETICS
  COSMETICS_FACE = "cosmetics_face",
  COSMETICS_EYES = "cosmetics_eyes",
  COSMETICS_LIPS = "cosmetics_lips",
  COSMETICS_NAILS = "cosmetics_nails",
  COSMETICS_KITS_COMBOS = "cosmetics_kits_combos",

  // GENERAL STORE
  GENERAL_GROCERIES = "general_groceries",
  GENERAL_HOUSEHOLD_SUPPLIES = "general_household_supplies",
  GENERAL_HOME_CLEANING = "general_home_cleaning",
  GENERAL_PAPER_DISPOSABLES = "general_paper_disposables",
  GENERAL_POOJA_ITEMS = "general_pooja_items",
  GENERAL_STATIONERY = "general_stationery",
  GENERAL_PET_CARE = "general_pet_care",
  GENERAL_BABY_CARE = "general_baby_care",
  GENERAL_SNACKS_BEVERAGES = "general_snacks_beverages",
  GENERAL_DAIRY_BAKERY = "general_dairy_bakery",

  // GIFTS
  GIFTS_SOFT_TOYS = "gifts_soft_toys",
  GIFTS_CHOCOLATES_SWEETS = "gifts_chocolates_sweets",
  GIFTS_FLOWERS_PLANTS = "gifts_flowers_plants",
  GIFTS_DECOR_SHOWPIECES = "gifts_decor_showpieces",
  GIFTS_GREETING_CARDS = "gifts_greeting_cards",
  GIFTS_MUGS_BOTTLES = "gifts_mugs_bottles",
  GIFTS_PHOTO_FRAMES = "gifts_photo_frames",
  GIFTS_HAMPERS = "gifts_hampers",
  GIFTS_FESTIVE_GIFTS = "gifts_festive_gifts",
}

export enum ProductSubSubCategory {
  // SKINCARE
  FACE_WASH = "face_wash",
  MOISTURIZER = "moisturizer",
  FACE_SERUM = "face_serum",
  SUNSCREEN = "sunscreen",
  FACE_TONER = "face_toner",
  FACE_MASK = "face_mask",
  FACE_SCRUB = "face_scrub",

  // HAIRCARE
  SHAMPOO = "shampoo",
  CONDITIONER = "conditioner",
  HAIR_OIL = "hair_oil",
  HAIR_MASK = "hair_mask",
  HAIR_SERUM = "hair_serum",
  HAIR_COLOR = "hair_color",
  HAIR_STYLING = "hair_styling",

  // BATH & BODY
  BODY_WASH = "body_wash",
  SOAP = "soap",
  BODY_LOTION = "body_lotion",
  HAND_WASH = "hand_wash",
  BODY_SCRUB = "body_scrub",
  DEODORANT = "deodorant",
  PERFUME = "perfume",
  MIST = "mist",

  // COSMETICS – FACE
  FOUNDATION = "foundation",
  COMPACT = "compact",
  CONCEALER = "concealer",
  BLUSH = "blush",
  HIGHLIGHTER = "highlighter",
  BRONZER = "bronzer",
  PRIMER = "primer",
  SETTING_SPRAY = "setting_spray",

  // COSMETICS – EYES
  KAJAL = "kajal",
  EYELINER = "eyeliner",
  MASCARA = "mascara",
  EYESHADOW = "eyeshadow",
  BROW_PENCIL = "brow_pencil",
  BROW_GEL = "brow_gel",
  FALSE_LASHES = "false_lashes",

  // COSMETICS – LIPS
  LIPSTICK = "lipstick",
  LIQUID_LIPSTICK = "liquid_lipstick",
  LIP_GLOSS = "lip_gloss",
  LIP_TINT = "lip_tint",
  LIP_LINER = "lip_liner",
  LIP_BALM = "lip_balm",

  // COSMETICS – NAILS
  NAIL_POLISH = "nail_polish",
  NAIL_REMOVER = "nail_remover",
  NAIL_CARE = "nail_care",

  // MEN GROOMING
  SHAVING_FOAM = "shaving_foam",
  RAZOR = "razor",
  AFTERSHAVE = "aftershave",
  BEARD_OIL = "beard_oil",
  MEN_FACE_WASH = "men_face_wash",
  MEN_DEO = "men_deo",

  // GROCERY – STAPLES
  RICE = "rice",
  ATTA = "atta",
  FLOUR = "flour",
  PULSES = "pulses",
  OILS = "oils",
  GHEE = "ghee",
  SPICES = "spices",
  SALT = "salt",
  SUGAR_JAGGERY = "sugar_jaggery",

  // GROCERY – SNACKS & BEVERAGES
  NAMKEEN = "namkeen",
  BISCUITS = "biscuits",
  CHIPS = "chips",
  SOFT_DRINKS = "soft_drinks",
  JUICES = "juices",
  TEA = "tea",
  COFFEE = "coffee",
  NOODLES = "noodles",
  PASTA = "pasta",
  SAUCES = "sauces",
  SPREADS = "spreads",
  CEREALS = "cereals",

  // HOUSEHOLD / CLEANING
  FLOOR_CLEANER = "floor_cleaner",
  TOILET_CLEANER = "toilet_cleaner",
  DISH_WASH = "dish_wash",
  DETERGENT = "detergent",
  FABRIC_SOFTENER = "fabric_softener",
  ROOM_FRESHENER = "room_freshener",
  GARBAGE_BAG = "garbage_bag",

  // PAPER / DISPOSABLE
  TISSUE = "tissue",
  NAPKIN = "napkin",
  ALUMINIUM_FOIL = "aluminium_foil",
  CLING_WRAP = "cling_wrap",
  DISPOSABLE_PLATE = "disposable_plate",
  DISPOSABLE_CUP = "disposable_cup",

  // STATIONERY
  NOTEBOOK = "notebook",
  PEN = "pen",
  PENCIL = "pencil",
  MARKER = "marker",
  FILE_FOLDER = "file_folder",
  SCHOOL_KIT = "school_kit",

  // POOJA ITEMS
  AGARBATTI = "agarbatti",
  DIYA = "diya",
  CAMPHOR = "camphor",
  KUMKUM = "kumkum",
  ROLI = "roli",
  POOJA_THALI = "pooja_thali",

  // GIFTS
  TEDDY_BEAR = "teddy_bear",
  SOFT_TOY = "soft_toy",
  CHOCOLATE_BOX = "chocolate_box",
  DRY_FRUIT_BOX = "dry_fruit_box",
  GIFT_HAMPER = "gift_hamper",
  FESTIVE_HAMPER = "festive_hamper",
  SCENTED_CANDLE = "scented_candle",
  STRING_LIGHTS = "string_lights",
  PHOTO_FRAME = "photo_frame",
  GREETING_CARD = "greeting_card",
  CUSTOM_MUG = "custom_mug",
  CUSTOM_CUSHION = "custom_cushion",
  SHOWPIECE = "showpiece",
}

interface IDeliveryOption {
  isCancel: boolean;
  isReturnable: boolean;
  isWarranty: boolean;
}

interface IImage {
  publicId: string;
  url: string;
  secureUrl: string;
  folder?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

interface IPriceTier {
  minQuantity: number;
  price: number;
  discount: number;
}

/** measurement per variant (size/weight/shade/etc.) */
interface IVariantMeasurement {
  value?: number;
  unit?: string;
  label?: string;
}

interface IVariant {
  _id: Types.ObjectId;
  packOf: number;
  measurement?: IVariantMeasurement;
  mrp: number;
  sellingPrices: IPriceTier[];
  images: IImage[];
  isActive: boolean;
  stock: number;

  // NEW: optional expiry per variant
  expiry?: Date | null;
}

export interface IProduct {
  name: string;
  slug: string;
  brand: String;
  categoryId: Types.ObjectId;
  tags: string[];
  description?: string;
  deliveryOption: IDeliveryOption;
  thumbnail: IImage;
  variants: IVariant[];
  isActive: boolean;
}

export type ProductDocument = HydratedDocument<IProduct>;

// ----- sub-schemas -----

const ImageSchema = new Schema<IImage>(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    folder: { type: String },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
  },
  { _id: false }
);

const PriceTierSchema = new Schema<IPriceTier>(
  {
    minQuantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const VariantMeasurementSchema = new Schema<IVariantMeasurement>(
  {
    value: { type: Number, min: 0 },
    unit: { type: String, trim: true },
    label: { type: String, trim: true },
  },
  { _id: false }
);

const VariantSchema = new Schema<IVariant>(
  {
    packOf: { type: Number, required: true, min: 1 },

    measurement: {
      type: VariantMeasurementSchema,
      default: undefined,
    },

    // NEW: optional expiry date
    expiry: { type: Date, default: null },

    mrp: { type: Number, required: true, min: 0 },
    sellingPrices: {
      type: [PriceTierSchema],
      required: true,
      validate: (v: IPriceTier[]) => v.length > 0,
    },
    images: { type: [ImageSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    stock: { type: Number, default: 0, min: 0, index: true },
  },
  { _id: true }
);

const DeliveryOptionSchema = new Schema<IDeliveryOption>(
  {
    isCancel: { type: Boolean, default: false },
    isReturnable: { type: Boolean, default: false },
    isWarranty: { type: Boolean, default: false },
  },
  { _id: false }
);

// ----- main schema -----

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, index: true },
    // category: {
    //   type: String,
    //   enum: Object.values(ProductCategory),
    //   required: true,
    //   index: true,
    // },
    // subCategory: {
    //   type: String,
    //   enum: Object.values(ProductSubCategory),
    //   index: true,
    // },
    // subSubCategory: {
    //   type: String,
    //   enum: Object.values(ProductSubSubCategory),
    //   index: true,
    // },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    tags: { type: [String], default: [], index: true },
    description: { type: String },

    deliveryOption: { type: DeliveryOptionSchema, required: true },

    thumbnail: { type: ImageSchema, required: true },

    variants: {
      type: [VariantSchema],
      default: [],
      validate: (v: IVariant[]) => v.length > 0,
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// ----- indexes -----

ProductSchema.index(
  {
    category: 1,
    subCategory: 1,
    subSubCategory: 1,
    isActive: 1,
    "variants.isActive": 1,
    "variants.stock": -1,
  },
  { name: "category_tree_variant_stock_idx" }
);

ProductSchema.index({ tags: 1, isActive: 1 }, { name: "tags_active_idx" });

ProductSchema.index(
  { name: "text", description: "text", tags: "text" },
  {
    name: "product_text_search_idx",
    weights: { name: 5, tags: 3, description: 1 },
    default_language: "english",
  }
);

ProductSchema.index(
  { "variants.sellingPrices.price": 1 },
  { name: "variant_price_idx" }
);

ProductSchema.index(
  {
    "variants.measurement.unit": 1,
    "variants.measurement.value": 1,
    isActive: 1,
  },
  { name: "variant_measurement_idx" }
);

// NEW: index to query by variant expiry
ProductSchema.index(
  { "variants.expiry": 1, isActive: 1 },
  { name: "variant_expiry_idx" }
);

// basic validation
ProductSchema.pre("save", function (next) {
  const doc = this as ProductDocument;
  if (!doc.variants || doc.variants.length === 0) {
    return next(new Error("At least one variant is required"));
  }
  next();
});

const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
