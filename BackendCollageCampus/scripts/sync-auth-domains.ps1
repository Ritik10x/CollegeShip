$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$scriptPath = Join-Path $projectRoot "BackendCollageCampus\scripts\sync-auth-domains.js"
$functionsDir = Join-Path $projectRoot "BackendCollageCampus\functions"

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "BackendCollageCampus\serviceAccountKey.json"))) {
    throw "Missing BackendCollageCampus\serviceAccountKey.json. Add your Firebase service account key before syncing auth domains."
}

Push-Location $functionsDir
try {
    node $scriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "Auth domain sync failed."
    }
}
finally {
    Pop-Location
}

Write-Host "Firebase Auth authorized domains are synchronized."
