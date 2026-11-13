@echo off
rem dev-prep: doble clic para abrir la app.
rem Instala lo que falte, compila la interfaz, arranca el servidor y abre el navegador.

chcp 65001 >nul
title dev-prep (no cierres esta ventana)
cd /d "%~dp0"

set PUERTO=4321
set URL=http://localhost:%PUERTO%

rem 1. Si ya está abierta, solo abre el navegador.
curl -s -o nul "%URL%/api/ejercicios" >nul 2>&1
if %errorlevel%==0 (
  echo dev-prep ya estaba abierto. Abriendo el navegador...
  start "" "%URL%"
  rem Pausa de 2 segundos para que alcances a leer el mensaje
  ping -n 3 127.0.0.1 >nul
  exit /b 0
)

rem 2. Node.js instalado
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo No se encontró Node.js. Instálalo desde https://nodejs.org ^(versión LTS^) y vuelve a intentar.
  echo.
  pause
  exit /b 1
)

rem 3. Dependencias (solo la primera vez, necesita internet)
if not exist "node_modules\" (
  echo Instalando dependencias por primera vez. Esto necesita internet y tarda un par de minutos...
  call npm install
  if errorlevel 1 (
    echo.
    echo No se pudieron instalar las dependencias. Revisa tu conexión y vuelve a intentar.
    pause
    exit /b 1
  )
)

rem 4. Compila la interfaz (tarda un segundo y así siempre está al día)
echo Preparando la interfaz...
call npm run build --silent >nul 2>&1
if errorlevel 1 (
  echo.
  echo No se pudo compilar la interfaz. Corre "npm run build" en esta carpeta para ver el error.
  pause
  exit /b 1
)

rem 5. Arranca el servidor y abre el navegador
set DEVPREP_ABRIR_NAVEGADOR=1
node server\index.js
if errorlevel 1 pause
