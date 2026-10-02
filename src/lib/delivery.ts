// Delivery from the Athlone workshop with our own van. TODO: confirm prices with the owner.
export const deliveryZones = [
  { name: "Workshop collection", area: "Collect from our Athlone workshop", delivery: 0, assembly: null },
  { name: "Zone 1", area: "Athlone and up to 30 km", delivery: 30, assembly: 40 },
  { name: "Zone 2", area: "30–60 km: most of Westmeath, Roscommon, Longford, Offaly", delivery: 50, assembly: 50 },
  { name: "Zone 3", area: "60–100 km", delivery: 80, assembly: 60 },
  { name: "Further afield", area: "Over 100 km", delivery: null, assembly: null },
] as const;
