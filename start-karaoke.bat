::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCuDJH2L40w8JxpQXziJPXm7Cb4ZpuH44Io=
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSzk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpSI=
::egkzugNsPRvcWATEpSI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAjk
::YxY4rhs+aU+JeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQJQ
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQJQ
::dhA7uBVwLU+EWDk=
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATElA==
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCuDJH+R+E5wGw9VTw++bjvoU/Uu7ev6/9aMo18cW+k2NY3Cl6abKOEd1nfxfZcjkWkas8oeDRRTe1yudgpU
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
echo ===================================================
echo      Starting Ruhan's Karaoke Maker
echo ===================================================

echo [1/3] Checking Backend Dependencies...
cd karaoke-by-ruhan-server
if not exist node_modules (
    echo Installing backend node_modules... (This might take a minute)
    call npm install
)
:: Start the backend server minimized (using node instead of nodemon so it works for everyone)
start "Karaoke Backend" /min cmd /k "node index.js"
cd ..

echo [2/3] Checking Frontend Dependencies...
cd karaoke-by-ruhan
if not exist node_modules (
    echo Installing frontend node_modules... (This might take a minute)
    call npm install
)
:: Start the frontend server minimized
start "Karaoke Frontend" /min cmd /k "npm run dev"
cd ..

echo [3/3] Waiting for servers to start...
timeout /t 5 /nobreak > NUL

start http://localhost:5173

exit