param(
  [Parameter(Position=0)]
  [string]$Message
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

& git rev-parse --is-inside-work-tree | Out-Null

$gitUserName = (& git config --get user.name 2>$null | Out-String).Trim()
$gitUserEmail = (& git config --get user.email 2>$null | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($gitUserName) -or [string]::IsNullOrWhiteSpace($gitUserEmail)) {
  throw "Git user.name/user.email 未配置。请先运行：tools\\setup-git-config.ps1 -Name \"你的名字\" -Email \"you@example.com\""
}

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

