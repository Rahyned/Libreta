$ErrorActionPreference = "Stop"

$paths = @(
  "C:\Users\Lau\.cargo\bin",
  "C:\msys64\mingw64\bin"
)

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) { $userPath = "" }

$current = @($userPath -split ";" | Where-Object { $_ })

$toAdd = @()
foreach ($p in $paths) {
  $found = $false
  foreach ($c in $current) {
    if ($c -ieq $p) { $found = $true; break }
  }
  if (-not $found) { $toAdd += $p }
}

if ($toAdd.Count -gt 0) {
  $newPath = (@($current) + @($toAdd)) -join ";"
  [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
  Write-Output ("ADDED: " + ($toAdd -join ", "))
} else {
  Write-Output "Already present"
}
