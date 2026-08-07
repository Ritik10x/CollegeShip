# One-time cleanup: remove all Gmail secret versions from Secret Manager (stops billing).
# Safe after functions use BackendCollageCampus/functions/.env instead of defineSecret.
$ErrorActionPreference = "Stop"
$project = "collage-campus1"
$secrets = @(
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REFRESH_TOKEN",
    "GMAIL_USER"
)

foreach ($name in $secrets) {
    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    $meta = & firebase functions:secrets:get $name --project $project 2>&1 | Out-String
    if ($meta -match "Secret not found|NOT_FOUND|404") {
        Write-Host "Already removed."
        continue
    }

    $versions = ($meta -split "`n" | ForEach-Object {
        if ($_ -match 'ENABLED' -and $_ -match '(\d+)') { [int]$matches[1] }
    } | Sort-Object -Descending -Unique)
    if (-not $versions -or $versions.Count -eq 0) {
        Write-Host "No versions found."
        continue
    }

    Write-Host "Destroying $($versions.Count) version(s)..."
    foreach ($version in $versions) {
        Write-Host "  - version $version"
        & firebase functions:secrets:destroy "${name}@${version}" --project $project --force 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Could not destroy ${name}@${version} (may already be gone)"
        }
    }
}

Write-Host "`nPruning unused secrets..." -ForegroundColor Cyan
& firebase functions:secrets:prune --project $project --force
Write-Host "Done. Verify at: https://console.cloud.google.com/security/secret-manager?project=$project"
