@echo off
setlocal

REM Wrapper for "git_backup" on Windows.
REM Stages all changes and creates a snapshot commit.
REM Usage:
REM   tools\git_backup.cmd "optional message"

cd /d "%~dp0\.." || (echo Failed to cd to repo root & exit /b 1)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0git-auto-commit.ps1" %*
