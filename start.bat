@echo off
echo Copyright 2014-2023 @dev_aixel All Rights Reserved.
echo.

:start
node index.js
if %errorlevel% neq 0 (
    echo An error occurred. Waiting 5 seconds before restarting...
    timeout /t 5 /nobreak
    goto start
)
