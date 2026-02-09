# Real-Time Data Verification Checklist

## 🚨 IMPORTANT: Currency Fix Applied

**All data now uses exact Plaid currency (USD for sandbox, not INR)**

If you have existing data with INR currency, you need to:
1. Clear old data: `db.accounts.deleteMany({})` and `db.transactions.deleteMany({})`
2. Reconnect your bank account via Plaid Link
3. All amounts will now show with $ symbol matching Plaid exactly

---

## Quick Test Guide

### ✅ Step 1: Verify Servers are Running
- [ ] Frontend running on http://localhost:5173
- [ ] Backend running on http://localhost:5000
- [ ] MongoDB connected successfully

### ✅ Step 2: Connect Bank Account
1. [ ] Login to the application
2. [ ] Navigate to Settings or Accounts page
3. [ ] Click "Connect Bank Account"
4. [ ] Complete Plaid Link flow (use sandbox credentials if testing)
5. [ ] Verify success message shows number of accounts and transactions synced

### ✅ Step 3: Dashboard Verification
1. [ ] Navigate to Dashboard
2. [ ] Check Summary Cards:
   - [ ] Net Worth shows real balance (not mock data)
   - [ ] Total Assets reflects connected accounts
   - [ ] Monthly Cash Flow calculated from real transactions
3. [ ] Check Charts:
   - [ ] Cash Flow chart shows actual inflow/outflow
   - [ ] Expense Breakdown shows real categories from transactions
   - [ ] Net Worth Trend displays actual account balances
4. [ ] Test Refresh:
   - [ ] Click refresh button (circular arrow icon)
   - [ ] Verify data updates

### ✅ Step 4: Transactions Page Verification
1. [ ] Navigate to Transactions page
2. [ ] Verify transactions list:
   - [ ] Shows real transactions from connected accounts
   - [ ] Displays correct dates, amounts, and categories
   - [ ] Account names match connected banks
3. [ ] Test Filters:
   - [ ] Category filter shows actual categories
   - [ ] Date range filtering works
   - [ ] Search finds specific transactions
4. [ ] Test Visualizations:
   - [ ] Click chart icon
   - [ ] Verify breakdown shows real spending data
   - [ ] Time series reflects actual transaction patterns

### ✅ Step 5: Insights Page Verification
1. [ ] Navigate to Insights page
2. [ ] Check Financial Trends:
   - [ ] Spending trend (increasing/decreasing/stable)
   - [ ] Savings trend reflects actual data
   - [ ] Income trend is accurate
3. [ ] Review Key Insights:
   - [ ] Insights reference actual categories
   - [ ] Percentage changes are calculated from real data
   - [ ] Amounts match transaction totals
4. [ ] Check Recommendations:
   - [ ] Recommendations based on actual spending patterns
   - [ ] Savings opportunities reference real categories
   - [ ] Impact calculations use actual amounts
5. [ ] Verify Charts:
   - [ ] Trend Detection chart shows real expense data
   - [ ] Portfolio Diversification reflects connected accounts
   - [ ] Goal Projection uses actual savings rate

### ✅ Step 6: AI Assistant Verification
1. [ ] Navigate to AI Chat/Assistant page
2. [ ] Test Personalized Queries:
   - [ ] Ask: "How much did I spend this month?"
     - [ ] Verify AI responds with actual amount
   - [ ] Ask: "What's my biggest expense category?"
     - [ ] Verify AI references real category and amount
   - [ ] Ask: "Show me my account balances"
     - [ ] Verify AI lists actual connected accounts with balances
   - [ ] Ask: "Can I afford to save $500 more per month?"
     - [ ] Verify AI calculates based on real income/expenses
3. [ ] Check Context:
   - [ ] AI mentions specific account names
   - [ ] AI references actual transaction amounts
   - [ ] AI calculates savings rate from real data

### ✅ Step 7: Real-Time Updates
1. [ ] Leave Dashboard open for 5+ minutes
2. [ ] Verify auto-refresh occurs (check console or network tab)
3. [ ] Make a test transaction in Plaid sandbox (if available)
4. [ ] Click manual refresh
5. [ ] Verify new transaction appears

### ✅ Step 8: Data Accuracy Cross-Check
1. [ ] Compare Dashboard summary with Transactions page totals
2. [ ] Verify Insights page trends match Dashboard charts
3. [ ] Check AI Assistant responses align with visible data
4. [ ] Confirm all pages show consistent account balances

## Expected Results

### ✅ Dashboard
- All numbers are real (not $10,000 mock values)
- Charts show actual transaction patterns
- Date ranges affect displayed data
- Refresh updates all values

### ✅ Transactions
- List contains real transactions from Plaid
- Categories match Plaid's categorization
- Amounts are accurate
- Filters work correctly

### ✅ Insights
- Trends calculated from actual data
- Recommendations are personalized
- Charts reflect real spending
- No generic mock insights

### ✅ AI Assistant
- Responses reference specific accounts
- Amounts match actual balances
- Recommendations are data-driven
- Context includes real transactions

## Common Issues & Solutions

### Issue: Dashboard shows "No data available"
**Solution:** 
- Ensure bank account is connected via Plaid
- Check that transactions were synced (check backend logs)
- Verify MongoDB has data: `db.transactions.find()`

### Issue: Insights page is empty
**Solution:**
- Need at least 30 days of transaction history
- Ensure `/api/insights` endpoint is accessible
- Check browser console for API errors

### Issue: AI gives generic responses
**Solution:**
- Verify GROQ_API_KEY is set in `.env`
- Check backend logs for API errors
- Ensure user has transactions in database

### Issue: Auto-refresh not working
**Solution:**
- Check browser console for errors
- Verify interval is set (should see network requests every 5 min)
- Clear browser cache and reload

## Success Criteria

✅ All data displayed is from connected bank accounts
✅ No mock/hardcoded values visible
✅ AI assistant provides personalized insights
✅ Charts and summaries match transaction data
✅ Real-time updates work automatically
✅ Manual refresh updates all data
✅ Insights are calculated from actual spending patterns

## Status Check Commands

### Check if servers are running:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Check MongoDB connection:
```powershell
# In MongoDB shell
use financial-agent
db.accounts.count()
db.transactions.count()
```

### Test API endpoints:
```powershell
# Get accounts
curl http://localhost:5000/api/accounts -H "Authorization: Bearer YOUR_TOKEN"

# Get insights
curl http://localhost:5000/api/insights -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Last Updated:** October 17, 2025
**Status:** Ready for Testing ✅
