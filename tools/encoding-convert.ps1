param(
  [Parameter(Mandatory=$true)][string]$Root,
  [string]$ListPath = $(Join-Path $Root 'encoding-nonutf8.txt'),
  [string]$OutDir = $Root
)

$ErrorActionPreference = 'Stop'

$excludePathFragments = @('\.venv\','\node_modules\')
$excludeFileNames = @('encoding-report.json','encoding-nonutf8.txt','encoding-converted.txt')

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$utf8Strict = [System.Text.UTF8Encoding]::new($false, $true)
$gb18030 = [System.Text.Encoding]::GetEncoding('GB18030')

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

if (-not (Test-Path -LiteralPath $ListPath)) {
  throw "ListPath not found: $ListPath"
}

$paths = Get-Content -LiteralPath $ListPath -ErrorAction Stop | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$converted = 0
$skipped = 0
$counts = @{}
$convertedPaths = New-Object System.Collections.Generic.List[string]

foreach ($path in $paths) {
  $name = [System.IO.Path]::GetFileName($path).ToLowerInvariant()
  if ($excludeFileNames -contains $name) { $skipped++; continue }

  $skip = $false
  foreach ($frag in $excludePathFragments) {
    if ($path.ToLowerInvariant().Contains($frag.ToLowerInvariant())) { $skip = $true; break }
  }
  if ($skip) { $skipped++; continue }

  $bytes = [System.IO.File]::ReadAllBytes($path)
  $bom = Get-BomEncoding $bytes

  $text = $null
  $source = $null

  switch ($bom) {
    'utf8bom' {
      # It's UTF-8 already; leave as-is
      $skipped++
      continue
    }
    'utf16le' {
      $source = 'utf16le'
      $text = [System.Text.Encoding]::Unicode.GetString($bytes, 2, $bytes.Length - 2)
    }
    'utf16be' {
      $source = 'utf16be'
      $text = [System.Text.Encoding]::BigEndianUnicode.GetString($bytes, 2, $bytes.Length - 2)
    }
    'utf32le' {
      $source = 'utf32le'
      $text = [System.Text.Encoding]::UTF32.GetString($bytes, 4, $bytes.Length - 4)
    }
    'utf32be' {
      $source = 'utf32be'
      $enc = [System.Text.Encoding]::GetEncoding('utf-32BE')
      $text = $enc.GetString($bytes, 4, $bytes.Length - 4)
    }
    default {
      # No BOM: if it isn't valid UTF-8, assume GB18030
      try {
        [void]$utf8Strict.GetString($bytes)
        # Valid UTF-8; list might be stale or heuristic; skip
        $skipped++
        continue
      } catch {
        $source = 'gb18030'
        $text = $gb18030.GetString($bytes)
      }
    }
  }

  if ($null -eq $text) {
    $skipped++
    continue
  }

  [System.IO.File]::WriteAllText($path, $text, $utf8NoBom)

  $converted++
  if (-not $counts.ContainsKey($source)) { $counts[$source] = 0 }
  $counts[$source] = [int]$counts[$source] + 1
  $convertedPaths.Add($path) | Out-Null
}

if (-not (Test-Path -LiteralPath $OutDir)) {
  New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
}

$convertedListPath = Join-Path $OutDir 'encoding-converted.txt'
$convertedPaths | Out-File -FilePath $convertedListPath -Encoding UTF8

"Converted=$converted Skipped=$skipped"
"Converted list saved: $convertedListPath"

$counts.GetEnumerator() | Sort-Object Name | ForEach-Object { "From $($_.Name) = $($_.Value)" }
