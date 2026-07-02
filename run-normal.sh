#!/bin/bash
echo "=============================================="
echo "KHOI DONG HE THONG (BINH THUONG)"
echo "=============================================="

echo "[1/6] Khoi dong HR Backend..."
cd SE_445_HR/BE
php artisan serve &
cd ../..

echo "[2/6] Khoi dong HR Frontend..."
cd SE_445_HR/FE
npm run dev &
cd ../..

echo "[3/6] Khoi dong Payroll Backend..."
cd SE_445_Payroll/backend
npm run dev &
cd ../..

echo "[4/6] Khoi dong Payroll Frontend..."
cd SE_445_Payroll/frontend
npm run dev &
cd ../..

echo "[5/6] Khoi dong Integration Dashboard BFF..."
cd integration-dashboard/bff
npm run dev &
cd ../..

echo "[6/6] Khoi dong Integration Dashboard Frontend..."
cd integration-dashboard/fe
npm run dev &
cd ../..

echo "=============================================="
echo "Hoan tat! Tat ca dich vu dang chay ngam (background)."
echo "Nhan Ctrl+C de dung chuong trinh nay. De tat tat ca cac server, dung lenh: killall node && killall php"
wait
