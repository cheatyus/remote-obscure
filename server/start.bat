@echo off
title Remote Obscure Server
echo.
echo ========================================
echo   Remote Obscure Server
echo ========================================
echo.
echo Instalando dependencias...
pip install -r requirements.txt
echo.
echo Verificando porta 8765...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :8765 ') DO (
    echo Finalizando processo preso na porta 8765...
    TaskKill.exe /F /PID %%T >nul 2>&1
)

echo Iniciando servidor...
python main.py
pause
