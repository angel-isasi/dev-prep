# Crea el acceso directo "dev-prep" en el escritorio (npm run acceso-directo).
# Usa scripts/abrir.ps1, que arranca la app sin ventana negra.
$raiz = Split-Path -Parent $PSScriptRoot
$escritorio = [Environment]::GetFolderPath("Desktop")
$ruta = Join-Path $escritorio "dev-prep.lnk"

$shell = New-Object -ComObject WScript.Shell
$acceso = $shell.CreateShortcut($ruta)
$acceso.TargetPath = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$acceso.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"" + (Join-Path $raiz "scripts\abrir.ps1") + "`""
$acceso.WorkingDirectory = $raiz
$acceso.IconLocation = (Join-Path $raiz "client\public\dev-prep.ico") + ",0"
$acceso.Description = "Abrir dev-prep"
$acceso.WindowStyle = 7  # minimizada: casi no se ve nada al abrir
$acceso.Save()

Write-Host "Acceso directo creado en: $ruta"
