# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY HỆ THỐNG TÍCH HỢP (HR & PAYROLL)

Hệ thống bao gồm 3 thành phần chính:
1. **Hệ thống HR** (Quản lý nhân sự) - Dùng MySQL
2. **Hệ thống Payroll** (Tính lương) - Dùng MongoDB
3. **Integration Dashboard** (Bảng điều khiển tích hợp) - Kết nối HR và Payroll

---

## BƯỚC 1: TẠO DATABASE CHO 2 HỆ THỐNG

### 1. Hệ thống HR (Dùng MySQL / XAMPP)
- Mở **XAMPP** và bật module **MySQL** + **Apache**.
- Truy cập vào trang quản trị: `http://localhost/phpmyadmin`
- Nhấn vào nút **Mới (New)** ở cột bên trái để tạo cơ sở dữ liệu.
- Ô "Tên cơ sở dữ liệu" nhập: `se_445_hr_db`
- Bảng mã (Collation) chọn: `utf8mb4_unicode_ci` -> Bấm **Tạo (Create)**.
- Đảm bảo trong thư mục `SE_445_HR/BE`, file `.env` đã có cấu hình:
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=se_445_hr_db
  DB_USERNAME=root
  DB_PASSWORD=
  ```

### 2. Hệ thống Payroll (Dùng MongoDB)
- Hệ thống này sử dụng cơ sở dữ liệu NoSQL (MongoDB). Bạn nên dùng MongoDB Atlas (Cloud) cho tiện.
- Đăng nhập/Đăng ký tài khoản tại [MongoDB Atlas](https://www.mongodb.com/atlas/database).
- Tạo 1 Cluster miễn phí (M0).
- Tạo Database User (Lưu lại Tên đăng nhập và Mật khẩu).
- Cấp quyền truy cập mạng (Network Access): Cho phép kết nối từ mọi IP (`0.0.0.0/0`).
- Lấy chuỗi kết nối (Connection String) bằng cách chọn **Connect** -> **Drivers**.
- Mở file `.env` trong thư mục `SE_445_Payroll/backend` và thay đổi `DATABASE_URL`:
  ```env
  DATABASE_URL="mongodb+srv://<taikhoan>:<matkhau>@cluster0.xxx.mongodb.net/payroll_db"
  PORT=8001
  ```
  *(Lưu ý: Bạn tự đặt tên database là `payroll_db` ngay ở cuối chuỗi kết nối)*

---

## BƯỚC 2: CÁC LỆNH CHẠY HỆ THỐNG (TỰ ĐỘNG)

Bạn không cần mở từng cửa sổ Terminal nữa, mình đã tạo sẵn các kịch bản (Script) tự động hóa hoàn toàn. Bạn chỉ cần vào thư mục gốc `code\System_Integration` và click đúp vào các file tương ứng:

### Đối với môi trường WINDOWS:

**Trường hợp 1: Chạy lần đầu tiên (Tạo Table và Data mẫu)**
👉 Click đúp vào file: **`run-with-seed.bat`**
- Script này sẽ tự động:
  1. Cài đặt thư viện (`npm install`).
  2. Tạo tự động tất cả các Bảng (Tables/Collections) trong CSDL của cả HR và Payroll.
  3. Tạo tự động 15 nhân viên mẫu, các phòng ban và kỳ lương mẫu.
  4. Mở 6 cửa sổ dòng lệnh màu đen chạy 6 Server tương ứng.

**Trường hợp 2: Khởi động hằng ngày (Đã có sẵn data rồi)**
👉 Click đúp vào file: **`run-normal.bat`**
- Script này chỉ khởi động các Server, không chạy lại lệnh tạo Table để tránh ghi đè dữ liệu.

### Đối với môi trường MacOS / Linux:
Mở Terminal, trỏ tới thư mục `System_Integration` và gõ:
- Chạy lần đầu: `sh run-with-seed.sh`
- Chạy hằng ngày: `sh run-normal.sh`

---

## BƯỚC 3: TRUY CẬP VÀ SỬ DỤNG HỆ THỐNG

Sau khi 6 màn hình đen khởi động báo chữ `Ready` hoặc `Server is running`, bạn có thể truy cập các đường dẫn sau:

1. **Hệ Thống Quản Lý Nhân Sự (HR Frontend):**
   - 🔗 **Link:** `http://localhost:3001`
   - 🔑 **Tài khoản:** `st1vannguyen@gmail.com`
   - 🔒 **Mật khẩu:** `123456`

2. **Hệ Thống Tính Lương (Payroll Frontend):**
   - 🔗 **Link:** `http://localhost:3002`
   - 🔑 **Tài khoản:** `admin@payroll.com`
   - 🔒 **Mật khẩu:** `password123`
   *(Hệ thống Payroll đã được cấu hình tự động đăng nhập - bypass qua trang Login vào thẳng Dashboard)*

3. **Dashboard Tích Hợp (Integration Dashboard):**
   - 🔗 **Link:** `http://localhost:3000`
   - *Hệ thống này tổng hợp dữ liệu Real-time (Thời gian thực) từ cả 2 hệ thống trên.*
   - *(Hệ thống Dashboard cũng đã được cấu hình tự động bỏ qua trang Login và vào thẳng Tổng quan)*

---

### MẸO:
- Để xem hệ thống Real-time (Websocket) hoạt động như nào: Hãy mở màn hình `Dashboard Tích Hợp` ở 1 Tab, sau đó sang Tab `Hệ Thống HR` thêm mới 1 nhân sự. Màn hình Dashboard Tích Hợp sẽ tự nhảy số lên ngay lập tức mà không cần tải lại trang!
- Khi muốn tắt hết hệ thống, hãy di chuột tắt (dấu X) toàn bộ 6 cái màn hình đen (Terminal/cmd) vừa được mở ra.
