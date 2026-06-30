import * as XLSX from 'xlsx';
import { PayrollResult } from './payroll';

export interface PayrollExportData {
  id: string;
  name: string;
  department: string;
  baseSalary: number;
  workingDays: number;
  result: PayrollResult;
}

export const exportPayrollToExcel = (data: PayrollExportData[], fileName: string = 'Bang_Luong.xlsx') => {
  // Format data cho Excel
  const excelData = data.map((item, index) => ({
    'STT': index + 1,
    'Mã NV': item.id,
    'Họ và Tên': item.name,
    'Phòng ban': item.department,
    'Lương cơ bản': item.baseSalary,
    'Số ngày công': item.workingDays,
    'Lương Gross': item.result.grossSalary,
    'Bảo hiểm (10.5%)': item.result.insuranceInfo.total,
    'Thu nhập chịu thuế': item.result.taxableIncome,
    'Thuế TNCN': item.result.pitAmount,
    'Thực nhận (Net)': item.result.netSalary,
  }));

  // Tạo worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Tạo workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng Lương');

  // Điều chỉnh độ rộng cột
  const wscols = [
    { wch: 5 },  // STT
    { wch: 10 }, // Mã NV
    { wch: 20 }, // Họ tên
    { wch: 15 }, // Phòng ban
    { wch: 15 }, // Lương cơ bản
    { wch: 12 }, // Ngày công
    { wch: 15 }, // Lương Gross
    { wch: 15 }, // Bảo hiểm
    { wch: 18 }, // TN chịu thuế
    { wch: 15 }, // Thuế TNCN
    { wch: 15 }, // Thực nhận
  ];
  worksheet['!cols'] = wscols;

  // Xuất file
  XLSX.writeFile(workbook, fileName);
};
