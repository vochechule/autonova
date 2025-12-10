@echo off
echo ========================================
echo   Carta Autobazar - Local Startup
echo ========================================
echo.
echo Starting Backend...
cd backend
start cmd /k "npm run start:dev"
timeout /t 5
echo.
echo Starting Frontend...
cd ..\frontend
start cmd /k "npm run dev"
echo.
echo ========================================
echo   Application Starting!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Login credentials:
echo   admin@carta.cz / demo123
echo   dealer@carta.cz / demo123
echo   user@carta.cz / demo123
echo.
echo Press any key to exit this window...
pause > nul
