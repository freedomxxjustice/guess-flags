@echo off
echo Starting Cloudflare Tunnel...
start cmd /k "cloudflared tunnel run"

echo Waiting 2 seconds for tunnel to initialize...
timeout /t 2 > nul

echo Starting backend...
start cmd /k "cd server && poetry run python __main__.py"

echo Waiting 2 seconds for backend to initialize...
timeout /t 2 > nul

echo Starting frontend...
start cmd /k "cd client && npm run dev"

echo All services started.