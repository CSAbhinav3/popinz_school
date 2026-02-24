@echo off
cd /d "%~dp0"
echo Starting frontend...
call npm run dev
pause
