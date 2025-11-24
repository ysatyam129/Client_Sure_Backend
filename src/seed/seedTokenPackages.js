import TokenPackage from '../models/TokenPackage.js';
import dbConnect from '../config/db.js';

const tokenPackages = [
  {
    name: 'Emergency Boost',
    tokens: 25,
    price: 15,
    description: 'Quick token boost for urgent needs',
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    metadata: {
      category: 'emergency',
      validityHours: 24,
      maxPurchasePerDay: 5
    }
  },
  {
    name: 'Standard Pack',
    tokens: 50,
    price: 25,
    description: 'Perfect for moderate usage',
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    metadata: {
      category: 'standard',
      validityHours: 24,
      maxPurchasePerDay: 10
    }
  },
  {
    name: 'Value Pack',
    tokens: 100,
    price: 45,
    description: 'Best value for heavy users',
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    metadata: {
      category: 'premium',
      validityHours: 24,
      maxPurchasePerDay: 10
    }
  },
  {
    name: 'Power Pack',
    tokens: 200,
    price: 80,
    description: 'Maximum tokens for power users',
    isActive: true,
    isPopular: false,
    sortOrder: 4,
    metadata: {
      category: 'bulk',
      validityHours: 24,
      maxPurchasePerDay: 5
    }
  }
];

export const seedTokenPackages = async () => {
  try {
    await dbConnect();
    
    // Clear existing packages
    await TokenPackage.deleteMany({});
    console.log('Cleared existing token packages');
    
    // Insert new packages
    const createdPackages = await TokenPackage.insertMany(tokenPackages);
    console.log(`Created ${createdPackages.length} token packages:`);
    
    createdPackages.forEach(pkg => {
      console.log(`- ${pkg.name}: ${pkg.tokens} tokens for ₹${pkg.price} (₹${(pkg.price/pkg.tokens).toFixed(2)}/token)`);
    });
    
    return createdPackages;
  } catch (error) {
    console.error('Error seeding token packages:', error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTokenPackages()
    .then(() => {
      console.log('Token packages seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed token packages:', error);
      process.exit(1);
    });
}