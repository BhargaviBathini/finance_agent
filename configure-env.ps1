# PowerShell script to configure environment variables

Write-Host "🔧 Configuring Environment Variables..." -ForegroundColor Cyan
Write-Host ""

$serverEnvContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://bathinibhargavi12_db_user:bZ6pqge6FIwhm8bS@cluster0.r3ttfmz.mongodb.net/?retryWrites=true"&"w=majority"&"appName=Cluster0

# JWT Configuration
JWT_SECRET=7f8a9b2c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption
AES_256_KEY=9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b

# Plaid Configuration (Sandbox)
PLAID_CLIENT_ID=68d819151059f3002356b26e
PLAID_SECRET=096bde63d0169f4ffe0db91d238ea7
PLAID_ENV=sandbox

# Groq AI
GROQ_API_KEY=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

# WebAuthn
RP_NAME=Financial Agent
RP_ID=localhost
ORIGIN=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000","http://localhost:5173
"@

# Create server/.env file
$serverEnvContent | Out-File -FilePath server/.env -Encoding UTF8 -NoNewline

Write-Host "✓ Created server/.env" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run install:all" -ForegroundColor Yellow
Write-Host "2. Run: npm run dev" -ForegroundColor Yellow
Write-Host ""
