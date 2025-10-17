require('dotenv').config();
const mongoose = require('mongoose');

// Simplified User schema for testing
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

async function testDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check existing users
    const users = await User.find({}, 'email name passwordHash pinHash');
    console.log('Existing users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Has password: ${!!user.passwordHash} - Has PIN: ${!!user.pinHash}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDatabase();