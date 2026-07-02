@echo off
echo ==============================================
echo KHOI DONG HE THONG (BINH THUONG)
echo ==============================================

echo [1/6] Khoi dong HR Backend...
cd SE_445_HR\BE
start "HR Backend" cmd /c "php artisan serve"
cd ..\..

echo [2/6] Khoi dong HR Frontend...
cd SE_445_HR\FE
start "HR Frontend" cmd /c "npm run dev"
cd ..\..

echo [3/6] Khoi dong Payroll Backend...
cd SE_445_Payroll\backend
start "Payroll Backend" cmd /c "npm run dev"
cd ..\..

echo [4/6] Khoi dong Payroll Frontend...
cd SE_445_Payroll\frontend
start "Payroll Frontend" cmd /c "npm run dev"
cd ..\..

echo [5/6] Khoi dong Integration Dashboard BFF...
cd integration-dashboard\bff
start "Dashboard BFF" cmd /c "npm run dev"
cd ..\..

echo [6/6] Khoi dong Integration Dashboard Frontend...
cd integration-dashboard\fe
start "Dashboard Frontend" cmd /c "npm run dev"
cd ..\..

echo ==============================================
echo Hoan tat! Tat ca dich vu dang chay o cac cua so moi.
echo Nhan phim bat ky de thoat...
pause > nul
