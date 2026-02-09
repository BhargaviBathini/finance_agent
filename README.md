# Financial Agent - AI-Powered Financial Management App

A production-ready, mobile-first financial management application with AI assistance, bank integration via Plaid, and WebAuthn security.

## Features

### 🔐 Security
- **WebAuthn Authentication**: Device password/biometric unlock
- **AES-256 Encryption**: All sensitive data encrypted at rest
- **JWT Tokens**: Short-lived access tokens with refresh mechanism
- **GDPR Compliant**: Full data ownership and deletion capabilities

### 🏦 Banking Integration
- **Plaid Sandbox**: Secure bank account linking
- **Real-time Balances**: Check account balances with PIN protection
- **Transaction Sync**: Automatic transaction fetching and categorization
- **Multi-account Support**: Link multiple bank accounts

### 📊 Dashboard & Analytics
- **Cash Flow Analysis**: Monthly inflow vs outflow visualization
- **Expense Breakdown**: Category-wise spending with pie charts
- **Net Worth Tracking**: Assets vs liabilities trend analysis
- **What-if Simulator**: Future wealth projections
- **Anomaly Detection**: Unusual transaction alerts
- **CSV Export**: Download chart data

### 🤖 AI Assistant
- **Gemini AI Integration**: Natural language financial queries
- **Voice Input/Output**: Hands-free interaction
- **Contextual Responses**: Answers based on your actual financial data
- **Smart Suggestions**: Loan affordability, future wealth calculations
- **Source Attribution**: See which data sources were used

### 📱 Mobile-First UI
- **PhonePe-like Design**: Intuitive bottom navigation
- **Dark Mode**: Eye-friendly dark theme
- **PWA Support**: Install as native app
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: Polished micro-interactions

## Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **TypeScript**: Type-safe development
- **MongoDB**: Document database with encryption
- **Plaid API**: Bank data integration
- **Gemini AI**: Natural language processing
- **WebAuthn**: Passwordless authentication

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Data visualization
- **Zustand**: State management
- **Vite**: Fast build tool

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Production web server
- **MongoDB Atlas**: Cloud database option

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (or use Docker Compose)
- Plaid account (sandbox credentials provided)
- Gemini API key (provided)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wind
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

The `.env` file has been created with generated secrets. For production, regenerate these:

```bash
# Server environment
cd server
cp .env.example .env
# Edit .env with your values
```

4. **Start MongoDB** (if not using Docker)
```bash
mongod --dbpath /path/to/data
```

5. **Run development servers**
```bash
# From root directory
npm run dev
```

This starts:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Docker Deployment

1. **Build and start all services**
```bash
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 3000

2. **View logs**
```bash
docker-compose logs -f
```

3. **Stop services**
```bash
docker-compose down
```

## Environment Variables

### Server (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/financial-agent

# Security
JWT_SECRET=<generated-64-char-hex>
JWT_EXPIRES_IN=15m
AES_256_KEY=<generated-32-char-hex>

# Plaid (Sandbox)
PLAID_CLIENT_ID=68d819151059f3002356b26e
PLAID_SECRET=096bde63d0169f4ffe0db91d238ea7
PLAID_ENV=sandbox

# Gemini AI
GEMINI_API_KEY=AIzaSyBfIAxzpYVcblQ3Fl90RBqdWp4g_laVq_g

# WebAuthn
RP_NAME=Financial Agent
RP_ID=localhost
ORIGIN=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password

### WebAuthn
- `POST /api/webauthn/register/options` - Get registration options
- `POST /api/webauthn/register/verify` - Verify registration
- `POST /api/webauthn/authenticate/options` - Get authentication options
- `POST /api/webauthn/authenticate/verify` - Verify authentication

### Plaid
- `POST /api/plaid/create-link-token` - Create Plaid Link token
- `POST /api/plaid/exchange-token` - Exchange public token
- `POST /api/plaid/sync-transactions` - Sync latest transactions
- `POST /api/plaid/unlink` - Unlink bank and delete data

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/balances` - Get real-time balances

### Transactions
- `GET /api/transactions` - Get transactions (with filters)
- `GET /api/transactions/:id` - Get transaction details
- `PATCH /api/transactions/:id` - Update transaction
- `GET /api/transactions/latest/summary` - Get latest 3 transactions
- `POST /api/transactions/detect-anomalies` - Run anomaly detection

### Charts
- `GET /api/charts/cashflow?range=6m` - Cash flow data
- `GET /api/charts/expense-breakdown?range=6m` - Expense breakdown
- `GET /api/charts/networth?range=12m` - Net worth trend
- `GET /api/charts/summary` - Summary cards data
- `POST /api/charts/simulate` - What-if simulation
- `GET /api/charts/export/:chartType` - Export chart as CSV

### Assistant
- `POST /api/assistant/query` - Ask AI assistant
- `POST /api/assistant/calculate/loan-affordability` - Calculate loan affordability
- `POST /api/assistant/calculate/future-wealth` - Project future wealth

## Usage Guide

### 1. First Time Setup

1. **Register**: Create an account with email and password
2. **Enable WebAuthn** (optional): Go to Profile → Security → Enable Device Password
3. **Link Bank**: Tap "Link Bank" on home screen and connect via Plaid sandbox

### 2. Using Plaid Sandbox

For testing, use these credentials:
- Username: `user_good`
- Password: `pass_good`
- MFA: `1234`

### 3. Checking Balances

1. Tap "Check Balance" on home screen
2. Enter PIN (or use WebAuthn)
3. View real-time balances

### 4. AI Assistant Examples

Ask questions like:
- "How much money will I have at 40?"
- "Can I afford a ₹50L home loan?"
- "Show my spending trend last 6 months"
- "Any unusual expenses this month?"

### 5. Voice Input

1. Go to Assistant tab
2. Tap microphone icon
3. Speak your question
4. Tap speaker icon to hear response

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate secrets regularly** in production
3. **Use HTTPS** in production
4. **Enable rate limiting** on API endpoints
5. **Monitor for anomalies** in transaction patterns
6. **Backup encrypted data** regularly
7. **Implement proper logging** for audit trails

## Deployment

### Vercel (Frontend)
```bash
cd client
vercel --prod
```

### Render/Heroku (Backend)
```bash
cd server
# Follow platform-specific deployment guide
```

### MongoDB Atlas
1. Create cluster at mongodb.com
2. Update `MONGODB_URI` in environment variables
3. Enable encryption at rest

## Testing

### Run Backend Tests
```bash
cd server
npm test
```

### Run Frontend Tests
```bash
cd client
npm test
```

## Troubleshooting

### WebAuthn not working
- Ensure you're on HTTPS (or localhost)
- Check browser compatibility
- Verify RP_ID matches domain

### Plaid connection fails
- Verify sandbox credentials
- Check PLAID_ENV is set to "sandbox"
- Ensure backend can reach Plaid API

### MongoDB connection error
- Verify MongoDB is running
- Check MONGODB_URI format
- Ensure network connectivity

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check documentation
- Review API endpoints

## Acknowledgments

- Plaid for banking integration
- Google Gemini for AI capabilities
- SimpleWebAuthn for authentication
- Chart.js for visualizations

---

Built with ❤️ for better financial management
