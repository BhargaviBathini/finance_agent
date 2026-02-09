const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// User model schema (simplified)
const userSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  name: String,
  pinHash: String,
  webAuthnCredentials: Array,
  hasBankConnected: Boolean,
  onboardingComplete: Boolean,
  consentTimestamp: Date
});

const User = mongoose.model('User', userSchema);

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check existing users
    const users = await User.find({}, 'email name');
    console.log('Existing users:', users);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();