import mongoose from 'mongoose';
import userIndexes from './userIndexes';

const UserModel = mongoose.model('User');

async function applyIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    for (const index of userIndexes) {
      await UserModel.collection.createIndex(index.fields, index.options);
    }

    console.log('Indexes applied successfully!');
    process.exit();
  } catch (error) {
    console.error('Error applying indexes:', error);
    process.exit(1);
  }
}

applyIndexes();
