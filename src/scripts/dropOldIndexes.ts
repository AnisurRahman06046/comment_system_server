import mongoose from 'mongoose';
import config from '../app/config';

const dropOldIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    console.log('✅ Connected to MongoDB');

    // Drop the old userName index
    const db = mongoose.connection.db;
    const collection = db?.collection('users');

    if (collection) {
      try {
        await collection.dropIndex('userName_1');
        console.log('✅ Dropped userName_1 index');
      } catch (error: any) {
        if (error.code === 27) {
          console.log('ℹ️  Index userName_1 does not exist, skipping...');
        } else {
          throw error;
        }
      }
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the function
dropOldIndexes();
