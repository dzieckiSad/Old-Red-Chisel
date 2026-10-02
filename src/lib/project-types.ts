// Projects (portfolio): shared by the site, the admin panel and src/lib/projects.ts.

export type ProjectImage = { url: string; alt?: string };

export type Project = {
  id?: string;
  slug: string;
  title: string;
  place: string;
  type: string;
  summary: string;
  description: string;
  materials: string;
  duration: string;
  before: ProjectImage | null;
  after: ProjectImage | null;
  photos: ProjectImage[];
  featured?: boolean;
  hidden?: boolean;
  sortOrder?: number;
};

export const projectTypes = ["Kitchen", "Wardrobes", "Built-in", "Renovation", "Exterior", "Conversion", "Other"] as const;

/** Example images bundled with the site, referenced as "sample:<name>" until real photos replace them. */
export const sampleImageNames = [
  "alcove-before",
  "alcove-after",
  "wardrobe-before",
  "wardrobe-after",
  "stairs-before",
  "stairs-after",
  "kitchen-before",
  "kitchen-after",
] as const;
export type SampleImageName = (typeof sampleImageNames)[number];

export const isSampleImage = (url: string) => url.startsWith("sample:") && sampleImageNames.includes(url.slice(7) as SampleImageName);

/** Example projects, loaded into an empty database. Replace them with real work in the admin panel. */
export const sampleProjects: Project[] = [
  {
    slug: "alcove-units-athlone",
    title: "Alcove units and oak shelving",
    place: "Athlone",
    type: "Built-in",
    summary: "Painted shaker cupboards with oak tops and floating oak shelves either side of the chimney breast.",
    description:
      "The alcoves either side of the fireplace were wasted space collecting boxes. We built two low cupboards with shaker doors and solid oak tops, and fitted three floating oak shelves above each one, fixed into the wall with hidden steel rods so nothing sags.\n\nThe back walls were painted a deep green to frame the shelves, and the cupboards were sprayed to match.",
    materials: "Painted shaker doors, solid oak tops and shelves",
    duration: "Made in 2 weeks, fitted in 2 days",
    before: { url: "sample:alcove-before", alt: "Empty alcoves either side of a fireplace" },
    after: { url: "sample:alcove-after", alt: "Green alcove cupboards with oak worktops and floating oak shelves" },
    photos: [],
    featured: true,
  },
  {
    slug: "fitted-wardrobe-moate",
    title: "Floor-to-ceiling fitted wardrobe",
    place: "Moate",
    type: "Wardrobes",
    summary: "A wall of shaker wardrobes with top boxes, an open oak-shelved centre and three soft-close drawers.",
    description:
      "A clothes rail and a chest of drawers were doing the job of a wardrobe. We fitted a full-width wardrobe from floor to ceiling: four hanging sections behind shaker doors, top boxes for seasonal storage, and an open centre with oak shelves over three drawers.\n\nScribed to the walls and ceiling so there are no gaps, with brushed brass handles.",
    materials: "Painted shaker doors, oak shelves, soft-close runners",
    duration: "Made in 3 weeks, fitted in 2 days",
    before: { url: "sample:wardrobe-before", alt: "Bedroom wall with a clothes rail and chest of drawers" },
    after: { url: "sample:wardrobe-after", alt: "Fitted wardrobe with shaker doors and an open centre section" },
    photos: [],
  },
  {
    slug: "under-stairs-storage-longford",
    title: "Under-stairs pull-out storage",
    place: "Longford",
    type: "Built-in",
    summary: "Oak pull-outs that follow the line of the stairs, so every bit of the space is easy to reach.",
    description:
      "The space under the stairs was full of coats, shoes and the hoover, with the back half impossible to reach. We built five full-depth pull-outs on heavy-duty runners, each one cut to follow the slope of the stairs.\n\nThe tallest takes coats, the next ones the hoover and shoes, and the smallest the things you only need now and then.",
    materials: "Oak-veneered fronts, heavy-duty full-extension runners",
    duration: "Made in 2 weeks, fitted in 1 day",
    before: { url: "sample:stairs-before", alt: "Open space under the stairs full of clutter" },
    after: { url: "sample:stairs-after", alt: "Oak pull-out drawers fitted under the stairs" },
    photos: [],
  },
  {
    slug: "shaker-kitchen-mullingar",
    title: "Navy shaker kitchen",
    place: "Mullingar",
    type: "Kitchen",
    summary: "A dated pine kitchen replaced with navy shaker base units, white wall units and a quartz worktop.",
    description:
      "We stripped out the old pine kitchen, tiles and lino, and built a new kitchen along the same wall: navy shaker base units with pan drawers, white shaker wall units, a built-in oven under the induction hob, and a one-piece quartz worktop.\n\nWhite metro tiles, brass handles and a brass tap finish it off, with LED strips under the wall units.",
    materials: "Painted shaker doors, quartz worktop, metro tiles, porcelain floor",
    duration: "Made in 5 weeks, fitted in 6 days",
    before: { url: "sample:kitchen-before", alt: "Dated pine kitchen with a freestanding cooker" },
    after: { url: "sample:kitchen-after", alt: "Navy and white shaker kitchen with quartz worktop" },
    photos: [],
  },
];
