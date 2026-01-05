param(
  [string]$Name,
  [string]$Email,
  [switch]$Global,
  [switch]$SkipLineEndings,
  [switch]$SkipEncoding
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

& git rev-parse --is-inside-work-tree | Out-Null

$scopeArgs = @()
if ($Global) {
  $scopeArgs = @('--global')
}

function Get-GitConfigValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Key
  )

  $value = (& git config @scopeArgs --get $Key 2>$null)
  if ($LASTEXITCODE -ne 0) { return '' }
  return ($value | Out-String).Trim()
}

function Set-GitConfigValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Key,
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  & git config @scopeArgs $Key $Value | Out-Null
}

if (-not [string]::IsNullOrWhiteSpace($Name)) {
  Set-GitConfigValue -Key 'user.name' -Value $Name
}

if (-not [string]::IsNullOrWhiteSpace($Email)) {
  Set-GitConfigValue -Key 'user.email' -Value $Email
}

if (-not $SkipLineEndings) {
  # Windows 下常用配置：自动检出 CRLF，提交时转 LF，并在可疑转换时警告。
  Set-GitConfigValue -Key 'core.autocrlf' -Value 'true'
  Set-GitConfigValue -Key 'core.safecrlf' -Value 'warn'
}

if (-not $SkipEncoding) {
  # 避免中文路径/日志显示为转义。
  Set-GitConfigValue -Key 'core.quotepath' -Value 'false'
  Set-GitConfigValue -Key 'i18n.commitEncoding' -Value 'utf-8'
  Set-GitConfigValue -Key 'i18n.logOutputEncoding' -Value 'utf-8'
}

$finalName = Get-GitConfigValue -Key 'user.name'
$finalEmail = Get-GitConfigValue -Key 'user.email'

Write-Host ('Configured scope: {0}' -f ($(if ($Global) { 'global' } else { 'local (repo)' })))
Write-Host ('user.name:  {0}' -f $(if ([string]::IsNullOrWhiteSpace($finalName)) { '<NOT SET>' } else { $finalName }))
Write-Host ('user.email: {0}' -f $(if ([string]::IsNullOrWhiteSpace($finalEmail)) { '<NOT SET>' } else { $finalEmail }))
Write-Host 'Done.'
