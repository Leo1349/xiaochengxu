param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')),
  [switch]$SkipQuickstart
)

$ErrorActionPreference = 'Stop'

$cloudfunctionsPath = Join-Path $Root 'cloudfunctions'
if (-not (Test-Path -LiteralPath $cloudfunctionsPath)) {
  throw ('cloudfunctions folder not found: {0}' -f $cloudfunctionsPath)
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm not found. Please install Node.js and ensure npm is on PATH.'
}

Write-Host ('Root: {0}' -f $Root)
Write-Host ('Cloudfunctions: {0}' -f $cloudfunctionsPath)

$functionDirs = Get-ChildItem -LiteralPath $cloudfunctionsPath -Directory | Sort-Object Name

foreach ($dir in $functionDirs) {
  if ($SkipQuickstart -and $dir.Name -eq 'quickstartFunctions') {
    Write-Host ('Skip: {0}' -f $dir.Name)
    continue
  }

  $pkg = Join-Path $dir.FullName 'package.json'
  if (-not (Test-Path -LiteralPath $pkg)) {
    Write-Host ('Skip (no package.json): {0}' -f $dir.Name)
    continue
  }

  Write-Host ''
  Write-Host ('==> Installing: {0}' -f $dir.Name)

  Push-Location $dir.FullName
  try {
    npm install
  }
  finally {
    Pop-Location
  }
}

Write-Host ''
Write-Host 'Done.'
