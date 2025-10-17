// Quick script to verify Plaid data is in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-agent';

async function verifyData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Users
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const userCount = await User.countDocuments();
    console.log(`👤 Users: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne();
      console.log(`   Sample User ID: ${sampleUser._id}`);
      console.log(`   Email: ${sampleUser.email}\n`);

      // Check Accounts for this user
      const Account = mongoose.model('Account', new mongoose.Schema({}, { strict: false }));
      const accountCount = await Account.countDocuments({ userId: sampleUser._id });
      console.log(`🏦 Accounts for user: ${accountCount}`);
      
      if (accountCount > 0) {
        const accounts = await Account.find({ userId: sampleUser._id });
        accounts.forEach((acc, i) => {
          console.log(`   ${i + 1}. ${acc.name} (${acc.subtype})`);
          console.log(`      Balance: ${acc.currency} ${acc.currentBalance}`);
          console.log(`      Plaid ID: ${acc.plaidAccountId}`);
        });
        console.log('');
      } else {
        console.log('   ⚠️  No accounts found - Connect Plaid account!\n');
      }

      // Check Transactions for this user
      const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
      const txnCount = await Transaction.countDocuments({ userId: sampleUser._id });
      console.log(`💳 Transactions for user: ${txnCount}`);
      
      if (txnCount > 0) {
        const recentTxns = await Transaction.find({ userId: sampleUser._id })
          .sort({ date: -1 })
          .limit(5);
        
        console.log('   Recent transactions:');
        recentTxns.forEach((txn, i) => {
          const amount = txn.amount >= 0 ? `+${txn.amount}` : txn.amount;
          console.log(`   ${i + 1}. ${txn.date.toISOString().split('T')[0]} - ${txn.name}`);
          console.log(`      Amount: ${txn.isoCurrencyCode} ${amount}`);
          console.log(`      Category: ${txn.category.join(', ')}`);
        });
        console.log('');

        // Calculate some stats
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const recentTxns30 = await Transaction.find({
          userId: sampleUser._id,
          date: { $gte: last30Days }
        });

        const income = recentTxns30
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = recentTxns30
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        console.log('📊 Last 30 Days Summary:');
        console.log(`   Income: ${recentTxns30[0]?.isoCurrencyCode || 'USD'} ${income.toFixed(2)}`);
        console.log(`   Expenses: ${recentTxns30[0]?.isoCurrencyCode || 'USD'} ${expenses.toFixed(2)}`);
        console.log(`   Net: ${recentTxns30[0]?.isoCurrencyCode || 'USD'} ${(income - expenses).toFixed(2)}`);
        console.log('');

        // Category breakdown
        const categoryTotals = {};
        recentTxns30.filter(t => t.amount < 0).forEach(t => {
          const cat = t.category[0] || 'Uncategorized';
          categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
        });

        console.log('📈 Top Spending Categories (Last 30 Days):');
        Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([cat, amount], i) => {
            console.log(`   ${i + 1}. ${cat}: ${recentTxns30[0]?.isoCurrencyCode || 'USD'} ${amount.toFixed(2)}`);
          });
        console.log('');

      } else {
        console.log('   ⚠️  No transactions found - Sync may still be in progress!\n');
      }

      // Check Chats
      const Chat = mongoose.model('Chat', new mongoose.Schema({}, { strict: false }));
      const chatCount = await Chat.countDocuments({ userId: sampleUser._id });
      console.log(`💬 Chat sessions: ${chatCount}`);
      if (chatCount > 0) {
        const chat = await Chat.findOne({ userId: sampleUser._id });
        console.log(`   Messages: ${chat.messages.length}`);
        console.log(`   Data Sharing: ${chat.dataSharing ? 'ON' : 'OFF'}`);
      }
      console.log('');

    } else {
      console.log('⚠️  No users found - Register an account first!\n');
    }

    console.log('✅ Verification complete!');
    console.log('\n📊 Visualization Status:');
    
    if (userCount > 0) {
      const sampleUser = await User.findOne();
      const Account = mongoose.model('Account', new mongoose.Schema({}, { strict: false }));
      const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
      
      const accountCount = await Account.countDocuments({ userId: sampleUser._id });
      const txnCount = await Transaction.countDocuments({ userId: sampleUser._id });

      if (accountCount > 0 && txnCount > 0) {
        console.log('   ✅ Dashboard: Will show real data');
        console.log('   ✅ Transactions: Will show real data');
        console.log('   ✅ Insights: Will show real data');
        console.log('   ✅ AI Chat: Can provide personalized advice');
      } else if (accountCount > 0) {
        console.log('   ⚠️  Accounts connected but no transactions yet');
        console.log('   💡 Wait a few minutes for Plaid to sync transactions');
      } else {
        console.log('   ❌ No Plaid account connected');
        console.log('   💡 Connect a bank account in the app to see visualizations');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

verifyData();
