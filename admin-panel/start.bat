@echo off
chcp 65001 >nul
echo ========================================
echo   启动后端管理平台
echo ========================================
echo.

:: 启动代理服务器
echo [1/2] 启动代理服务器 (端口 3001)...
start "代理服务器" cmd /k "cd /d %~dp0server && node index.js"

:: 等待代理服务器启动
timeout /t 2 /nobreak >nul

:: 启动前端开发服务器
echo [2/2] 启动前端服务 (端口 5173)...
start "前端服务" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo   服务已启动！
echo   前端地址: http://localhost:5173/
echo   代理地址: http://localhost:3001/
echo ========================================
echo.
echo 按任意键打开管理后台...
pause >nul
start http://localhost:5173/
