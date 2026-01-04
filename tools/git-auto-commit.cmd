@echo off
setlocal enabledelayedexpansion

REM Auto stage and commit all changes.
REM Usage:
REM   tools\git-auto-commit.cmd "your commit message"
REM If no message is provided, a timestamped snapshot message is used.

cd /d "%~dp0\.." || (echo Failed to cd to repo root & exit /b 1)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo Not a git repository. Run "git init" first.
  exit /b 1
)

git add -A
if errorlevel 1 (
  echo git add failed.
  exit /b 1
)

git diff --cached --quiet
if %errorlevel%==0 (
  echo Nothing to commit.
  exit /b 0
)

set "MSG=%*"
if "%MSG%"=="" (
  set "MSG=chore: snapshot %date% %time%"
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo git commit failed. Possibly nothing to commit.
  exit /b 1
)

echo Done.
exit /b 0
