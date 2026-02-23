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

REM 检查是否已经在目标位置
if /I "%SRC%"=="%DEST%" (
    echo [提示] 文件已经在目标位置，无需移动！
    pause
    exit /b 0
)

REM 创建目标文件夹（含父级）
if not exist "%USERPROFILE%\Desktop\第十八届合泰杯" mkdir "%USERPROFILE%\Desktop\第十八届合泰杯"
if not exist "%DEST%" mkdir "%DEST%"

echo 正在复制文件（跳过 node_modules 和 .git）...
echo.

REM 使用 robocopy 复制（Windows 内置，比 xcopy 更可靠）
robocopy "%SRC%" "%DEST%" /E /XD node_modules .git /XF "*.log" /NP /NFL /NDL

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
