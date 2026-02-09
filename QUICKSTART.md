# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20+ installed
- MongoDB running (or use Docker)

### Step 1: Install Dependencies

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Start MongoDB

**Option A - Docker (Recommended):**
```bash
docker-compose up -d
```

**Option B - Local MongoDB:**
```bash
mongod --dbpath ./data
```

### Step 3: Start Development Servers

```bash
npm run dev
```

This starts:
- ✅ Backend API: http://localhost:5000
- ✅ Frontend: http://localhost:3000

### Step 4: Open the App

Visit http://localhost:3000 in your browser

## 📱 First Time User Flow

### 1. Register Account
- Click "Sign up"
- Enter your name, email, and password (min 8 characters)
- Click "Create Account"

### 2. Link Bank (Plaid Sandbox)
- On home screen, tap the Link icon (top right)
- Select any bank
- Use test credentials:
  - Username: `user_good`
  - Password: `pass_good`
  - MFA Code: `1234`
- Click "Continue"
- Select accounts to link
- Click "Submit"

### 3. Enable Device Password (Optional)
- Go to Profile tab (bottom nav)
- Tap "Device Password"
- Follow browser prompts to set up biometric/PIN unlock
- Next time you open the app, you'll use device unlock

### 4. Explore Features

**Home Tab:**
- View net worth summary
- See latest 3 transactions
- Quick actions: Check balance, Add goal, Scan receipt

**Transactions Tab:**
- View all transactions
- Filter by date, category, account
- Search transactions
- Tap transaction for details
- Mark as recurring or dispute

**Dashboard Tab:**
- Summary cards (Assets, Liabilities, Net Worth, Cash Flow)
- Cash flow chart (monthly inflow vs outflow)
- Expense breakdown by category
- Net worth trend over time
- Export charts as CSV

**Assistant Tab:**
- Ask financial questions
- Use voice input (tap microphone)
- Get AI-powered insights
- Examples:
  - "How much money will I have at 40?"
  - "Can I afford a ₹50L home loan?"
  - "Show my spending trend"
  - "Any unusual expenses?"

## 🎯 Key Features to Test

### Check Balance with PIN
1. Home tab → "Check Balance"
2. Enter PIN (any 4-6 digits for demo)
3. View real-time account balances

### WebAuthn Unlock
1. Enable in Profile → Security
2. Close app and reopen
3. Use device password/biometric to unlock

### Voice Assistant
1. Go to Assistant tab
2. Tap microphone icon
3. Say: "How much did I spend on food?"
4. Tap speaker icon to hear response

### Transaction Filters
1. Transactions tab → "Filters"
2. Select category (e.g., "Food and Drink")
3. Set date range
4. View filtered results

### Export Chart Data
1. Dashboard tab
2. Tap download icon on any chart
3. CSV file downloads with data

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
docker ps

# Or start MongoDB
docker-compose up -d mongodb
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebAuthn Not Working
- Must use HTTPS or localhost
- Check browser supports WebAuthn
- Try Chrome/Edge/Safari (latest versions)

## 📊 Test Data

### Plaid Sandbox Accounts

**Good Account (user_good / pass_good):**
- Multiple accounts with transactions
- All features work

**Custom Account (custom_user / pass_good):**
- Customizable test data

**MFA Account (user_good / pass_good):**
- Tests multi-factor authentication
- Use code: `1234`

## 🎨 UI Customization

### Change Theme Colors
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#your-color',
    // ...
  }
}
```

### Modify Bottom Navigation
Edit `client/src/components/layout/MainLayout.tsx`

## 📝 API Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Transactions (with token):**
```bash
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Debug Mode

### Enable Verbose Logging

**Backend:**
Edit `server/src/index.ts`:
```typescript
app.use(morgan('dev')); // Already enabled in development
```

**Frontend:**
Open browser DevTools (F12) → Console

### View Database
```bash
# Connect to MongoDB
docker exec -it financial-agent-db mongosh

# Use database
use financial-agent

# View collections
show collections

# View users
db.users.find().pretty()

# View transactions
db.transactions.find().limit(5).pretty()
```

## 🚢 Ready for Production?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## 💡 Tips

1. **Use Docker Compose** for easiest setup
2. **Enable WebAuthn** for best security
3. **Link multiple accounts** to see full features
4. **Try voice commands** in Assistant
5. **Export charts** to analyze data offline
6. **Check anomaly detection** for unusual spending

## 📚 Learn More

- [README.md](./README.md) - Full documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- API Endpoints - See README.md

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Review environment variables
3. Test health endpoint: http://localhost:5000/health
4. Check MongoDB connection
5. Verify Plaid credentials

---

**Happy coding! 🎉**
