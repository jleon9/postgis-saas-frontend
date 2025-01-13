// scripts/test-property-analytics.ts
import { PrismaClient } from "@prisma/client";
import { PropertyAnalyticsService } from "./lib/spatialData/propertyAnalytics";

const prisma = new PrismaClient();
const propertyAnalyticsService = new PropertyAnalyticsService(prisma);

const testSlug = "testorg";
async function generateTestData() {
  console.log("Starting test data generation...");

  // First, let's clean up any existing data
  await prisma.propertySimilarity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.property.deleteMany();

  // Generate a cluster of properties in Manhattan (around Central Park)
  const manhattanProperties = [
    {
      address: "72 Central Park West",
      price: 2500000,
      sqft: 1800,
      bedrooms: 3,
      bathrooms: 2,
      location: "POINT(-73.9747 40.7756)", // Upper West Side
      organization: {
        connect: {
          slug: testSlug,
        },
      },
    },
    {
      address: "230 Central Park South",
      price: 2750000,
      sqft: 1950,
      bedrooms: 3,
      bathrooms: 2.5,
      location: "POINT(-73.9819 40.7666)", // Near Columbus Circle
      organization: {
        connect: {
          slug: testSlug,
        },
      },
    },
    {
      address: "1040 Fifth Avenue",
      price: 3200000,
      sqft: 2200,
      bedrooms: 4,
      bathrooms: 3,
      location: "POINT(-73.9634 40.7789)", // Upper East Side
      organization: {
        connect: {
          slug: testSlug,
        },
      },
    },
  ];

  // Generate a cluster of properties in Brooklyn (around Prospect Park)
  const brooklynProperties = [
    {
      address: "790 Caroll Street",
      price: 1800000,
      sqft: 1600,
      bedrooms: 3,
      bathrooms: 2,
      location: "POINT(-73.9752 40.6727)", // Park Slope
      organization: {
        connect: {
          slug: testSlug,
        },
      },
    },
    {
      address: "25 Plaza Street West",
      price: 1650000,
      sqft: 1500,
      bedrooms: 2,
      bathrooms: 2,
      location: "POINT(-73.9714 40.6747)", // Grand Army Plaza
      organization: {
        connect: {
          slug: testSlug,
        },
      },
    },
    {
      address: "145 Lincoln Place",
      price: 1950000,
      sqft: 1750,
      bedrooms: 3,
      bathrooms: 2.5,
      location: "POINT(-73.9673 40.6731)", // Park Slope
      organization: {
        connect: {
          slug: testSlug,
        },
      },
    },
  ];

  // Create amenities around both areas
  const amenities = [
    // Manhattan amenities
    {
      name: "Central Park",
      type: "park",
      location: "POINT(-73.9665 40.7829)",
    },
    {
      name: "Whole Foods Columbus Circle",
      type: "grocery",
      location: "POINT(-73.9819 40.7686)",
    },
    {
      name: "72nd Street Station",
      type: "transit_station",
      location: "POINT(-73.9762 40.7759)",
    },
    // Brooklyn amenities
    {
      name: "Prospect Park",
      type: "park",
      location: "POINT(-73.9665 40.7829)",
    },
    {
      name: "Union Market",
      type: "grocery",
      location: "POINT(-73.9776 40.6728)",
    },
    {
      name: "Grand Army Plaza Station",
      type: "transit_station",
      location: "POINT(-73.9709 40.6747)",
    },
  ];

  console.log("Creating properties and amenities...");

  // Create all properties
  const createdProperties = await Promise.all(
    [...manhattanProperties, ...brooklynProperties].map((prop) =>
      prisma.property.create({ data: prop, include: { organization: true } })
    )
  );

  // Create all amenities
  const createdAmenities = await Promise.all(
    amenities.map((amenity) => prisma.amenity.create({ data: amenity }))
  );

  console.log(`Created ${createdProperties.length} properties`);
  console.log(`Created ${createdAmenities.length} amenities`);

  return createdProperties;
}

const generateRandomProperties = () => {
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

  // Generate 50 random properties
  const properties = Array.from({ length: 50 }, (_, index) => {
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
          slug: testSlug,
        },
      },
    };
  });

  return properties;
};

async function testPropertyAnalytics() {
  try {
    console.log("\n=== Starting Property Analytics Test ===\n");

    // Step 1: Generate test data (remains the same)
    console.log("Step 1: Generating test data...");
    const properties = await generateTestData();
    console.log("✓ Test data generated successfully\n");

    // Step 2: Test similarity calculations
    console.log("Step 2: Testing similarity calculations...");
    const manhattan1 = properties[0];
    const manhattan2 = properties[1];
    const brooklyn1 = properties[3];

    // Testing individual similarity calculations
    const similarityScore =
      await propertyAnalyticsService.calculatePropertySimilarity(
        manhattan1,
        manhattan2,
        {
          maxGeographicRadius: 5.0,
        }
      );
    console.log("Similarity score between nearby properties:", similarityScore);

    const distantSimilarityScore =
      await propertyAnalyticsService.calculatePropertySimilarity(
        manhattan1,
        brooklyn1,
        {
          maxGeographicRadius: 5.0,
        }
      );
    console.log(
      "Similarity score between distant properties:",
      distantSimilarityScore
    );
    console.log("✓ Similarity calculations completed\n");

    // Step 3: Update all property similarities
    console.log("Step 3: Updating property similarities...");
    await propertyAnalyticsService.updateSimilarities(5.0);
    console.log("✓ Property similarities updated\n");

    // Step 4: Test cluster detection
    console.log("Step 4: Testing cluster detection...");
    // We use 0.7 as the minimum similarity score to match our previous threshold
    const clusters = await propertyAnalyticsService.findPropertyClusters(0.7);
    console.log("\nDetailed Cluster Analysis:", clusters);

    console.log("✓ Cluster detection completed\n");

    // Step 5: Validate results
    console.log("Step 5: Validating results...");

    // The validation logic needs slight modification since our cluster structure changed
    const manhattanPropertiesFound = clusters.some(
      (cluster) =>
        cluster.property_ids.includes(manhattan1.id) &&
        cluster.property_ids.includes(manhattan2.id)
    );

    const mixedClustersFound = clusters.some(
      (cluster) =>
        cluster.property_ids.includes(manhattan1.id) &&
        cluster.property_ids.includes(brooklyn1.id)
    );

    console.log("Validation results:");
    console.log(
      "- Manhattan properties clustered together:",
      manhattanPropertiesFound
    );
    console.log("- No mixed Manhattan/Brooklyn clusters:", !mixedClustersFound);

    // console.log("Detected clusters:", JSON.stringify(clusters, null, 2));

    // Additional validation for the new relational approach
    console.log("\nValidating database state:");
    const similarityCount = await prisma.propertySimilarity.count();
    console.log(`- Total similarities stored: ${similarityCount}`);

    const manhattanSimilarities = await prisma.propertySimilarity.findMany({
      where: {
        OR: [
          { propertyId: manhattan1.id },
          { similarPropertyId: manhattan1.id },
        ],
      },
    });
    console.log(
      `- Manhattan property similarities: ${manhattanSimilarities.length}`
    );

    console.log("\n=== Test Complete ===\n");
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  } finally {
    // Clean up database connections
    await prisma.$disconnect();
  }
}

// Run the test
testPropertyAnalytics()
  .catch(console.error)
  .finally(() => process.exit());
