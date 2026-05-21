@echo off
chcp 65001 >nul
echo ============================================
echo  智能健康坐垫 - 打包 Android APK
echo ============================================
echo.
echo 打包方式：EAS Build（云端打包，约10-15分钟）
echo 打包完成后会提供 APK 下载链接
echo.

echo [1/2] 登录 Expo 账号...
echo （如果没有账号，请先去 https://expo.dev 注册）
echo.
npx eas-cli login
if errorlevel 1 (
    echo 错误: 登录失败
    pause
    exit /b 1
)

echo.
echo [2/2] 开始云端打包 APK（preview 版本）...
npx eas-cli build --platform android --profile preview

echo.
echo ============================================
echo  打包任务已提交！
echo  请等待约 10-15 分钟，完成后会显示下载链接
echo  也可以在 https://expo.dev 查看打包进度
echo ============================================
echo.
pause
