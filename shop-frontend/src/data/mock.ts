import type { Category, Product } from "@/types/product";

export const categories: Category[] = [
  { slug: "electronics", name: "Electronics", description: "TVs, sound systems and home appliances from trusted brands." },
  { slug: "tvs-stands", name: "TVs & TV Stands", description: "Stylish stands and shelves to show off your TV." },
  { slug: "wall-units", name: "Wall Units", description: "Storage and display units that make the living room." },
  { slug: "furniture", name: "Sofas & Furniture", description: "Comfortable sofas, tables and dining sets for every home." },
  { slug: "carpets", name: "Carpets & Rugs", description: "Turkish, Persian and shaggy carpets in every size." },
  { slug: "bedding", name: "Duvets & Bedding", description: "Duvets, sheets, blankets and pillows for better sleep." },
  { slug: "kitchen", name: "Kitchen & Home", description: "Everyday essentials for a well-run kitchen." },
  { slug: "lighting", name: "Lighting", description: "Chandeliers, lamps and LED lighting for every room." },
];

// Placeholder images. Replace `image` with your real product photos later.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

const make = (
  slug: string,
  name: string,
  category: string,
  price: number,
  compareAtPrice?: number
): Product => ({
  id: slug,
  slug,
  name,
  category,
  price,
  compareAtPrice,
  image: img(slug),
  inStock: true,
});

export const products: Product[] = [
  make("tv-43-smart", '43" Smart Full HD TV', "electronics", 28500, 34000),
  make("soundbar-2-1", "2.1 Channel Soundbar", "electronics", 12900, 15500),
  make("microwave-25l", "25L Digital Microwave", "electronics", 11200),
  make("blender-1-5l", "1.5L Heavy Duty Blender", "electronics", 4500, 5800),
  make("fan-stand", "16\" Stand Fan", "electronics", 3200),

  make("tv-stand-oak", "Oak Finish TV Stand", "tvs-stands", 14500, 17000),
  make("tv-stand-glass", "Glass Top TV Stand", "tvs-stands", 18900),
  make("tv-stand-corner", "Corner TV Stand", "tvs-stands", 11800, 13500),
  make("tv-stand-wall", "Floating TV Shelf", "tvs-stands", 7900),
  make("tv-stand-drawer", "TV Stand with Drawers", "tvs-stands", 16200),

  make("wall-unit-modern", "Modern Wall Unit", "wall-units", 42000, 49500),
  make("wall-unit-led", "Wall Unit with LED Lights", "wall-units", 56000),
  make("wall-unit-classic", "Classic Wall Unit", "wall-units", 38500),
  make("wall-unit-display", "Display Wall Unit", "wall-units", 47500, 52000),
  make("wall-unit-mini", "Compact Wall Unit", "wall-units", 29900),

  make("sofa-3-seater", "3 Seater Fabric Sofa", "furniture", 52000, 61000),
  make("sofa-l-shape", "L-Shape Corner Sofa", "furniture", 89000),
  make("coffee-table", "Marble Coffee Table", "furniture", 13500, 16000),
  make("dining-6", "6 Seater Dining Set", "furniture", 64000),
  make("armchair", "Accent Armchair", "furniture", 18500),

  make("carpet-5x8", "Turkish Carpet 5x8", "carpets", 15900, 19500),
  make("carpet-7x10", "Persian Style Carpet 7x10", "carpets", 28000),
  make("carpet-shaggy", "Shaggy Living Room Rug", "carpets", 9800, 12000),
  make("carpet-runner", "Hallway Runner", "carpets", 4800),
  make("carpet-kids", "Kids Play Mat", "carpets", 3900),

  make("duvet-6x6", "6x6 Cotton Duvet Set", "bedding", 6500, 8200),
  make("duvet-7x8", "7x8 Luxury Duvet Set", "bedding", 8900),
  make("duvet-woolen", "Woolen Blanket", "bedding", 4200, 5200),
  make("bedsheets-set", "Bed Sheets Set (4pc)", "bedding", 3600),
  make("pillows-pair", "Hotel Pillows (Pair)", "bedding", 2400),

    make("cookware-set", "10pc Non-stick Cookware Set", "kitchen", 8900, 11000),
  make("dinner-set", "24pc Dinner Set", "kitchen", 6400),
  make("kettle-electric", "1.8L Electric Kettle", "kitchen", 2100, 2600),
  make("cutlery-set", "Stainless Cutlery Set (24pc)", "kitchen", 3200),
  make("storage-jars", "Airtight Storage Jars (6pc)", "kitchen", 1800),

  make("chandelier-crystal", "Crystal Chandelier", "lighting", 24500, 29000),
  make("floor-lamp", "Modern Floor Lamp", "lighting", 6800),
  make("table-lamp", "Bedside Table Lamp", "lighting", 2900, 3500),
  make("led-strip", "LED Strip Lights 5m", "lighting", 1500),
  make("pendant-light", "Pendant Ceiling Light", "lighting", 5200),
];