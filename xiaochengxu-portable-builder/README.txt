Portable Builder

Usage (default paths):
  Double-click build_portable.bat

Custom source/target:
  powershell -NoProfile -ExecutionPolicy Bypass -File build_portable.ps1 -Source "D:\path\to\xiaochengxu" -OutDir "D:\out\xiaochengxu-portable"

Notes:
  - This script never modifies the original source folder.
  - Requires Node.js and npm on the build machine.
  - It will download pkg's Node runtime on first run.
