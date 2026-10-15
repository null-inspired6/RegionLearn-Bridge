@echo off
title RegionLearn-Bridge Local Server
echo ========================================================
echo   Starting RegionLearn-Bridge on http://localhost:8000
echo   Enabling full microphone & Web Speech API access...
echo ========================================================
echo.
start http://localhost:8000
python -m http.server 8000
pause
