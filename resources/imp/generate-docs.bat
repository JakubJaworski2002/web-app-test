@echo off
REM Uruchamia pelny zestaw dokumentacji Salon Samochodowy
REM Tworzy katalogi: 03-development-plan, 07-testing, 08-devops,
REM                  09-incidents, 10-reports, 11-skills
REM oraz wszystkie pliki dokumentacji (31 plikow).
REM
REM Uzycie: kliknij dwukrotnie LUB w terminalu:
REM   cd resources\imp
REM   node mk-dirs.js

cd /d "%~dp0"
echo.
echo ====================================================
echo  Salon Samochodowy - Generowanie dokumentacji
echo ====================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [BLAD] Node.js nie jest zainstalowany lub nie jest w PATH.
  echo        Pobierz ze https://nodejs.org/
  pause
  exit /b 1
)

node mk-dirs.js

if %errorlevel% neq 0 (
  echo.
  echo [BLAD] Generowanie nie powiodlo sie. Sprawdz bledy powyzej.
  pause
  exit /b 1
)

echo.
echo ====================================================
echo  Gotowe! Otwieranie katalogu...
echo ====================================================
echo.
explorer "%~dp0"
