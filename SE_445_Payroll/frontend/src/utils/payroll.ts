/**
 * Payroll Utility
 * Chứa logic tính toán lương Gross/Net, Bảo hiểm, Thuế TNCN
 */

const INSURANCE_RATES = {
  BHXH: 0.08,  // 8%
  BHYT: 0.015, // 1.5%
  BHTN: 0.01,  // 1%
};

const PERSONAL_DEDUCTION = 11_000_000; // 11 triệu VNĐ

export interface PayrollResult {
  grossSalary: number;
  insuranceInfo: {
    bhxh: number;
    bhyt: number;
    bhtn: number;
    total: number;
  };
  taxableIncome: number;
  pitAmount: number; // Thuế Thu nhập cá nhân (Personal Income Tax)
  netSalary: number;
}

/**
 * Tính thuế TNCN theo biểu thuế lũy tiến từng phần
 */
export function calculatePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  
  if (taxableIncome <= 5_000_000) {
    tax = taxableIncome * 0.05;
  } else if (taxableIncome <= 10_000_000) {
    tax = 5_000_000 * 0.05 + (taxableIncome - 5_000_000) * 0.1;
  } else if (taxableIncome <= 18_000_000) {
    tax = 250_000 + 500_000 + (taxableIncome - 10_000_000) * 0.15;
  } else if (taxableIncome <= 32_000_000) {
    tax = 750_000 + 1_200_000 + (taxableIncome - 18_000_000) * 0.2;
  } else if (taxableIncome <= 52_000_000) {
    tax = 1_950_000 + 2_800_000 + (taxableIncome - 32_000_000) * 0.25;
  } else if (taxableIncome <= 80_000_000) {
    tax = 4_750_000 + 5_000_000 + (taxableIncome - 52_000_000) * 0.3;
  } else {
    tax = 9_750_000 + 8_400_000 + (taxableIncome - 80_000_000) * 0.35;
  }

  return tax;
}

/**
 * Tính lương Net từ Gross
 */
export function calculatePayroll(
  baseSalary: number, 
  workingDays: number, 
  standardDays: number = 22
): PayrollResult {
  // Lương theo ngày công thực tế (Gross)
  const grossSalary = (baseSalary / standardDays) * workingDays;

  // Tính bảo hiểm
  const bhxh = grossSalary * INSURANCE_RATES.BHXH;
  const bhyt = grossSalary * INSURANCE_RATES.BHYT;
  const bhtn = grossSalary * INSURANCE_RATES.BHTN;
  const totalInsurance = bhxh + bhyt + bhtn;

  // Thu nhập chịu thuế
  const taxableIncome = grossSalary - totalInsurance - PERSONAL_DEDUCTION;
  
  // Thuế TNCN
  const pitAmount = calculatePIT(taxableIncome);

  // Lương Net (Thực nhận)
  const netSalary = grossSalary - totalInsurance - pitAmount;

  return {
    grossSalary,
    insuranceInfo: { bhxh, bhyt, bhtn, total: totalInsurance },
    taxableIncome: taxableIncome > 0 ? taxableIncome : 0,
    pitAmount,
    netSalary
  };
}
