@echo off
chcp 65001 >nul
echo ============================================
echo  Smart Cushion - 一键环境配置脚本
echo ============================================
echo.

echo [1/4] 重置本地 package-lock.json...
git checkout -- package-lock.json
if errorlevel 1 (
    echo 警告: 重置 package-lock.json 失败，继续...
)

echo.
echo [2/4] 拉取最新代码...
git pull origin claude/explain-codebase-mlywsa07ewc58yyr-GgeDF
if errorlevel 1 (
    echo 错误: git pull 失败，请检查网络连接
    pause
    exit /b 1
)

echo.
echo [3/4] 清除旧的 node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo 已清除 node_modules
) else (
    echo node_modules 不存在，跳过
)

echo.
echo [4/4] 安装依赖（SDK 54）...
npm install
if errorlevel 1 (
    echo 错误: npm install 失败
    pause
    exit /b 1
)

echo.
echo ============================================
echo  安装完成！正在启动 Expo...
echo ============================================
echo.
npx expo start

pause
