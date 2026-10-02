// Service pages. Prices are "from" figures used to set expectations; TODO confirm with the owner.

export type Service = {
  slug: string;
  group: "bespoke" | "build";
  name: string;
  summary: string;
  fromPrice?: string;
  includes: string[];
};

export const services: Service[] = [
  {
    slug: "kitchens",
    group: "bespoke",
    name: "Bespoke kitchens",
    summary:
      "Kitchens designed, built and fitted by us: from the first measure to the last handle.",
    fromPrice: "from €8,500",
    includes: [
      "Survey, layout design and drawings",
      "Hand-built carcasses, doors and islands",
      "Worktops, appliances and sinks fitted",
      "Utility rooms and pantries to match",
    ],
  },
  {
    slug: "fitted-wardrobes",
    group: "bespoke",
    name: "Fitted wardrobes & walk-ins",
    summary: "Floor-to-ceiling wardrobes and dressing rooms built into any room, slope or alcove.",
    fromPrice: "from €1,800",
    includes: [
      "Sliding or hinged doors, any finish",
      "Interiors planned around what you store",
      "Sloped ceilings and awkward corners",
      "Lighting and soft-close fittings",
    ],
  },
  {
    slug: "alcove-media-units",
    group: "bespoke",
    name: "Alcove & media units",
    summary: "Built-in cabinets and shelving for alcoves, chimney breasts and TV walls.",
    fromPrice: "from €950",
    includes: [
      "Alcove cupboards with shelves above",
      "Full TV walls with cable management",
      "Bookcases and display shelving",
      "Window seats and radiator covers",
    ],
  },
  {
    slug: "under-stairs-attic",
    group: "bespoke",
    name: "Under-stairs & attic storage",
    summary: "Pull-out drawers, cupboards and shelving that use every centimetre of awkward space.",
    fromPrice: "from €1,200",
    includes: [
      "Pull-out under-stairs drawers",
      "Eaves storage for attic rooms",
      "Coat and boot storage",
      "Hidden doors and cupboards",
    ],
  },
  {
    slug: "home-office-bathroom",
    group: "bespoke",
    name: "Home office, bathroom & more",
    summary: "Desks, vanity units, boot rooms and anything else that needs to fit exactly.",
    includes: [
      "Built-in desks and office storage",
      "Bathroom vanity units",
      "Boot rooms and utility storage",
      "Anything else built to measure",
    ],
  },
  {
    slug: "interior",
    group: "build",
    name: "Interior renovation & fit-out",
    summary: "Complete interior work, from a single room to a whole house.",
    includes: [
      "Flooring, skirting and architraves",
      "Internal doors and staircases",
      "Stud walls, ceilings and plastering",
      "Full room and whole-house renovations",
    ],
  },
  {
    slug: "exterior",
    group: "build",
    name: "Exterior & garden",
    summary: "Decking, fencing, garden rooms and outdoor structures built for the Irish weather.",
    fromPrice: "decking from €95/m²",
    includes: [
      "Timber and composite decking",
      "Fencing, gates and pergolas",
      "Garden rooms and sheds",
      "Cladding and exterior joinery",
    ],
  },
  {
    slug: "extensions-conversions",
    group: "build",
    name: "Extensions & conversions",
    summary: "Extensions, attic and garage conversions managed from start to finish.",
    includes: [
      "Single-storey extensions",
      "Attic conversions",
      "Garage conversions",
      "Project management with one point of contact",
    ],
  },
  {
    slug: "small-jobs",
    group: "build",
    name: "Small jobs",
    summary: "No job too small: repairs, doors, shelves, skirting and the odd jobs that never get done.",
    includes: [
      "Door hanging and repairs",
      "Shelving and fixing",
      "Skirting, trims and boxing-in",
      "Half-day and full-day bookings",
    ],
  },
];

export function getServices(group: Service["group"]) {
  return services.filter((s) => s.group === group);
}

export function getService(group: Service["group"], slug: string) {
  return services.find((s) => s.group === group && s.slug === slug);
}
