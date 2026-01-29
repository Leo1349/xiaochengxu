@echo off
chcp 65001 >nul
cd /d %~dp0
start "admin-proxy" "%~dp0admin-proxy.exe"
timeout /t 2 /nobreak >nul
start http://localhost:3001/
