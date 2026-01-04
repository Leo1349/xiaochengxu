param(
  [Parameter(Mandatory=$true)][string]$Root,
  [string]$OutDir = $Root
)

$ErrorActionPreference = 'Stop'

$IncludePatterns = @(
  '*.js','*.json','*.wxml','*.wxss','*.md','*.txt','*.sh','*.yaml','*.yml','*.ts','*.css','*.html'
)

$utf8Strict = [System.Text.UTF8Encoding]::new($false, $true)

$excludePathFragments = @('\.venv\','\node_modules\')

$excludeFileNames = @('encoding-report.json','encoding-nonutf8.txt','encoding-converted.txt')

function Get-BomEncoding([byte[]]$bytes) {
  if ($bytes.Length -ge 4) {
    if ($bytes[0] -eq 0x00 -and $bytes[1] -eq 0x00 -and $bytes[2] -eq 0xFE -and $bytes[3] -eq 0xFF) { return 'utf32be' }
    if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE -and $bytes[2] -eq 0x00 -and $bytes[3] -eq 0x00) { return 'utf32le' }
  }
  if ($bytes.Length -ge 3) {
    if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { return 'utf8bom' }
  }
  if ($bytes.Length -ge 2) {
    if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) { return 'utf16le' }
    if ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) { return 'utf16be' }
  }
  return $null
}

$files = Get-ChildItem -Path $Root -Recurse -File -Include $IncludePatterns | Where-Object {
  $full = $_.FullName.ToLowerInvariant()
  $name = $_.Name.ToLowerInvariant()
  if ($excludeFileNames -contains $name) { return $false }
  foreach ($frag in $excludePathFragments) {
    if ($full.Contains($frag.ToLowerInvariant())) { return $false }
  }
  return $true
}

$results = foreach ($file in $files) {
  $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
  $bom = Get-BomEncoding $bytes

  $utf8Valid = $true
  if (-not $bom) {
    try { [void]$utf8Strict.GetString($bytes) } catch { $utf8Valid = $false }
  }

  [pscustomobject]@{
    Path     = $file.FullName
    Bom      = $bom
    Utf8Valid= $utf8Valid
    Length   = $bytes.Length
  }
}

$needConvert = @($results | Where-Object { ($_.Bom -and $_.Bom -ne 'utf8bom') -or (-not $_.Bom -and -not $_.Utf8Valid) })

if (-not (Test-Path -LiteralPath $OutDir)) {
  New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
}

$reportPath = Join-Path $OutDir 'encoding-report.json'
$nonUtf8ListPath = Join-Path $OutDir 'encoding-nonutf8.txt'

$results | ConvertTo-Json -Depth 2 | Out-File -FilePath $reportPath -Encoding UTF8
$needConvert | Select-Object -ExpandProperty Path | Out-File -FilePath $nonUtf8ListPath -Encoding UTF8

"Scanned=$($results.Count) Utf8Bom=$(( $results | Where-Object Bom -eq 'utf8bom').Count) NeedConvert=$($needConvert.Count)"
"NonUTF8 list saved: $nonUtf8ListPath"
"Full report saved: $reportPath"

if ($needConvert.Count -gt 0) {
  $needConvert | Select-Object -First 50 Path,Bom,Utf8Valid,Length | Format-Table -AutoSize
}
