import express, { Response } from 'express';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import User from '../models/User';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import { authenticate, AuthRequest } from '../middleware/auth';
import { encrypt, decrypt } from '../utils/encryption';

const router = express.Router();

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Create link token
router.post('/create-link-token', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const request = {
      user: {
        client_user_id: (user._id as any).toString(),
      },
      client_name: 'Financial Agent',
      products: [Products.Transactions, Products.Auth, Products.Liabilities],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Create link token error:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

// Exchange public token
router.post('/exchange-token', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { public_token } = req.body;

    if (!public_token) {
      return res.status(400).json({ error: 'Public token required' });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Encrypt and store access token
    const encryptedToken = encrypt(accessToken);

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.plaidAccessToken = encryptedToken;
    user.plaidItemId = itemId;
    await user.save();

    // Fetch accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Store accounts
    const accounts = accountsResponse.data.accounts;
    for (const account of accounts) {
      await Account.findOneAndUpdate(
        { userId: req.userId, plaidAccountId: account.account_id },
        {
          userId: req.userId,
          plaidAccountId: account.account_id,
          name: account.name,
          officialName: account.official_name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          currentBalance: account.balances.current || 0,
          availableBalance: account.balances.available,
          currency: account.balances.iso_currency_code || 'USD',
          lastSynced: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // Fetch transactions (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    // Store transactions
    const transactions = transactionsResponse.data.transactions;
    let validTransactions = 0;
    for (const transaction of transactions) {
      // Skip transactions without valid IDs
      if (!transaction.transaction_id || transaction.transaction_id.trim() === '' || transaction.transaction_id === null) {
        console.log('Skipping transaction with invalid ID:', transaction);
        continue;
      }
      
      const account = await Account.findOne({
        userId: req.userId,
        plaidAccountId: transaction.account_id,
      });

      if (account) {
        // Additional validation for transaction ID
        if (!transaction.transaction_id || transaction.transaction_id === 'null' || transaction.transaction_id.trim() === '') {
          console.log('Skipping transaction with truly invalid ID:', transaction);
          continue;
        }
        
        try {
          await Transaction.findOneAndUpdate(
            { plaidTransactionId: transaction.transaction_id },
            {
              userId: req.userId,
              accountId: account._id,
              plaidTransactionId: transaction.transaction_id,
              amount: transaction.amount,
              date: new Date(transaction.date),
              name: transaction.name,
              merchantName: transaction.merchant_name,
              category: transaction.category || [],
              categoryId: transaction.category_id,
              pending: transaction.pending,
              isoCurrencyCode: transaction.iso_currency_code || 'USD',
              paymentChannel: transaction.payment_channel,
              isAnomaly: false,
              isRecurring: false,
              tags: [],
            },
            { upsert: true, new: true }
          );
          validTransactions++;
        } catch (transactionError) {
          console.error('Error saving transaction:', transactionError);
          // Continue with other transactions even if one fails
        }
      }
    }

    // Update user's bank connection status
    user.hasBankConnected = true;
    user.onboardingComplete = true;
    await user.save();

    res.json({
      message: 'Bank account connected successfully',
      accounts: accounts.length,
      transactions: validTransactions,
      success: true,
    });
  } catch (error) {
    console.error('Exchange token error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// Sync transactions
router.post('/sync-transactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('+plaidAccessToken');
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ error: 'No bank account linked' });
    }

    const accessToken = decrypt(user.plaidAccessToken);

    // Fetch latest transactions
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const endDate = new Date();

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    const transactions = transactionsResponse.data.transactions;
    let newCount = 0;

    for (const transaction of transactions) {
      // Skip transactions without valid IDs
      if (!transaction.transaction_id || transaction.transaction_id.trim() === '' || transaction.transaction_id === null) {
        console.log('Skipping transaction with invalid ID during sync:', transaction);
        continue;
      }
      
      const account = await Account.findOne({
        userId: req.userId,
        plaidAccountId: transaction.account_id,
      });

      if (account) {
        // Additional validation for transaction ID
        if (!transaction.transaction_id || transaction.transaction_id === 'null' || transaction.transaction_id.trim() === '') {
          console.log('Skipping transaction with truly invalid ID during sync:', transaction);
          continue;
        }
        
        try {
          const result = await Transaction.findOneAndUpdate(
            { plaidTransactionId: transaction.transaction_id },
            {
              userId: req.userId,
              accountId: account._id,
              plaidTransactionId: transaction.transaction_id,
              amount: transaction.amount,
              date: new Date(transaction.date),
              name: transaction.name,
              merchantName: transaction.merchant_name,
              category: transaction.category || [],
              categoryId: transaction.category_id,
              pending: transaction.pending,
              isoCurrencyCode: transaction.iso_currency_code || 'USD',
              paymentChannel: transaction.payment_channel,
            },
            { upsert: true, new: true }
          );

          if (result) newCount++;
        } catch (transactionError) {
          console.error('Error syncing transaction:', transactionError);
          // Continue with other transactions even if one fails
        }
      }
    }

    res.json({
      message: 'Transactions synced successfully',
      synced: newCount,
    });
  } catch (error) {
    console.error('Sync transactions error:', error);
    res.status(500).json({ error: 'Failed to sync transactions' });
  }
});

// Unlink bank
router.post('/unlink', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('+plaidAccessToken');
    if (!user || !user.plaidAccessToken) {
      return res.status(400).json({ error: 'No bank account linked' });
    }

    const accessToken = decrypt(user.plaidAccessToken);

    // Remove item from Plaid
    try {
      await plaidClient.itemRemove({ access_token: accessToken });
    } catch (error) {
      console.error('Plaid item remove error:', error);
    }

    // Delete user data
    await Account.deleteMany({ userId: req.userId });
    await Transaction.deleteMany({ userId: req.userId });

    user.plaidAccessToken = undefined;
    user.plaidItemId = undefined;
    user.hasBankConnected = false; // Make sure to set this to false
    await user.save();

    res.json({ message: 'Bank account unlinked and data deleted successfully' });
  } catch (error) {
    console.error('Unlink bank error:', error);
    res.status(500).json({ error: 'Failed to unlink bank' });
  }
});

// Create simulated demo data for testing
router.post('/demo-data', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1) Delete old accounts/transactions
    await Account.deleteMany({ userId: req.userId });
    await Transaction.deleteMany({ userId: req.userId });

    // 2) Insert 3 mock accounts
    const checkingAcc = await Account.create({
      userId: req.userId,
      plaidAccountId: 'demo_checking_id',
      name: 'Chase Checking',
      officialName: 'Chase Premium Checking',
      type: 'depository',
      subtype: 'checking',
      mask: '4912',
      currentBalance: 5420.50,
      availableBalance: 5310.20,
      currency: 'USD',
      lastSynced: new Date(),
    });

    const savingsAcc = await Account.create({
      userId: req.userId,
      plaidAccountId: 'demo_savings_id',
      name: 'Chase Savings',
      officialName: 'Chase High Yield Savings',
      type: 'depository',
      subtype: 'savings',
      mask: '9812',
      currentBalance: 45800.00,
      availableBalance: 45800.00,
      currency: 'USD',
      lastSynced: new Date(),
    });

    const creditAcc = await Account.create({
      userId: req.userId,
      plaidAccountId: 'demo_credit_id',
      name: 'Freedom Credit Card',
      officialName: 'Chase Freedom Visa',
      type: 'credit',
      subtype: 'credit card',
      mask: '2180',
      currentBalance: 1250.75,
      availableBalance: 8749.25,
      currency: 'USD',
      lastSynced: new Date(),
    });

    // 3) Create mock transactions over last 60 days
    const mockTxns = [
      { name: 'Apex Payroll', merchantName: 'Apex Corp', amount: -3200.00, category: ['Transfer', 'Payroll'], isRecurring: true },
      { name: 'Whole Foods Market', merchantName: 'Whole Foods', amount: 145.20, category: ['Food and Drink', 'Groceries'], isRecurring: false },
      { name: 'Uber Ride', merchantName: 'Uber', amount: 24.50, category: ['Travel', 'Taxi'], isRecurring: false },
      { name: 'Starbucks Coffee', merchantName: 'Starbucks', amount: 6.80, category: ['Food and Drink', 'Coffee Shop'], isRecurring: false },
      { name: 'Netflix Subscription', merchantName: 'Netflix', amount: 15.49, category: ['Shops', 'Digital Entertainment'], isRecurring: true },
      { name: 'Chevron Gasoline', merchantName: 'Chevron', amount: 48.00, category: ['Travel', 'Gas Station'], isRecurring: false },
      { name: 'Rent Payment', merchantName: 'Landlord', amount: 1200.00, category: ['Transfer', 'Rent'], isRecurring: true },
      { name: 'Electricity Bill', merchantName: 'Power Grid', amount: 85.00, category: ['Bills and Utilities'], isRecurring: true },
      { name: 'Amazon Order', merchantName: 'Amazon', amount: 189.99, category: ['Shops', 'E-Commerce'], isRecurring: false },
      { name: 'Target Grocery', merchantName: 'Target', amount: 62.40, category: ['Food and Drink', 'Groceries'], isRecurring: false },
      { name: 'Gym Membership', merchantName: 'Planet Fitness', amount: 22.00, category: ['Shops', 'Gyms'], isRecurring: true },
      { name: 'Steam Games', merchantName: 'Steam', amount: 59.99, category: ['Shops', 'Digital Entertainment'], isRecurring: false },
      { name: 'Restaurant Dinner', merchantName: 'Olive Garden', amount: 112.50, category: ['Food and Drink', 'Restaurants'], isRecurring: false },
      { name: 'Apex Payroll (Mid-Month)', merchantName: 'Apex Corp', amount: -3200.00, category: ['Transfer', 'Payroll'], isRecurring: true },
      { name: 'Uber Ride (Duplicate)', merchantName: 'Uber', amount: 24.50, category: ['Travel', 'Taxi'], isAnomaly: true },
      { name: 'Uber Ride', merchantName: 'Uber', amount: 24.50, category: ['Travel', 'Taxi'] },
      { name: 'Home Depot Electronics', merchantName: 'Home Depot', amount: 750.00, category: ['Shops', 'Home Improvement'], isAnomaly: true },
    ];

    const insertedTransactions = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const txTemplate = mockTxns[i % mockTxns.length];
      const txnDate = new Date();
      txnDate.setDate(baseDate.getDate() - i * 2);

      let accountId = checkingAcc._id;
      if (txTemplate.amount > 0 && Math.random() > 0.6) {
        accountId = creditAcc._id;
      }

      insertedTransactions.push({
        userId: req.userId,
        accountId: accountId,
        plaidTransactionId: `demo_tx_${i}_${Date.now()}`,
        amount: txTemplate.amount,
        date: txnDate,
        name: txTemplate.name,
        merchantName: txTemplate.merchantName,
        category: txTemplate.category,
        categoryId: '12000000',
        pending: false,
        isoCurrencyCode: 'USD',
        paymentChannel: 'in store',
        isAnomaly: !!txTemplate.isAnomaly,
        isRecurring: !!txTemplate.isRecurring,
        tags: [],
      });
    }

    await Transaction.insertMany(insertedTransactions);

    // 4) Complete onboarding for user
    user.hasBankConnected = true;
    user.onboardingComplete = true;
    await user.save();

    res.json({
      message: 'Demo data loaded successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        hasBankConnected: true,
        onboardingComplete: true
      }
    });
  } catch (error) {
    console.error('Demo data error:', error);
    res.status(500).json({ error: 'Failed to populate demo data' });
  }
});

export default router;