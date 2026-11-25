@echo off
set PUERTO=8750
set PUERTO2=8751
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PUERTO% ^| findstr LISTENING') do taskkill /PID %%p /F
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%PUERTO2% ^| findstr LISTENING') do taskkill /PID %%p /F
echo Servidor local detenido.
pause
