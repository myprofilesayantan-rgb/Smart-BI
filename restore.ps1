# Restore Smart BI Original Styles from Backup
# This script reverts all tokenized stylesheets and index.html back to their original baseline versions.

$backupDir = Join-Path $PSScriptRoot "backup"

if (-not (Test-Path $backupDir)) {
    Write-Error "Backup directory not found at $backupDir. Cannot restore files."
    exit 1
}

# Define mapping: backup filename -> target relative path
$fileMap = @{
    "index.html"     = "index.html"
    "mindmap.html"   = "mindmap.html"
    "smart-bi.css"   = "smart-bi.css"
    "nav.css"        = "components/nav/nav.css"
    "hero.css"       = "components/hero/hero.css"
    "discover.css"   = "components/discover/discover.css"
    "goal.css"       = "components/goal/goal.css"
    "process.css"    = "components/process/process.css"
    "footer.css"     = "components/footer/footer.css"
}

Write-Host "Starting restoration of original stylesheets..." -ForegroundColor Cyan

foreach ($srcFile in $fileMap.Keys) {
    $srcPath = Join-Path $backupDir $srcFile
    $destPath = Join-Path $PSScriptRoot $fileMap[$srcFile]

    if (Test-Path $srcPath) {
        # Create directory if it doesn't exist
        $destDir = Split-Path $destPath
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }

        Copy-Item -Path $srcPath -Destination $destPath -Force
        Write-Host "Restored: $($fileMap[$srcFile])" -ForegroundColor Green
    } else {
        Write-Warning "Backup file not found: $srcPath"
    }
}

Write-Host "Restoration complete! Smart BI is back to its original baseline state." -ForegroundColor Green
