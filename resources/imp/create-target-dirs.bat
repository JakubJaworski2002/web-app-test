@echo off
setlocal enabledelayedexpansion
set BASE=%~dp0
mkdir "%BASE%00-project-charter" 2>nul
mkdir "%BASE%01-architecture" 2>nul
type nul > "%BASE%00-project-charter\.gitkeep"
type nul > "%BASE%01-architecture\.gitkeep"
echo Done. Directories created:
echo   %BASE%00-project-charter
echo   %BASE%01-architecture
dir "%BASE%00-project-charter"
dir "%BASE%01-architecture"
