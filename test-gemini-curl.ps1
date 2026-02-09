# Test Gemini API with PowerShell
Write-Host "🧪 Testing Gemini 2.0 Flash API..." -ForegroundColor Cyan
Write-Host ""

$apiKey = $env:GEMINI_API_KEY
if (-not $apiKey) {
    # Try to read from .env file
    $envFile = Get-Content "../.env" -ErrorAction SilentlyContinue
    foreach ($line in $envFile) {
        if ($line -match "^GEMINI_API_KEY=(.+)$") {
            $apiKey = $matches[1]
            break
        }
    }
}

if (-not $apiKey) {
    Write-Host "❌ GEMINI_API_KEY not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ API Key found: $($apiKey.Substring(0,20))..." -ForegroundColor Green
Write-Host "📝 Testing with model: gemini-2.0-flash-exp" -ForegroundColor Yellow
Write-Host ""

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$apiKey"

$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Say 'Hello! I am Gemini 2.0 Flash and I am working correctly!' in a friendly way."
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "⏳ Sending request..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Gemini API is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🤖 AI Response:" -ForegroundColor Cyan
    Write-Host $response.candidates[0].content.parts[0].text -ForegroundColor White
    Write-Host ""
    Write-Host "✨ Your Gemini API key is valid and ready to use!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: API test failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -match "API_KEY_INVALID") {
        Write-Host ""
        Write-Host "🔑 Your API key appears to be invalid." -ForegroundColor Yellow
        Write-Host "Please check: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
    }
    exit 1
}
