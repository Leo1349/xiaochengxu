param(
  [Parameter(Position=0)]
  [string]$Message
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

& git rev-parse --is-inside-work-tree | Out-Null

& git add -A

& git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host 'Nothing to commit.'
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "chore: snapshot $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

& git commit -m $Message
Write-Host 'Done.'
