param(
  [ValidateSet('CurrentUserAllHosts','CurrentUserCurrentHost','AllUsersAllHosts','AllUsersCurrentHost')]
  [string]$TargetProfile = 'CurrentUserAllHosts'
)

$ErrorActionPreference = 'Stop'

$profilePath = $PROFILE.$TargetProfile
if ([string]::IsNullOrWhiteSpace($profilePath)) {
  throw "Unable to resolve profile path for target: $TargetProfile"
}

$profileDir = Split-Path -Parent $profilePath
if (-not (Test-Path $profileDir)) {
  New-Item -ItemType Directory -Force -Path $profileDir | Out-Null
}

if (-not (Test-Path $profilePath)) {
  New-Item -ItemType File -Force -Path $profilePath | Out-Null
}

$start = '# >>> git_backup >>>'
$end = '# <<< git_backup <<<'

$block = @'
# >>> git_backup >>>
function git_backup {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
  )

  $repoRoot = (& git rev-parse --show-toplevel 2>$null)
  if ([string]::IsNullOrWhiteSpace($repoRoot)) {
    throw 'Not inside a git repository. Please cd into your repo first.'
  }

  $cmd = Join-Path $repoRoot 'tools\git_backup.cmd'
  if (-not (Test-Path $cmd)) {
    throw ("git_backup wrapper not found: {0}" -f $cmd)
  }

  & $cmd @Args
}
# <<< git_backup <<<
'@

$content = Get-Content -Raw -ErrorAction SilentlyContinue -Path $profilePath
if ($null -eq $content) { $content = '' }

$pattern = '(?s)' + [regex]::Escape($start) + '.*?' + [regex]::Escape($end)
if ($content -match $pattern) {
  $newContent = [regex]::Replace($content, $pattern, $block.TrimEnd())
  Set-Content -Encoding UTF8 -NoNewline -Path $profilePath -Value $newContent
} else {
  $suffix = if ($content.EndsWith("`n") -or $content.Length -eq 0) { '' } else { "`r`n" }
  Add-Content -Encoding UTF8 -Path $profilePath -Value ($suffix + "`r`n" + $block)
}

Write-Host "Updated PowerShell profile: $profilePath"
