@echo off
chcp 65001 >nul
echo ============================================
echo  移动项目到：桌面\第十八届合泰杯\APP全部代码
echo ============================================
echo.

set "DEST=%USERPROFILE%\Desktop\第十八届合泰杯\APP全部代码"
set "SRC=%~dp0"
REM 去掉末尾的反斜杠
if "%SRC:~-1%"=="\" set "SRC=%SRC:~0,-1%"

echo 当前文件夹: %SRC%
echo 目标文件夹: %DEST%
echo.

REM 创建目标文件夹
if not exist "%DEST%" (
    echo 正在创建目标文件夹...
    mkdir "%DEST%"
)

REM 检查是否已经在目标位置
if /I "%SRC%"=="%DEST%" (
    echo [提示] 文件已经在目标位置，无需移动！
    pause
    exit /b 0
)

echo 正在复制文件...
echo （node_modules 体积较大，跳过，安装时重新生成）
echo.

REM 复制所有文件（排除 node_modules 和 .git）
xcopy "%SRC%\*" "%DEST%\" /E /I /Y /EXCLUDE:"%SRC%\xcopy_exclude.txt" 2>nul

REM 如果 exclude 文件不存在，手动排除
if not exist "%SRC%\xcopy_exclude.txt" (
    echo node_modules > "%TEMP%\xcopy_exclude.txt"
    echo .git >> "%TEMP%\xcopy_exclude.txt"
    xcopy "%SRC%\*" "%DEST%\" /E /I /Y /EXCLUDE:"%TEMP%\xcopy_exclude.txt"
    del "%TEMP%\xcopy_exclude.txt"
)

echo.
echo ============================================
echo  复制完成！
echo  位置: %DEST%
echo.
echo  提示：
echo  1. 进入新文件夹，双击 setup.bat 安装依赖
echo  2. 之后双击 setup.bat 启动开发服务器
echo ============================================
echo.

set /p OPEN="是否立即打开目标文件夹？(y/n): "
if /I "%OPEN%"=="y" explorer "%DEST%"

pause
