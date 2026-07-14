@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0full_build.ps1" %*
exit /b %ERRORLEVEL%
