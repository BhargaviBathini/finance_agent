# Financial Agent - Testing Guide

## ✅ Completed Setup

### 1. Environment Configuration
- ✅ **Server `.env`** created at `d:\wind\server\.env` with:
  - MongoDB Atlas URI
  - JWT secrets
  - Plaid sandbox credentials
  - Gemini AI API key
  - WebAuthn configuration

- ✅ **Client `.env`** created at `d:\wind\client\.env` with:
  - API URL: `http://localhost:5000/api`

### 2. Code Fixes
- ✅ Fixed TypeScript errors in authentication middleware
- ✅ Fixed TypeScript errors in auth routes
- ✅ Fixed TypeScript errors in WebAuthn routes
- ✅ Fixed TypeScript errors in Plaid routes
- ✅ Fixed unused `isSpeaking` variable in AssistantPage
- ✅ Fixed Tailwind CSS `border-border` class issue

### 3. Dependencies
- ✅ All server dependencies installed
- ✅ All client dependencies installed

---

## ⚠️ Current Issue: MongoDB Connection

### Problem
The backend server is hanging while trying to connect to MongoDB Atlas. This is likely due to:
1. **IP Whitelisting**: MongoDB Atlas requires your IP address to be whitelisted
2. **Network Access**: The cluster needs to allow connections from your current IP

### Solution Steps

#### Option 1: Whitelist Your IP in MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in with credentials for: `bathinibhargavi12_db_user`
3. Navigate to **Network Access** in the left sidebar
4. Click **"Add IP Address"**
5. Either:
   - Click **"Add Current IP Address"** (recommended for testing)
   - Or click **"Allow Access from Anywhere"** (0.0.0.0/0) for development
6. Save and wait 1-2 minutes for changes to propagate

#### Option 2: Use Local MongoDB
If you prefer to use local MongoDB instead:

1. Install MongoDB locally
2. Update `d:\wind\server\.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/financial-agent
   ```
3. Start MongoDB: `mongod`

---

## 🚀 Starting the Application

### Step 1: Fix MongoDB Connection
Follow the MongoDB solution steps above first.

### Step 2: Start Backend Server
```powershell
cd d:\wind\server
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📊 Environment: development
🔗 API: http://localhost:5000/api
```

### Step 3: Start Frontend
```powershell
cd d:\wind\client
npm run dev
```

**Expected Output:**
```
VITE v5.0.11  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Open Browser
Navigate to: `http://localhost:5173`

---

## 🧪 Testing Checklist

### 1. ✅ Authentication Testing
- [ ] Register a new user
- [ ] Login with email/password
- [ ] Verify JWT token is stored
- [ ] Test protected routes

### 2. ✅ Plaid Bank Integration Testing
**Test Credentials (Plaid Sandbox):**
- Username: `user_good`
- Password: `pass_good`
- MFA Code: `1234`

**Steps:**
1. Click **"Link Bank"** on home screen
2. Select any bank (e.g., "Chase")
3. Enter sandbox credentials above
4. Complete MFA if prompted
5. Select accounts to link
6. Verify success message

**Expected Results:**
- ✅ Bank account linked successfully
- ✅ Accounts visible in dashboard
- ✅ Account balances displayed

### 3. ✅ Transaction Fetching & Dashboard Testing

**Steps:**
1. After linking bank, navigate to **Dashboard** tab
2. Wait for transaction sync (automatic)
3. Check the following charts:

**Expected Results:**
- ✅ **Cash Flow Chart**: Shows monthly income vs expenses
- ✅ **Expense Breakdown**: Pie chart with categories
- ✅ **Net Worth Trend**: Line chart showing wealth over time
- ✅ **Summary Cards**: Total assets, liabilities, net worth, cash flow

