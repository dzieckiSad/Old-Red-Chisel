// Shop catalogue types and the sample products. Products are managed in the admin panel and
// stored in the database (src/lib/products.ts); the samples below seed an empty database and
// are shown as-is when no database is connected. Safe to import from client components.

/**
 * How a product is bought:
 * - in_stock: finished piece, ships from the workshop
 * - made_to_order: built after purchase, options change the price
 * - quote_only: no fixed price, the customer requests a quote
 */
export type ProductMode = "in_stock" | "made_to_order" | "quote_only";

export type OptionChoice = { label: string; priceDelta: number };
export type ProductOption = { name: string; choices: OptionChoice[] };

export type ProductImage = { url: string; alt?: string };

export type Product = {
  id?: string;
  slug: string;
  name: string;
  category: CategorySlug;
  mode: ProductMode;
  price: number; // base price in EUR incl. VAT; "from" price for quote_only
  /** Promotion: reduced base price, optionally until saleEndsAt (YYYY-MM-DD, inclusive). */
  salePrice?: number | null;
  saleEndsAt?: string | null;
  summary: string;
  description: string;
  dimensions: string;
  material: string;
  leadTime: string;
  stock?: number | null;
  options?: ProductOption[];
  images?: ProductImage[];
  featured?: boolean;
  hidden?: boolean;
  sortOrder?: number;
};

