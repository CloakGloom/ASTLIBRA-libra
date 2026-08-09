@echo off
title ASTLIBRA 天平配平优化器
echo ==============================
echo   ASTLIBRA 天平配平优化器
echo   启动中... 端口 5555
echo ==============================
call npm install --silent 2>nul
call npm run dev
pause
