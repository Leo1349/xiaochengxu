param(
    [string]$Source = "e:\Users\Administrator\Desktop\xiaochengxu",
    [string]$OutDir = "e:\Users\Administrator\Desktop\xiaochengxu-portable"
)

$ErrorActionPreference = 'Stop'

function Ensure-Dir([string]$Path) {
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function Write-File([string]$Path, [string]$Content) {
    $dir = Split-Path -Parent $Path
    Ensure-Dir $dir
    Set-Content -Path $Path -Value $Content -Encoding ascii
}

function Patch-ApiJs([string]$Path) {
    $content = Get-Content -Path $Path -Raw -Encoding utf8
    $content = $content -replace "const PROXY_URL = 'http://localhost:3001/api/cloud'", "const PROXY_URL = '/api/cloud'"
    $content = $content -replace "axios.post\('http://localhost:3001/api/upload'", "axios.post('/api/upload'"
    $content = $content -replace "axios.post\('http://localhost:3001/api/refresh-url'", "axios.post('/api/refresh-url'"
    Set-Content -Path $Path -Value $content -Encoding utf8
}

function Patch-ServerJs([string]$Path) {
    $content = Get-Content -Path $Path -Raw -Encoding utf8
    if ($content -match "const basePath = isPkg") {
        Set-Content -Path $Path -Value $content -Encoding utf8
        return
    }

    $insertAfterApp = @"
const app = express()

// When packaged, assets live next to the exe; otherwise use repo root
const isPkg = typeof process.pkg !== 'undefined'
const basePath = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname, '..')
const distDir = path.join(basePath, 'dist')
const uploadDir = path.join(basePath, 'uploads')

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}
"@
    $content = $content -replace "const app = express\(\)\r?\n", $insertAfterApp

    $content = $content -replace "dest: 'uploads/',", "dest: uploadDir,"

    $staticBlock = @"
app.use(express.json())

// Serve built frontend if available
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir))
}
"@
    $content = $content -replace "app\.use\(express\.json\(\)\)\r?\n", $staticBlock

    $spaBlock = @"
// SPA fallback (only when dist exists)
if (fs.existsSync(distDir)) {
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api') || req.path === '/health') {
            return res.status(404).json({ success: false, error: 'Not Found' })
        }
        res.sendFile(path.join(distDir, 'index.html'))
    })
}
"@
    $content = $content -replace "app\.listen\(", "$spaBlock`napp.listen("

    Set-Content -Path $Path -Value $content -Encoding utf8
}

function Run-Command([string]$Command, [string]$WorkDir) {
    Write-Host "> $Command"
    $p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $Command -WorkingDirectory $WorkDir -NoNewWindow -PassThru -Wait
    $isRobo = $Command.TrimStart().ToLower().StartsWith("robocopy")
    $ok = if ($isRobo) { $p.ExitCode -le 7 } else { $p.ExitCode -eq 0 }
    if (-not $ok) {
        throw "Command failed with exit code $($p.ExitCode): $Command"
    }
}

if (-not (Test-Path $Source)) {
    throw "Source not found: $Source"
}

Ensure-Dir $OutDir
$buildDir = Join-Path $OutDir '_build'
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
}
Ensure-Dir $buildDir

$srcAdmin = Join-Path $Source 'admin-panel'
$dstAdmin = Join-Path $buildDir 'admin-panel'

Run-Command "robocopy `"$srcAdmin`" `"$dstAdmin`" /E /XD node_modules dist /XF package-lock.json" $Source

$apiPath = Join-Path $dstAdmin 'src\services\api.js'
$serverPath = Join-Path $dstAdmin 'server\index.js'
Patch-ApiJs $apiPath
Patch-ServerJs $serverPath

Run-Command "cmd /c if exist node_modules rmdir /s /q node_modules" $dstAdmin
Run-Command "npm install" $dstAdmin
Run-Command "npm run build" $dstAdmin

$distOut = Join-Path $OutDir 'dist'
if (Test-Path $distOut) {
    Remove-Item -Recurse -Force $distOut
}
$distSrc = Join-Path $dstAdmin 'dist'
Run-Command ("robocopy `"{0}`" `"{1}`" /E" -f $distSrc, $distOut) $OutDir

$serverDir = Join-Path $dstAdmin 'server'
Run-Command "npm install" $serverDir
Run-Command "npx pkg index.js --target node18-win-x64 --output `"$OutDir\admin-proxy.exe`"" $serverDir

$srcEnv = Join-Path $serverDir '.env'
$srcEnvExample = Join-Path $serverDir '.env.example'
$dstEnv = Join-Path $OutDir '.env'
if (Test-Path $srcEnv) {
    Copy-Item $srcEnv $dstEnv -Force
} else {
    Copy-Item $srcEnvExample $dstEnv -Force
}

$startBat = @"
@echo off
chcp 65001 >nul
cd /d %~dp0
start "admin-proxy" "%~dp0admin-proxy.exe"
timeout /t 2 /nobreak >nul
start http://localhost:3001/
"@
Write-File (Join-Path $OutDir 'start.bat') $startBat

if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
}

Write-Host "Portable package generated at: $OutDir"
