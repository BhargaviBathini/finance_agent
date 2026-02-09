const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://bathinibhargavi12_db_user:bZ6pqge6FIwhm8bS@cluster0.r3ttfmz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔄 Attempting to connect to MongoDB...');

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  })
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
