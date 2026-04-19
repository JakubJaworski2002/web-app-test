@echo off
set BASE=%~dp0
mkdir "%BASE%02-agents" 2>nul
mkdir "%BASE%03-development-plan" 2>nul
mkdir "%BASE%04-design" 2>nul
mkdir "%BASE%05-backend-improvements" 2>nul
mkdir "%BASE%06-frontend-improvements" 2>nul
mkdir "%BASE%08-devops" 2>nul
mkdir "%BASE%11-skills" 2>nul
type nul > "%BASE%02-agents\.gitkeep"
type nul > "%BASE%03-development-plan\.gitkeep"
type nul > "%BASE%04-design\.gitkeep"
type nul > "%BASE%05-backend-improvements\.gitkeep"
type nul > "%BASE%06-frontend-improvements\.gitkeep"
type nul > "%BASE%08-devops\.gitkeep"
type nul > "%BASE%11-skills\.gitkeep"
echo Done. Directories created:
echo   %BASE%02-agents
echo   %BASE%03-development-plan
echo   %BASE%04-design
echo   %BASE%05-backend-improvements
echo   %BASE%06-frontend-improvements
echo   %BASE%08-devops
echo   %BASE%11-skills
echo.
echo Generating agent documentation files...
node "%~dp0..\..\setup-agents.js"
pause
