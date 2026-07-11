$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$envPath = Join-Path $projectRoot "BackendCollageCampus\.env"
$firebaseProject = "collage-campus1"
$requiredSecrets = @(
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REFRESH_TOKEN",
    "GMAIL_USER"
)

if (-not (Test-Path -LiteralPath $envPath)) {
    throw "Missing $envPath. Create it before deploying."
}

$values = @{}
foreach ($line in Get-Content -LiteralPath $envPath) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }

    $parts = $trimmed -split "=", 2
    if ($parts.Count -ne 2) { continue }

    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    $values[$name] = $value
}

foreach ($name in $requiredSecrets) {
    if (-not $values.ContainsKey($name) -or [string]::IsNullOrWhiteSpace($values[$name])) {
        throw "Required secret $name is missing from $envPath"
    }
}

if ($values["GMAIL_USER"] -ne "collageship007@gmail.com") {
    throw "GMAIL_USER must be collageship007@gmail.com for this deployment."
}

$tempDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("collageship-secrets-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tempDirectory | Out-Null

try {
    foreach ($name in $requiredSecrets) {
        $secretFile = Join-Path $tempDirectory $name
        [System.IO.File]::WriteAllText($secretFile, $values[$name], [System.Text.UTF8Encoding]::new($false))

        Write-Host "Updating Firebase secret $name..."
        & firebase functions:secrets:set $name --data-file $secretFile --project $firebaseProject --force
        if ($LASTEXITCODE -ne 0) {
            throw "Firebase failed to update $name"
        }
    }
}
finally {
    if (Test-Path -LiteralPath $tempDirectory) {
        Remove-Item -LiteralPath $tempDirectory -Recurse -Force
    }
}

Write-Host "Firebase Gmail secrets are synchronized."
