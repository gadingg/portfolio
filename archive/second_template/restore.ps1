# Restore Second Template Script
$baseDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $baseDir) { $baseDir = Get-Location }

Write-Host "Restoring Second Template files..." -ForegroundColor Cyan

# 1. Restore HTML files
Copy-Item "$PSScriptRoot\second.html" -Destination "$baseDir\second.html" -Force
Copy-Item "$PSScriptRoot\public\second.html" -Destination "$baseDir\public\second.html" -Force

# 2. Restore app/second route
New-Item -ItemType Directory -Force -Path "$baseDir\app\second" | Out-Null
Copy-Item "$PSScriptRoot\app\second\*" -Destination "$baseDir\app\second\" -Recurse -Force

# 3. Restore components/public
New-Item -ItemType Directory -Force -Path "$baseDir\components\public\cards" | Out-Null
Copy-Item "$PSScriptRoot\components\public\*" -Destination "$baseDir\components\public\" -Recurse -Force

Write-Host "Second Template files restored successfully!" -ForegroundColor Green
