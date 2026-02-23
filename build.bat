@echo off
chcp 65001 >nul
echo ============================================
echo  智能健康坐垫 - 打包 Android APK
echo ============================================
echo.

echo [1/3] 检查登录状态...
npx eas-cli whoami >nul 2>&1
if errorlevel 1 (
    echo 未登录，请输入 Expo 账号...
    echo.
    npx eas-cli login
    if errorlevel 1 (
        echo.
        echo 错误: 登录失败，请检查账号密码
        pause
        exit /b 1
    )
)
echo 登录成功！
echo.

echo [2/3] 初始化项目（关联 Expo 账号）...
npx eas-cli init --non-interactive 2>nul
if errorlevel 1 (
    npx eas-cli init
)
echo.

echo [3/3] 开始云端打包 APK...
echo 预计需要 10-15 分钟，请耐心等待...
echo.
npx eas-cli build --platform android --profile preview --non-interactive

echo.
echo ============================================
echo  打包任务已提交！
echo  完成后上方会显示 APK 下载链接
echo  也可以去 https://expo.dev 查看进度
echo ============================================
echo.
pause
