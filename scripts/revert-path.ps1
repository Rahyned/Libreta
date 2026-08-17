$ErrorActionPreference = "Stop"

$remove = @(
  "C:\Users\Lau\.cargo\bin",
  "C:\msys64\mingw64\bin"
)

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) { $userPath = "" }

$current = @($userPath -split ";" | Where-Object { $_ })

$newList = @()
foreach ($c in $current) {
  $shouldRemove = $false
  foreach ($r in $remove) {
    if ($c.TrimEnd("\") -ieq $r.TrimEnd("\")) { $shouldRemove = $true; break }
  }
  if (-not $shouldRemove) { $newList += $c }
}

$newPath = ($newList -join ";")
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")
Write-Output ("Removed " + ($current.Count - $newList.Count) + " entrie(s). Remaining: " + $newList.Count)
