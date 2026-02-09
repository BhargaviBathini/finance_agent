# 🚀 START HERE - Financial Agent Setup

## Quick Setup (5 Minutes)

### Step 1: Configure Environment
Run this command in PowerShell:
```powershell
.\configure-env.ps1
```

This creates the `server/.env` file with all necessary configuration including your MongoDB Atlas connection.

### Step 2: Install Dependencies
```powershell
npm install
cd server
npm install
cd ../client
npm install
cd ..
```

Or use the setup script:
```powershell
.\setup.ps1
```

### Step 3: Start the Application
```powershell
npm run dev
```

This starts both:
- ✅ Backend API: http://localhost:5000
- ✅ Frontend: http://localhost:3000

### Step 4: Open Your Browser
Navigate to: **http://localhost:3000**

---

## 🎯 What You'll See

### 1. Registration Page
- Create your account with email and password
- Password must be at least 8 characters

### 2. Home Screen
- **Top Right Icons:**
  - 🔗 Link Bank button
  - 👤 Profile button
- **Net Worth Card:** Shows your financial summary
- **Quick Actions:** Check Balance, Add Goal, Scan Receipt
- **Recent Transactions:** Latest 3 transactions

### 3. Link Your Bank (Plaid Sandbox)
1. Click the link icon (top right)
2. Select any bank from the list
3. **Use these test credentials:**
   - Username: `user_good`
   - Password: `pass_good`
   - MFA Code: `1234`
4. Select accounts and submit
5. ✅ You'll see "Bank account connected successfully"

### 4. Explore the App

**Bottom Navigation (4 Tabs):**

📱 **Home**
- View net worth
- See latest transactions
- Quick actions

💳 **Transactions**
- All transactions with search
- Filter by category and date
- Tap any transaction for details
- Mark as recurring

📊 **Dashboard**
- Summary cards (Assets, Liabilities, Net Worth, Cash Flow)
- Cash flow chart
- Expense breakdown
- Net worth trend
- Export charts as CSV

🤖 **Assistant**
- Ask financial questions
- Use voice input (microphone button)
- Get AI-powered insights
- Example questions:
  - "How much money will I have at 40?"
  - "Can I afford a ₹50L home loan?"
  - "Show my spending trend"

---

## 🔐 Enable Device Password (Optional)

1. Go to Profile tab (tap user icon)
2. Tap "Device Password" under Security
3. Follow browser prompts
4. Next time you open the app, unlock with biometric/PIN

---

## 🎤 Try Voice Commands

1. Go to Assistant tab
2. Tap the microphone icon
3. Say: "How much did I spend on food?"
4. Tap speaker icon to hear the response

---

## 📊 Check Your Balance

1. Home tab → "Check Balance" quick action
2. Enter any 4-6 digit PIN (demo mode)
3. View real-time account balances

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000

# Then restart
npm run dev
```

### MongoDB Connection Error
Your MongoDB Atlas connection is already configured. If you see connection errors:
1. Check your internet connection
2. Verify MongoDB Atlas cluster is running
3. Check the connection string in `server/.env`

### Dependencies Won't Install
```powershell
# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### Browser Shows Blank Page
1. Check console for errors (F12)
2. Verify both servers are running
3. Try clearing browser cache
4. Use Chrome/Edge for best compatibility

---

## 📁 Project Structure

```
wind/
├── client/          # React frontend (Port 3000)
├── server/          # Express backend (Port 5000)
├── .env             # Root environment variables
└── server/.env      # Server environment variables (created by configure-env.ps1)
```

---

## 🎓 Learn More

- **Full Documentation:** [README.md](./README.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **Project Summary:** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 🎯 Key Features to Test

✅ **User Registration & Login**
✅ **WebAuthn Device Unlock**
✅ **Plaid Bank Linking**
✅ **Real-time Balance Check**
✅ **Transaction Management**
✅ **Interactive Charts**
✅ **AI Assistant with Voice**
✅ **Data Export (CSV)**
✅ **Bank Unlinking**

---

## 🚀 Production Deployment

When ready to deploy to production, see [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- MongoDB Atlas setup
- Vercel deployment (frontend)
- Render deployment (backend)
- SSL/HTTPS configuration
- Environment variable management

---

## 💡 Tips

1. **Use Chrome/Edge** for best WebAuthn support
2. **Enable microphone** for voice assistant
3. **Link multiple accounts** to see full features
4. **Try different time ranges** in Dashboard
5. **Export charts** to analyze data offline

---

## 🆘 Need Help?

### Check Logs
```powershell
# Backend logs
cd server
npm run dev

# Frontend logs
cd client
npm run dev
```

### Test API Health
Open: http://localhost:5000/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-09-29T..."
}
```

### Common Issues

**"Cannot connect to MongoDB"**
- Check internet connection
- Verify MongoDB Atlas cluster is active
- Check connection string in server/.env

**"Port 5000 already in use"**
- Run: `npx kill-port 5000`
- Or change PORT in server/.env

**"WebAuthn not working"**
- Use HTTPS or localhost only
- Try Chrome/Edge browser
- Check browser supports WebAuthn

---

## ✨ You're All Set!

Run `npm run dev` and start exploring your AI-powered financial agent!

**Happy coding! 🎉**
