param(
    [string]$SdkRoot = "$env:LOCALAPPDATA\Android\Sdk",
    [string]$CommandLineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip",
    [switch]$Yes
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Green
}

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Find-SdkManager {
    param([string]$Root)

    $candidates = @(
        (Join-Path $Root "cmdline-tools\latest\bin\sdkmanager.bat"),
        (Join-Path $Root "cmdline-tools\bin\sdkmanager.bat")
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

if (-not $env:LOCALAPPDATA) {
    throw "LOCALAPPDATA is not set. Run this script in normal Windows PowerShell."
}

Write-Step "Preparing Android SDK folder"
Ensure-Directory $SdkRoot

$sdkManager = Find-SdkManager $SdkRoot

if (-not $sdkManager) {
    Write-Step "Downloading Android SDK Command-line Tools"
    $tempRoot = Join-Path $env:TEMP "fightwise-android-sdk"
    $zipPath = Join-Path $tempRoot "commandlinetools.zip"
    $extractPath = Join-Path $tempRoot "extract"
    $latestToolsPath = Join-Path $SdkRoot "cmdline-tools\latest"

    Remove-Item $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    Ensure-Directory $tempRoot
    Ensure-Directory $extractPath

    Invoke-WebRequest -Uri $CommandLineToolsUrl -OutFile $zipPath

    Write-Step "Extracting Command-line Tools"
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

    Remove-Item $latestToolsPath -Recurse -Force -ErrorAction SilentlyContinue
    Ensure-Directory (Split-Path $latestToolsPath)
    Move-Item -Path (Join-Path $extractPath "cmdline-tools") -Destination $latestToolsPath

    $sdkManager = Find-SdkManager $SdkRoot
}

if (-not $sdkManager) {
    throw "sdkmanager.bat was not found after installation."
}

Write-Step "Setting SDK environment variables for this PowerShell session"
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$env:Path = "$SdkRoot\platform-tools;$SdkRoot\cmdline-tools\latest\bin;$env:Path"

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "ANDROID_SDK_ROOT=$env:ANDROID_SDK_ROOT"

if (-not $Yes) {
    Write-Host ""
    Write-Host "This will install Android SDK packages and ask sdkmanager to accept Android SDK licenses." -ForegroundColor Yellow
    $answer = Read-Host "Type YES to continue"
    if ($answer -ne "YES") {
        Write-Host "Cancelled."
        exit 1
    }
}

Write-Step "Installing required Android SDK packages"
$packages = @(
    "cmdline-tools;latest",
    "platform-tools",
    "platforms;android-36",
    "build-tools;36.0.0"
)

& $sdkManager --sdk_root=$SdkRoot $packages
if ($LASTEXITCODE -ne 0) {
    throw "sdkmanager package installation failed."
}

Write-Step "Accepting Android SDK licenses"
"y`ny`ny`ny`ny`ny`ny`ny`ny`ny`n" | & $sdkManager --sdk_root=$SdkRoot --licenses
if ($LASTEXITCODE -ne 0) {
    throw "sdkmanager license acceptance failed."
}

Write-Step "Writing android/local.properties"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidDir = Join-Path $projectRoot "android"
$localProperties = Join-Path $androidDir "local.properties"

if (Test-Path $androidDir) {
    $escapedSdkRoot = $SdkRoot.Replace("\", "\\").Replace(":", "\:")
    "sdk.dir=$escapedSdkRoot" | Set-Content -Path $localProperties -Encoding ASCII
    Write-Host "Wrote $localProperties"
} else {
    Write-Host "Android project folder not found. Skipped local.properties." -ForegroundColor Yellow
}

Write-Step "Done"
Write-Host "Now run:"
Write-Host "  npm run android:build:debug" -ForegroundColor Cyan
