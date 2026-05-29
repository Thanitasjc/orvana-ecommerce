@echo off
cd /d "%~dp0.."
echo === Push orvana-ecommerce to GitHub ===
where gh >nul 2>&1
if errorlevel 1 (
    echo GitHub CLI (gh) not found. Install from: https://cli.github.com/
    pause
    exit /b 1
)
gh auth status >nul 2>&1
if errorlevel 1 (
    echo Login to GitHub first...
    gh auth login --hostname github.com --git-protocol https --web
)
gh auth setup-git
git push -u origin main
if errorlevel 1 (
    echo Push failed. Check login and try again.
    pause
    exit /b 1
)
echo Done: https://github.com/Thanitasjc/orvana-ecommerce
pause