export const categories = [
  { slug: "bedside-lockers", name: "Bedside lockers" },
  { slug: "home-bars", name: "Home bars" },
  { slug: "cabinets-sideboards", name: "Cabinets & sideboards" },
  { slug: "tv-units", name: "TV units" },
  { slug: "shelving-storage", name: "Shelving & storage" },
  { slug: "small-pieces", name: "Small pieces" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

const woodOptions: ProductOption = {
  name: "Timber",
  choices: [
    { label: "Solid oak", priceDelta: 0 },
    { label: "Solid ash", priceDelta: -20 },
    { label: "Solid walnut", priceDelta: 120 },
  ],
};

const finishOptions: ProductOption = {
  name: "Finish",
  choices: [
    { label: "Natural oil", priceDelta: 0 },
    { label: "Dark stain", priceDelta: 15 },
    { label: "Painted (any colour)", priceDelta: 40 },
  ],
};

export const sampleProducts: Product[] = [
  {
    slug: "shannon-bedside-locker",
    name: "Shannon Bedside Locker",
    category: "bedside-lockers",
    mode: "in_stock",
    price: 245,
    summary: "Solid oak locker with one soft-close drawer and an open shelf.",
    description:
      "A compact bedside locker made in our Athlone workshop from solid oak, with dovetailed drawer joints and a hard-wearing oil finish.",
    dimensions: "W 45 × D 38 × H 55 cm",
    material: "Solid oak, natural oil",
    leadTime: "Ready to ship in 2–5 working days",
    stock: 4,
    featured: true,
  },
  {
    slug: "lough-ree-bedside-locker",
    name: "Lough Ree Bedside Locker",
    category: "bedside-lockers",
    mode: "made_to_order",
    price: 295,
    summary: "Two-drawer locker built to order in your choice of timber and finish.",
    description:
      "Two deep drawers on soft-close runners, a solid top and tapered legs. Built to order in the timber and finish you choose.",
    dimensions: "W 50 × D 40 × H 60 cm",
    material: "Solid hardwood",
    leadTime: "Made to order in 3–4 weeks",
    options: [woodOptions, finishOptions],
  },
  {
    slug: "midlands-home-bar",
    name: "Midlands Home Bar",
    category: "home-bars",
    mode: "made_to_order",
    price: 1450,
    summary: "Freestanding home bar with a solid top, bottle storage and glass rack.",
    description:
      "A freestanding bar for a kitchen, living room or garden room: solid hardwood top, bottle storage, glass rack and an adjustable shelf behind.",
    dimensions: "W 150 × D 60 × H 105 cm",
    material: "Solid hardwood with oak-veneered panels",
    leadTime: "Made to order in 4–6 weeks",
    options: [
      {
        name: "Length",
        choices: [
          { label: "150 cm", priceDelta: 0 },
          { label: "180 cm", priceDelta: 220 },
          { label: "210 cm", priceDelta: 420 },
        ],
      },
      woodOptions,
      finishOptions,
    ],
    featured: true,
  },
  {
    slug: "bespoke-bar",
    name: "Bespoke Bar or Corner Bar",
    category: "home-bars",
    mode: "quote_only",
    price: 2400,
    summary: "Built-in or corner bar designed around your room, fridge and sink.",
    description:
      "For an L-shaped, corner or built-in bar with a fridge, sink or lighting we design and build it around your space. Send us a photo and rough sizes for a quote.",
    dimensions: "Built to your measurements",
    material: "Your choice",
    leadTime: "Quoted per project",
  },
  {
    slug: "athlone-sideboard",
    name: "Athlone Sideboard",
    category: "cabinets-sideboards",
    mode: "made_to_order",
    price: 1150,
    summary: "Three-door sideboard with adjustable shelves and a solid top.",
    description:
      "A long, low sideboard for a dining or living room with three doors, adjustable shelves and a solid top.",
    dimensions: "W 160 × D 45 × H 80 cm",
    material: "Solid hardwood",
    leadTime: "Made to order in 4–5 weeks",
    options: [woodOptions, finishOptions],
    featured: true,
  },
  {
    slug: "hall-cabinet",
    name: "Hall Shoe Cabinet",
    category: "cabinets-sideboards",
    mode: "in_stock",
    price: 520,
    summary: "Slim hallway cabinet with tilt-out shoe storage and a top drawer.",
    description:
      "A slim cabinet for narrow hallways with two tilt-out shoe compartments and a drawer for keys and post.",
    dimensions: "W 80 × D 25 × H 100 cm",
    material: "Painted hardwood frame, oak top",
    leadTime: "Ready to ship in 2–5 working days",
    stock: 2,
  },
  {
    slug: "media-unit",
    name: "Low Media Unit",
    category: "tv-units",
    mode: "made_to_order",
    price: 890,
    summary: "Low TV unit with cable management and push-to-open doors.",
    description:
      "A low TV unit with hidden cable management, ventilated back panels and push-to-open doors.",
    dimensions: "W 180 × D 42 × H 50 cm",
    material: "Solid hardwood",
    leadTime: "Made to order in 3–5 weeks",
    options: [woodOptions, finishOptions],
  },
  {
    slug: "floating-shelves",
    name: "Floating Shelf Set",
    category: "shelving-storage",
    mode: "in_stock",
    price: 129,
    summary: "Set of two solid oak floating shelves with hidden brackets.",
    description: "Two solid oak shelves with concealed steel brackets, ready to fix to a solid wall.",
    dimensions: "W 90 × D 22 × H 4 cm (each)",
    material: "Solid oak, natural oil",
    leadTime: "Ready to ship in 2–5 working days",
    stock: 10,
    featured: true,
  },
  {
    slug: "oak-chopping-board",
    name: "Oak Chopping Board",
    category: "small-pieces",
    mode: "in_stock",
    price: 55,
    summary: "End-grain oak board, oiled and ready to use.",
    description: "A heavy end-grain board made from workshop offcuts, finished with food-safe oil.",
    dimensions: "40 × 28 × 4 cm",
    material: "Oak end grain, food-safe oil",
    leadTime: "Ready to ship in 2–5 working days",
    stock: 12,
  },
];

/** Products with a drawn example image (src/assets/products/<slug>.jpg, mapped in product-photo.tsx). */
const exampleImageSlugs = new Set([
  "shannon-bedside-locker",
  "lough-ree-bedside-locker",
  "midlands-home-bar",
  "bespoke-bar",
  "athlone-sideboard",
  "hall-cabinet",
  "media-unit",
  "floating-shelves",
  "oak-chopping-board",
]);

/** For the shop: a product without uploaded photos shows its example image, if it has one. */
export function withExampleImage<T extends Pick<Product, "slug" | "name" | "images">>(p: T): T {
  if (p.images?.length || !exampleImageSlugs.has(p.slug)) return p;
  return { ...p, images: [{ url: `sample:${p.slug}`, alt: p.name }] };
}

function todayInIreland() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin" }).format(new Date());
}

/** True while the product's promotion applies. */
export function onSale(product: Pick<Product, "price" | "salePrice" | "saleEndsAt">) {
  return (
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < product.price &&
    (!product.saleEndsAt || product.saleEndsAt >= todayInIreland())
  );
}

/** Base price the customer pays now (before option surcharges). */
export function currentPrice(product: Pick<Product, "price" | "salePrice" | "saleEndsAt">) {
  return onSale(product) ? product.salePrice! : product.price;
}

export function isSoldOut(product: Pick<Product, "mode" | "stock">) {
  return product.mode === "in_stock" && (product.stock ?? 0) <= 0;
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export const modeLabels: Record<ProductMode, string> = {
  in_stock: "In stock",
  made_to_order: "Made to order",
  quote_only: "Made to measure",
};
