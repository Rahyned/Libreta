$ErrorActionPreference = "SilentlyContinue"

$names = @("movie-libreta", "Libreta de Peliculas", "Libreta de Películas")
$found = @()

foreach ($n in $names) {
  $ps = Get-Process -Name $n -ErrorAction SilentlyContinue
  foreach ($p in $ps) {
    $found += "{0} (PID {1})" -f $p.ProcessName, $p.Id
  }
}

# also node/vite that might be the tauri dev server (only report, do not kill)
$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue

if ($found.Count -gt 0) {
  Write-Output "LOCKING-APPS:"
  $found
} else {
  Write-Output "No movie-libreta process running."
}
Write-Output "node process count: $($nodeProcs.Count)"
