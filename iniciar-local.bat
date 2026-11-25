@echo off
chcp 65001 >nul
title TECNO ESPACIOS - Servidor local (pruebas)
cd /d "%~dp0"
rem Cambia este numero si el puerto esta ocupado en tu equipo
set PUERTO=8750
rem Segundo puerto interno (el servidor de archivos de Netlify usa 3999 por defecto y a veces esta ocupado)
set PUERTO2=8751
where node >nul 2>nul || (echo Instala Node.js LTS desde https://nodejs.org y vuelve a abrir este archivo. & pause & exit /b 1)
if not exist node_modules (echo Instalando dependencias, solo la primera vez... & call npm install)
echo.
echo  Sitio local:  http://localhost:%PUERTO%
echo  Panel admin:  http://localhost:%PUERTO%/#/admin
echo  Los datos de prueba son LOCALES y no tocan la pagina publicada.
echo  Para detener: cierra esta ventana o pulsa Ctrl+C.
echo.
call npx --yes netlify-cli@latest dev --dir public --functions netlify/functions --port %PUERTO% --staticServerPort %PUERTO2% --offline
pause
