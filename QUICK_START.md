# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, verify you have:
- ✅ Node.js 20+ installed
- ✅ MongoDB Atlas account access
- ✅ Internet connection

---

## Step 1: Fix MongoDB Connection (CRITICAL)

Your backend won't start until this is done:

### Option A: Whitelist IP in MongoDB Atlas (Recommended)
1. Open: https://cloud.mongodb.com/
2. Login with your MongoDB account
3. Select your cluster: **Cluster0**
4. Click **"Network Access"** in left sidebar
5. Click **"Add IP Address"** button
6. Click **"Add Current IP Address"**
7. Click **"Confirm"**
8. ⏳ Wait 1-2 minutes for changes to apply

### Option B: Allow All IPs (Development Only)
1. Follow steps 1-4 above
2. Click **"Allow Access from Anywhere"**
3. Enter: `0.0.0.0/0`
4. Click **"Confirm"**

---

## Step 2: Start the Application

### Method 1: Use the Start Script (Easiest)
```powershell
cd d:\wind
.\start-app.ps1
```

This will:
- Check configuration
- Remind you about MongoDB
- Start backend in a new window
- Start frontend in a new window

### Method 2: Manual Start
```powershell
# Terminal 1 - Backend
cd d:\wind\server
npm run dev

# Terminal 2 - Frontend (in a new terminal)
cd d:\wind\client
npm run dev
```

---

## Step 3: Verify Servers Started

### Backend (Terminal 1)
You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📊 Environment: development
🔗 API: http://localhost:5000/api
```

**If you see:** Server hanging or no output
**Solution:** MongoDB IP not whitelisted - go back to Step 1

### Frontend (Terminal 2)
You should see:
```
VITE v5.0.11  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 4: Open Application

1. Open browser: **http://localhost:5173**
2. You should see the Financial Agent login page

---

## Step 5: Test the Three Features

### 🏦 Feature 1: Plaid Bank Integration

1. **Register** a new account
2. Click **"Link Bank"** button
3. Use Plaid Sandbox credentials:
   - Username: `user_good`
   - Password: `pass_good`
   - MFA: `1234`
4. Select any bank (e.g., Chase)
5. Choose accounts to link
6. ✅ **Success**: You should see "Bank linked successfully"

**Verification:**
- Accounts appear in your dashboard
- Account balances are displayed
- Transaction data starts syncing

---

### 📊 Feature 2: Transaction Fetching & Dashboard

1. Navigate to **Dashboard** tab
2. Wait 2-3 seconds for data to load
3. Check the following charts:

**Expected Charts:**
- ✅ **Cash Flow**: Monthly income vs expenses (bar chart)
- ✅ **Expense Breakdown**: Category-wise spending (pie chart)
- ✅ **Net Worth Trend**: Wealth over time (line chart)
- ✅ **Summary Cards**: Assets, liabilities, net worth, cash flow

**Test Transaction Sync:**
```powershell
# Get your JWT token from browser DevTools → Application → Local Storage
curl -X POST http://localhost:5000/api/plaid/sync-transactions `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 🤖 Feature 3: AI Assistant with Financial Data

1. Navigate to **Assistant** tab
2. Try these queries:

**Query 1: Future Wealth Projection**
```
How much money will I have at 40?
```
**Expected:** AI uses your current balance and monthly savings to calculate future wealth

**Query 2: Loan Affordability**
```
Can I afford a ₹50L home loan?
```
**Expected:** AI calculates EMI, checks against your income, provides advice

**Query 3: Spending Analysis**
```
Show my spending trend last 6 months
```
**Expected:** AI analyzes your transactions by category, suggests chart

**Query 4: Anomaly Detection**
```
Any unusual expenses this month?
```
**Expected:** AI identifies outlier transactions from your data

**Verification Points:**
- ✅ AI responses reference YOUR actual account balances
- ✅ AI uses YOUR transaction history
- ✅ Responses show "Sources" (accounts, transactions)
- ✅ Calculations use your real financial data

---

## 🎯 Success Criteria

All three features are working if:

1. **Plaid Integration** ✅
   - Bank account links successfully
   - Accounts visible with balances
   - Transactions fetched and stored

2. **Dashboard Data** ✅
   - All charts display with real data
   - Summary cards show correct totals
   - Data updates after transaction sync

3. **AI Assistant** ✅
   - Responses use your actual financial data
   - Mentions specific balances from your accounts
   - References your transaction categories
   - Provides personalized calculations

---

## 🐛 Troubleshooting

### Backend won't start / hangs
**Problem:** MongoDB connection timeout
**Solution:** 
1. Verify IP is whitelisted in MongoDB Atlas
2. Wait 2 minutes after whitelisting
3. Restart backend server

### Frontend shows blank page
**Problem:** API connection failed
**Solution:**
1. Check backend is running (http://localhost:5000/health)
2. Verify client/.env has correct API URL
3. Check browser console for errors

### Plaid Link doesn't open
**Problem:** Plaid credentials or backend issue
**Solution:**
1. Verify backend is running
2. Check server/.env has PLAID_CLIENT_ID and PLAID_SECRET
3. Check browser console for errors

### AI Assistant gives generic responses
**Problem:** No financial data or API key issue
**Solution:**
1. Link a bank account first (need data for context)
2. Verify GEMINI_API_KEY in server/.env
3. Check server logs for Gemini API errors

### No transactions in dashboard
**Problem:** Transactions not synced
**Solution:**
1. Link bank account via Plaid first
2. Wait 30 seconds for auto-sync
3. Manually trigger sync via API
4. Check MongoDB for transaction documents

---

## 📊 Test Results Template

Use this to verify everything works:

```
✅ PLAID INTEGRATION
  ✅ Bank link successful
  ✅ Accounts fetched: ___ accounts
  ✅ Transactions fetched: ___ transactions
  ✅ Balances displayed correctly

✅ DASHBOARD & CHARTS
  ✅ Cash flow chart loads
  ✅ Expense breakdown shows categories
  ✅ Net worth trend displays
  ✅ Summary cards show correct totals

✅ AI ASSISTANT
  ✅ Uses my actual account balance: ₹___
  ✅ References my transaction history
  ✅ Provides personalized calculations
  ✅ Shows data sources used
```

---

## 🎉 All Done!

If all three features work as described above, your Financial Agent application is **fully functional** and ready for use!

For detailed API testing and advanced features, see: **TESTING_GUIDE.md**
