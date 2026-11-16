# Abre dev-prep sin ventana negra (lo usa el acceso directo del escritorio).
# 1. Si ya había una versión corriendo, la cierra para arrancar siempre la más reciente.
# 2. Instala dependencias si faltan y compila la interfaz.
# 3. Arranca el servidor oculto y abre el navegador cuando está listo.
#
# Con -SinNavegador (lo usa el arranque automático de Windows) solo deja el motor corriendo:
# la versión web (dev-prep.angel-isasi.com) lo usa para VS Code y los tests en vivo.
param([switch]$SinNavegador)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $raiz
$puerto = 4321
$url = "http://localhost:$puerto"

function Avisar($mensaje) {
  (New-Object -ComObject WScript.Shell).Popup($mensaje, 30, "dev-prep", 48) | Out-Null
}

# Node instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Avisar "No se encontró Node.js. Instálalo desde https://nodejs.org (versión LTS) y vuelve a intentar."
  exit 1
}

# Cierra la versión anterior si estaba abierta (es nuestro propio servidor en el puerto 4321)
$anteriores = Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue
foreach ($conexion in $anteriores) {
  Stop-Process -Id $conexion.OwningProcess -Force -ErrorAction SilentlyContinue
}
if ($anteriores) { Start-Sleep -Milliseconds 600 }

# Dependencias (solo la primera vez; aquí sí se muestra la ventana porque tarda y necesita internet)
if (-not (Test-Path (Join-Path $raiz "node_modules"))) {
  $instalacion = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm install" -WorkingDirectory $raiz -Wait -PassThru
  if ($instalacion.ExitCode -ne 0) {
    Avisar "No se pudieron instalar las dependencias. Revisa tu conexión a internet y vuelve a intentar."
    exit 1
  }
}

# Compila la interfaz (tarda un segundo y así siempre está al día)
$compilacion = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run build" -WorkingDirectory $raiz -WindowStyle Hidden -Wait -PassThru
if ($compilacion.ExitCode -ne 0) {
  Avisar "No se pudo compilar la interfaz. Abre iniciar.bat para ver el error."
  exit 1
}

# Arranca el servidor oculto. Lo que imprime queda en data/servidor.log por si hay que revisar algo.
$datos = Join-Path $raiz "data"
New-Item -ItemType Directory -Force -Path $datos | Out-Null
Start-Process -FilePath "node" -ArgumentList "server/index.js" -WorkingDirectory $raiz -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $datos "servidor.log") -RedirectStandardError (Join-Path $datos "servidor-errores.log")

# Espera a que responda (máximo 30 s) y abre el navegador.
# Se pregunta a 127.0.0.1 y no a localhost: PowerShell prueba primero IPv6 (::1) y el servidor solo escucha en IPv4.
for ($i = 0; $i -lt 60; $i++) {
  try {
    Invoke-WebRequest -Uri "http://127.0.0.1:$puerto/api/ejercicios" -UseBasicParsing -TimeoutSec 1 | Out-Null
    if (-not $SinNavegador) { Start-Process $url }
    exit 0
  } catch {
    Start-Sleep -Milliseconds 500
  }
}
Avisar "dev-prep no arrancó. Revisa data\servidor-errores.log o abre iniciar.bat para ver el error."
exit 1
