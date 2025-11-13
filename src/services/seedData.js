import bcrypt from 'bcrypt';
import { Plan, Resource, User } from '../models/index.js';

// Seed initial plans and resources
export const seedInitialData = async () => {
  try {
    // Create test user
    await createTestUser();
    
    // Check if plans already exist
    const existingPlans = await Plan.countDocuments();
    if (existingPlans > 0) {
      console.log('Plans already exist, skipping seed');
      return;
    }

    console.log('Creating sample plans...');
    // Create sample plans - All get 100 tokens daily, different durations
    const plans = await Plan.insertMany([
      {
        name: 'Basic Plan',
        price: 299,
        durationDays: 30,
        dailyTokens: 100,
        providerPlanId: 'basic_plan_001'
      },
      {
        name: 'Premium Plan', 
        price: 499,
        durationDays: 60,
        dailyTokens: 100,
        providerPlanId: 'premium_plan_001'
      },
      {
        name: 'Pro Plan',
        price: 999,
        durationDays: 90,
        dailyTokens: 100,
        providerPlanId: 'pro_plan_001'
      }
    ]);

    console.log('Plans created:', plans.length);

    console.log('Creating sample resources...');
    // Create sample resources with new schema
    const resources = await Resource.insertMany([
      {
        title: 'Lead Generation Masterclass',
        description: 'Complete video course on generating high-quality leads',
        type: 'video',
        tokenCost: 25,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=Lead+Generation',
        allowedPlans: plans.map(p => p._id)
      },
      {
        title: 'Client Acquisition Strategies PDF',
        description: 'Comprehensive guide to acquiring and retaining clients',
        type: 'pdf',
        tokenCost: 30,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=Client+Acquisition',
        allowedPlans: [plans[1]._id, plans[2]._id]
      },
      {
        title: 'Advanced Sales Funnel Templates',
        description: 'Premium templates for high-converting sales funnels',
        type: 'document',
        tokenCost: 40,
        url: 'https://docs.google.com/document/d/1example',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=Sales+Funnel',
        allowedPlans: [plans[2]._id]
      },
      {
        title: 'Email Marketing Templates',
        description: 'Ready-to-use email templates for marketing campaigns',
        type: 'pdf',
        tokenCost: 15,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=Email+Templates',
        allowedPlans: plans.map(p => p._id)
      },
      {
        title: 'Social Media Content Calendar',
        description: 'Monthly content calendar for social media marketing',
        type: 'document',
        tokenCost: 20,
        url: 'https://docs.google.com/spreadsheets/d/1example',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=Content+Calendar',
        allowedPlans: plans.map(p => p._id)
      },
      {
        title: 'Digital Marketing Masterclass',
        description: 'Complete video series on digital marketing strategies',
        type: 'video',
        tokenCost: 35,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=Digital+Marketing',
        allowedPlans: plans.map(p => p._id)
      }
    ]);

    console.log('Resources created:', resources.length);
    console.log('✅ Initial data seeded successfully');

  } catch (error) {
    console.error('❌ Seed data error:', error.message);
  }
};

// Create test user
export const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    console.log('Creating test user...');
    // Create test user with bcrypt hashed password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('testpassword123', saltRounds);

    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      tokens: 1000,
      tokensUsedTotal: 0,
      subscription: {
        planId: null,
        dailyTokens: 100,
        endDate: null
      },
      resetTokenHash: undefined,
      resetTokenExpires: undefined
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
};