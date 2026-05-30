@echo off
title Protocol — Dev Server
cd /d "%~dp0"
echo.
echo  ╔══════════════════════════════════════╗
echo  ║    Protocol — Local Dev Server       ║
echo  ║    http://localhost:3000             ║
echo  ╚══════════════════════════════════════╝
echo.
echo  [*] Starting with auto-reload (nodemon)...
echo  [*] Press Ctrl+C to stop
echo.
npm run dev
pause
