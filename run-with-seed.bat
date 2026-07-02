@echo off
echo ==============================================
echo KHOI DONG HE THONG (KEM THEO TAO DATA MAU)
echo ==============================================

echo [1/6] Setup HR Backend...
cd SE_445_HR\BE
call php artisan migrate:fresh --seed
start "HR Backend" cmd /c "php artisan serve"
cd ..\..

echo [2/6] Setup HR Frontend...
cd SE_445_HR\FE
call npm install
start "HR Frontend" cmd /c "npm run dev"
cd ..\..

echo [3/6] Setup Payroll Backend...
cd SE_445_Payroll\backend
call npm install
call npx prisma db push --accept-data-loss
call npx prisma db seed
start "Payroll Backend" cmd /c "npm run dev"
cd ..\..

echo [4/6] Setup Payroll Frontend...
cd SE_445_Payroll\frontend
call npm install
start "Payroll Frontend" cmd /c "npm run dev"
cd ..\..

echo [5/6] Setup Integration Dashboard BFF...
cd integration-dashboard\bff
call npm install
start "Dashboard BFF" cmd /c "npm run dev"
cd ..\..

echo [6/6] Setup Integration Dashboard Frontend...
cd integration-dashboard\fe
call npm install
start "Dashboard Frontend" cmd /c "npm run dev"
cd ..\..

echo ==============================================
echo Hoan tat! Tat ca dich vu dang chay o cac cua so moi.
echo Nhan phim bat ky de thoat...
pause > nul
