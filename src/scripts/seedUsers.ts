import mongoose from 'mongoose';
import { User } from '../app/modules/User/User.schema';
import config from '../app/config';

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Generate and create 100 users one by one to trigger pre-save hooks
    console.log('📝 Creating 100 users...');
    for (let i = 1; i <= 100; i++) {
      await User.create({
        firstName: `User${i}`,
        lastName: `Test${i}`,
        email: `user${i}@test.com`,
        password: 'password123', // Will be hashed by the pre-save hook
      });
      if (i % 10 === 0) {
        console.log(`   Created ${i}/100 users...`);
      }
    }
    console.log(`✅ Successfully created 100 users`);

    // Display sample credentials
    console.log('\n📋 Sample Login Credentials:');
    console.log('Email: user1@test.com | Password: password123');
    console.log('Email: user2@test.com | Password: password123');
    console.log('Email: user3@test.com | Password: password123');
    console.log('...');
    console.log('Email: user100@test.com | Password: password123');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();
