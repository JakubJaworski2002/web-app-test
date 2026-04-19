@echo off
set BASE=%~dp0
mkdir "%BASE%07-testing" 2>nul
mkdir "%BASE%09-incidents" 2>nul
mkdir "%BASE%10-reports" 2>nul
type nul > "%BASE%07-testing\.gitkeep"
type nul > "%BASE%09-incidents\.gitkeep"
type nul > "%BASE%10-reports\.gitkeep"
echo Done. Directories created:
echo   %BASE%07-testing
echo   %BASE%09-incidents
echo   %BASE%10-reports
pause
