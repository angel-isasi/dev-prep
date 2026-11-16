# Arranque automático de dev-prep al iniciar sesión en Windows, oculto y sin abrir el navegador.
#   npm run arranque:activar  -> crea el acceso en la carpeta Inicio de Windows
#   npm run arranque:quitar   -> lo borra
# Usa scripts/abrir.ps1 -SinNavegador. Consume unos 100 MB de memoria y casi nada de procesador.
param([ValidateSet("activar", "quitar")] [string]$accion = "activar")

$raiz = Split-Path -Parent $PSScriptRoot
$inicio = [Environment]::GetFolderPath("Startup")
$ruta = Join-Path $inicio "dev-prep (motor).lnk"

if ($accion -eq "quitar") {
  if (Test-Path $ruta) { Remove-Item -LiteralPath $ruta }
  Write-Host "Arranque automático quitado. dev-prep ya no se abrirá solo al prender la laptop."
  exit 0
}

$shell = New-Object -ComObject WScript.Shell
$acceso = $shell.CreateShortcut($ruta)
$acceso.TargetPath = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$acceso.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"" + (Join-Path $raiz "scripts\abrir.ps1") + "`" -SinNavegador"
$acceso.WorkingDirectory = $raiz
$acceso.IconLocation = (Join-Path $raiz "client\public\dev-prep.ico") + ",0"
$acceso.Description = "dev-prep en segundo plano (VS Code y tests para la versión web)"
$acceso.WindowStyle = 7
$acceso.Save()
Write-Host "Arranque automático activado: $ruta"
