@echo off
chcp 65001 >nul
echo ============================================
echo  移动项目到：桌面\第十八届合泰杯\APP全部代码
echo ============================================
echo.

set "DEST=%USERPROFILE%\Desktop\第十八届合泰杯\APP全部代码"
set "SRC=%~dp0"
if "%SRC:~-1%"=="\" set "SRC=%SRC:~0,-1%"

echo 当前文件夹: %SRC%
echo 目标文件夹: %DEST%
echo.

REM ── 验证这是项目文件夹（检查 package.json 是否存在）──
if not exist "%SRC%\package.json" (
    echo [错误] 没有找到 package.json！
    echo 请把此脚本放到项目根目录后再运行。
    pause
    exit /b 1
)

REM 检查是否已经在目标位置
if /I "%SRC%"=="%DEST%" (
    echo [提示] 文件已经在目标位置，无需移动！
    pause
    exit /b 0
)

REM 创建目标文件夹
if not exist "%USERPROFILE%\Desktop\第十八届合泰杯" mkdir "%USERPROFILE%\Desktop\第十八届合泰杯"
if not exist "%DEST%" mkdir "%DEST%"

echo 正在复制项目文件...
echo.

REM ── 只复制项目相关文件夹 ──
for %%D in (app assets components constants dist2 expo public services src store types utils web) do (
    if exist "%SRC%\%%D" (
        echo   复制文件夹: %%D
        robocopy "%SRC%\%%D" "%DEST%\%%D" /E /NP /NFL /NDL >nul
    )
)

REM ── 只复制项目相关文件 ──
echo   复制配置文件...
for %%F in (
    App.tsx
    app.json
    babel.config.js
    build.bat
    eas.json
    eslint.config.js
    index.html
    metro.config.js
    package.json
    package-lock.json
    README.md
    setup.bat
    tsconfig.json
    vite.config.js
    .easignore
    .gitignore
    移动到桌面文件夹.bat
) do (
    if exist "%SRC%\%%F" copy "%SRC%\%%F" "%DEST%\%%F" /Y >nul
)

echo.
echo ============================================
echo  复制完成！
echo  位置: %DEST%
echo.
echo  下一步：
echo  1. 进入新文件夹，双击 setup.bat 安装依赖
echo  2. 之后双击 setup.bat 启动开发服务器
echo ============================================
echo.

set /p OPEN="是否立即打开目标文件夹？(y/n): "
if /I "%OPEN%"=="y" explorer "%DEST%"

pause
