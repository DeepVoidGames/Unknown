@echo off
setlocal enabledelayedexpansion

:: Get the git hash
for /f "tokens=*" %%i in ('git rev-parse --short HEAD 2^>nul') do set BUILD_HASH=%%i
if "%BUILD_HASH%"=="" set BUILD_HASH=dev-%date:~-4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%

:: Path to the file
set SETTINGS_FILE=src\pages\Settings.tsx

:: Use PowerShell to replace the hash
powershell -Command "(gc %SETTINGS_FILE%) -replace 'Build: <span className=\"text-primary\">[^<]*</span>', 'Build: <span className=\"text-primary\">%BUILD_HASH%</span>' | Out-File -encoding UTF8 %SETTINGS_FILE%"

echo ✅ Build hash updated to: %BUILD_HASH%
