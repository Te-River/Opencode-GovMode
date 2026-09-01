#
# Opencode Gov Mode - One-click installer for Windows
#
# Usage (PowerShell):
#   irm https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.ps1 | iex
#
# Or run locally:
#   .\install.ps1
#

#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# Package name
$Package = "@te-river/opencode-gov-mode@latest"

Write-Host ""
Write-Host "🏛️  Opencode Gov Mode Installer" -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = & node -v 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
} catch {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js ≥ 18 from https://nodejs.org/"
    exit 1
}

# Check Node.js version
$majorVersion = [int]($nodeVersion -replace 'v', '' -split '\.' | Select-Object -First 1)
if ($majorVersion -lt 18) {
    Write-Host "❌ Node.js version must be ≥ 18. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green

# Install the package globally
Write-Host ""
Write-Host "📦 Installing $Package..." -ForegroundColor Yellow
& npm install -g $Package

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install package" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Package installed successfully" -ForegroundColor Green

# Find opencode config file
$configFile = $null
$userConfigDir = Join-Path $env:USERPROFILE ".config\opencode"
$projectConfig = Get-Location

# Check user config directory
if (Test-Path (Join-Path $userConfigDir "opencode.jsonc")) {
    $configFile = Join-Path $userConfigDir "opencode.jsonc"
} elseif (Test-Path (Join-Path $userConfigDir "opencode.json")) {
    $configFile = Join-Path $userConfigDir "opencode.json"
}

# Check project directory
if (-not $configFile) {
    if (Test-Path "opencode.jsonc") {
        $configFile = "opencode.jsonc"
    } elseif (Test-Path "opencode.json") {
        $configFile = "opencode.json"
    }
}

# Create config if it doesn't exist
if (-not $configFile) {
    Write-Host "📝 Creating opencode.jsonc in current directory..." -ForegroundColor Yellow
    $configContent = @'
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "@te-river/opencode-gov-mode@latest"
  ]
}
'@
    Set-Content -Path "opencode.jsonc" -Value $configContent
    $configFile = "opencode.jsonc"
    Write-Host "✓ Created $configFile" -ForegroundColor Green
} else {
    Write-Host "✓ Found config file: $configFile" -ForegroundColor Green
    
    # Check if plugin is already configured
    $configContent = Get-Content -Path $configFile -Raw
    if ($configContent -match "@te-river/opencode-gov-mode") {
        Write-Host "✓ Plugin already configured in $configFile" -ForegroundColor Green
    } else {
        Write-Host "📝 Adding plugin to $configFile..." -ForegroundColor Yellow
        
        # Backup original config
        Copy-Item -Path $configFile -Destination "$configFile.backup" -Force
        
        # Add plugin to config
        if ($configFile -match '\.jsonc$') {
            # For JSONC files, insert before the closing brace
            $configContent = $configContent -replace '\}', ', "plugin": ["@te-river/opencode-gov-mode@latest"]}'
        } else {
            # For JSON files, try to parse and add
            try {
                $config = $configContent | ConvertFrom-Json
                if (-not $config.plugin) {
                    $config | Add-Member -NotePropertyName "plugin" -NotePropertyValue @("@te-river/opencode-gov-mode@latest")
                } else {
                    $config.plugin += "@te-river/opencode-gov-mode@latest"
                }
                $configContent = $config | ConvertTo-Json -Depth 10
            } catch {
                Write-Host "⚠️  Could not parse JSON. Please manually add the following:" -ForegroundColor Yellow
                Write-Host '  "plugin": ["@te-river/opencode-gov-mode@latest"]'
            }
        }
        
        Set-Content -Path $configFile -Value $configContent
        Write-Host "✓ Plugin added to config" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🏛️  Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:" -ForegroundColor Blue
Write-Host "  1. Restart OpenCode Desktop"
Write-Host "  2. The Emperor (君主) will be your default agent"
Write-Host "  3. Use slash commands to interact with the hierarchy:"
Write-Host "     - /gov-reign <task> — Full imperial workflow" -ForegroundColor Green
Write-Host "     - /gov-decree <task> — Issue an imperial decree" -ForegroundColor Green
Write-Host "     - /gov-report — View status report" -ForegroundColor Green
Write-Host "     - /gov-endorse <finding> — Approve/reject findings" -ForegroundColor Green
Write-Host ""
Write-Host "Agent Picker:" -ForegroundColor Blue
Write-Host "  - @monarch — Emperor (君主)"
Write-Host "  - @prime-minister — Prime Minister (宰相)"
Write-Host "  - @ministry-* — Six Ministries (六部)"
Write-Host "  - @regional-governor — Regional Governor (地方官)"
Write-Host "  - @local-official — Local Official (基层官员)"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Blue
Write-Host "  https://github.com/Te-River/Opencode-GovMode"
Write-Host ""
