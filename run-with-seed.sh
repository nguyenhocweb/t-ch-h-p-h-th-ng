#!/bin/bash
echo "=============================================="
echo "KHOI DONG HE THONG (KEM THEO TAO DATA MAU)"
echo "=============================================="

echo "[1/6] Setup HR Backend..."
cd SE_445_HR/BE
php artisan migrate:fresh --seed
php artisan serve &
cd ../..

echo "[2/6] Setup HR Frontend..."
cd SE_445_HR/FE
npm install
npm run dev &
cd ../..

echo "[3/6] Setup Payroll Backend..."
cd SE_445_Payroll/backend
npm install
npx prisma db push --accept-data-loss
npx prisma db seed
npm run dev &
cd ../..

echo "[4/6] Setup Payroll Frontend..."
cd SE_445_Payroll/frontend
npm install
npm run dev &
cd ../..

echo "[5/6] Setup Integration Dashboard BFF..."
cd integration-dashboard/bff
npm install
npm run dev &
cd ../..

echo "[6/6] Setup Integration Dashboard Frontend..."
cd integration-dashboard/fe
npm install
npm run dev &
cd ../..

echo "=============================================="
echo "Hoan tat! Tat ca dich vu dang chay ngam (background)."
echo "Nhan Ctrl+C de dung chuong trinh nay. De tat tat ca cac server, dung lenh: killall node && killall php"
wait
