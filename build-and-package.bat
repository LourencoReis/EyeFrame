@echo off
echo 🔨 Building Warframe Overlay...
npm run package

echo 📦 Creating distribution package...
powershell -Command "Compress-Archive -Path 'dist\eyeframe-win32-x64' -DestinationPath 'dist\WarframeOverlay-v1.0.zip' -Force"

echo ✅ Build complete! 
echo 📁 Your distributable file is at: dist\WarframeOverlay-v1.0.zip
pause