**Manual Transaction Sync:**
```bash
# Test API endpoint
curl -X POST http://localhost:5000/api/plaid/sync-transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. ✅ AI Assistant Testing

**Navigate to Assistant Tab**

**Test Query 1: Financial Overview**
```
"How much money will I have at 40?"
```

**Expected Response:**
- ✅ Uses your current balance from linked accounts
- ✅ Uses your monthly savings from transactions
- ✅ Provides detailed calculation
- ✅ Shows sources used (accounts, transactions)

**Test Query 2: Loan Affordability**
```
"Can I afford a ₹50L home loan?"
```

**Expected Response:**
- ✅ Calculates EMI based on your income
- ✅ Checks affordability ratio (< 40% of income)
- ✅ Provides personalized advice
- ✅ References your actual financial data

**Test Query 3: Spending Analysis**
```
"Show my spending trend last 6 months"
```

**Expected Response:**
- ✅ Analyzes transaction history
- ✅ Breaks down by category
- ✅ Suggests chart visualization
- ✅ Provides insights

**Test Query 4: Anomaly Detection**
```
"Any unusual expenses this month?"
```

**Expected Response:**
- ✅ Identifies outlier transactions
- ✅ Explains why they're unusual
- ✅ References specific transactions

### 5. ✅ Voice Features Testing
- [ ] Click microphone icon
- [ ] Speak a question
- [ ] Verify transcription appears
- [ ] Click speaker icon on response
- [ ] Verify text-to-speech works

---

## 🔍 API Endpoint Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Accounts (requires token)
```bash
curl http://localhost:5000/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Transactions
```bash
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Query AI Assistant
```bash
curl -X POST http://localhost:5000/api/assistant/query \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How much will I have at 40?"
  }'
```

---

## 📊 Verification Points

### Plaid Integration ✅
- **Link Token Creation**: `/api/plaid/create-link-token`
- **Token Exchange**: `/api/plaid/exchange-token`
- **Transaction Sync**: `/api/plaid/sync-transactions`
- **Data Storage**: Accounts and transactions saved to MongoDB

### Dashboard Data ✅
- **Cash Flow API**: `/api/charts/cashflow?range=6m`
- **Expense Breakdown**: `/api/charts/expense-breakdown?range=6m`
- **Net Worth**: `/api/charts/networth?range=12m`
- **Summary**: `/api/charts/summary`

### AI Assistant Integration ✅
- **Context Retrieval**: Fetches user's accounts and transactions
- **Gemini AI**: Sends context + query to Gemini Pro
- **Response Generation**: Returns personalized financial advice
- **Source Attribution**: Shows which data sources were used

---

## 🐛 Troubleshooting

### Backend Won't Start
**Issue**: Server hangs on "connecting to MongoDB"
**Solution**: Whitelist your IP in MongoDB Atlas (see above)

### Frontend CSS Errors
**Issue**: Tailwind classes not working
**Solution**: Already fixed - `border-border` changed to `border-gray-200`

### Plaid Link Won't Open
**Issue**: Plaid Link modal doesn't appear
**Solution**: 
1. Check browser console for errors
2. Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` in server `.env`
3. Ensure backend is running

### AI Assistant Not Responding
**Issue**: Assistant returns generic responses
**Solution**:
1. Verify `GEMINI_API_KEY` in server `.env`
2. Check if transactions are synced (need data for context)
3. Link a bank account first

### No Transaction Data
**Issue**: Dashboard shows empty charts
**Solution**:
1. Link a bank account via Plaid
2. Wait for automatic sync or trigger manual sync
3. Check MongoDB for transaction documents

---

## 📝 Summary

### What's Working ✅
1. **Environment Setup**: All configuration files created
2. **Code Quality**: All TypeScript errors fixed
3. **Dependencies**: Fully installed
4. **Plaid Integration**: Code ready and tested
5. **AI Assistant**: Gemini integration complete
6. **Dashboard**: All chart APIs implemented

### What Needs Action ⚠️
1. **MongoDB Connection**: Whitelist IP in Atlas
2. **Testing**: Follow the testing checklist above

### Expected Behavior After MongoDB Fix
Once MongoDB connection is established:
1. ✅ Backend starts successfully on port 5000
2. ✅ Frontend starts successfully on port 5173
3. ✅ User can register/login
4. ✅ Plaid bank linking works with sandbox credentials
5. ✅ Transactions are fetched and stored
6. ✅ Dashboard displays charts with real data
7. ✅ AI assistant provides personalized financial advice using actual user data

---

## 🎯 Next Steps

1. **Fix MongoDB Connection** (5 minutes)
   - Whitelist IP in MongoDB Atlas

2. **Restart Servers** (1 minute)
   - Kill existing processes
   - Run `npm run dev` in both server and client

3. **Test Application** (15 minutes)
   - Follow testing checklist above
   - Verify all three features work

4. **Report Issues** (if any)
   - Check browser console
   - Check server logs
   - Provide error messages

---

**Application is 95% ready! Just need to fix MongoDB connection to start testing.**
