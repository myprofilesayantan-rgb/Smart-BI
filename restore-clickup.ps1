# Revert ClickUp Design System Styles Revisions
# This script copies the pre-ClickUp style versions back into place.

$backupDir = Join-Path $PSScriptRoot "backup-clickup-tokens"

if (-not (Test-Path $backupDir)) {
    Write-Error "Backup directory not found at $backupDir. Cannot revert files."
    exit 1
}

$files = @(
    "index.html",
    "mindmap.html",
    "wireframe.html",
    "design-system.html",
    "figma-design.html",
    "tokens-preview.html",
    "prototype.html",
    "tokens.json",
    "tokens.css"
)

Write-Host "Reverting design tokens and pages to baseline..." -ForegroundColor Cyan

foreach ($f in $files) {
    $src = Join-Path $backupDir $f
    $dest = Join-Path $PSScriptRoot $f
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Force
        Write-Host "Reverted: $f" -ForegroundColor Green
    }
}

# Revert components files
$jsSrc = Join-Path $backupDir "components\tokens-data.js"
$jsDest = Join-Path $PSScriptRoot "components\tokens-preview\tokens-data.js"
if (Test-Path $jsSrc) {
    Copy-Item -Path $jsSrc -Destination $jsDest -Force
    Write-Host "Reverted: components/tokens-preview/tokens-data.js" -ForegroundColor Green
}

$cssSrc = Join-Path $backupDir "components\tokens-preview\tokens-preview.css"
$cssDest = Join-Path $PSScriptRoot "components\tokens-preview\tokens-preview.css"
if (Test-Path $cssSrc) {
    Copy-Item -Path $cssSrc -Destination $cssDest -Force
    Write-Host "Reverted: components/tokens-preview/tokens-preview.css" -ForegroundColor Green
}

Write-Host "Revert completed successfully! Project is back to original styling." -ForegroundColor Green
