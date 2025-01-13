import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateRandomProperties = (numProperties: number) => {
  // Define coordinate boundaries for NYC
  const boundaries = {
    manhattan: {
      lat: { min: 40.7034, max: 40.8892 },
      lng: { min: -74.0201, max: -73.9198 },
    },
    brooklyn: {
      lat: { min: 40.5707, max: 40.7395 },
      lng: { min: -74.0431, max: -73.8334 },
    },
    queens: {
      lat: { min: 40.5431, max: 40.7914 },
      lng: { min: -73.9611, max: -73.7004 },
    },
    bronx: {
      lat: { min: 40.7855, max: 40.9155 },
      lng: { min: -73.9338, max: -73.7654 },
    },
    statenIsland: {
      lat: { min: 40.4957, max: 40.6501 },
      lng: { min: -74.2557, max: -74.0522 },
    },
  };

  // Street names for random address generation
  const streets = [
    "Broadway",
    "Park Avenue",
    "Madison Avenue",
    "Lexington Avenue",
    "Amsterdam Avenue",
    "Columbus Avenue",
    "West End Avenue",
    "Riverside Drive",
    "Bedford Avenue",
    "Nassau Avenue",
    "Metropolitan Avenue",
    "Graham Avenue",
    "Queens Boulevard",
    "Northern Boulevard",
    "Roosevelt Avenue",
    "Steinway Street",
    "Grand Concourse",
    "Fordham Road",
    "Pelham Parkway",
    "White Plains Road",
    "Victory Boulevard",
    "Hylan Boulevard",
    "Richmond Avenue",
    "Forest Avenue",
  ];

  // Generate random number within range
  const random = (min, max) => Math.random() * (max - min) + min;

  // Generate random integer within range
  const randomInt = (min, max) => Math.floor(random(min, max));

  // Generate random address number
  const generateAddressNumber = () => randomInt(1, 300);

  // Generate random price within reasonable range for NYC
  const generatePrice = () => randomInt(800000, 5000000);

  // Generate random square footage
  const generateSqft = () => randomInt(800, 3500);

  // Generate random number of bedrooms
  const generateBedrooms = () => randomInt(1, 5);

  // Generate random number of bathrooms
  const generateBathrooms = () => {
    const fullBaths = randomInt(1, 4);
    return Math.random() > 0.5 ? fullBaths : fullBaths + 0.5;
  };

  // Generate random coordinates for a borough
  const getRandomCoordinates = (borough) => {
    const coords = boundaries[borough];
    return {
      lat: random(coords.lat.min, coords.lat.max),
      lng: random(coords.lng.min, coords.lng.max),
    };
  };

  // Generate n random properties
  const properties = Array.from({ length: numProperties }, (_, index) => {
    const boroughs = [
      "manhattan",
      "brooklyn",
      "queens",
      "bronx",
      "statenIsland",
    ];
    const borough = boroughs[randomInt(0, boroughs.length)];
    const coords = getRandomCoordinates(borough);
    const street = streets[randomInt(0, streets.length)];

    return {
      address: `${generateAddressNumber()} ${street}`,
      price: generatePrice(),
      sqft: generateSqft(),
      bedrooms: generateBedrooms(),
      bathrooms: generateBathrooms(),
      location: `POINT(${coords.lng.toFixed(4)} ${coords.lat.toFixed(4)})`,
      organization: {
        connect: {
          slug: "testorg",
        },
      },
    };
  });

  return properties;
};

async function main() {
  console.log("Seeding Properties, Amenities, and Property Similarities...");

  const numProperties = 50
  
  // Generate 50 random properties
  const properties = generateRandomProperties(numProperties);
  const createdProperties = await Promise.all(properties.map((p) => prisma.property.create({data: p})))

  console.log("Created ", 50, " Properties");
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
