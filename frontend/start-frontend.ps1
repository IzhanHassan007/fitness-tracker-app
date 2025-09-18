# Fitness Tracker Frontend Startup Script
Write-Host "🚀 Starting Fitness Tracker Frontend..." -ForegroundColor Green
Write-Host "📍 Location: $(Get-Location)" -ForegroundColor Yellow

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "🌐 Starting Next.js development server..." -ForegroundColor Blue
Write-Host "🔗 Frontend will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

npm run dev
