import { calculatePIT, calculatePayroll } from '../src/utils/payroll';

describe('Payroll Utility Tests', () => {
  describe('calculatePIT', () => {
    it('Thu nhập chịu thuế <= 0 thì không nộp thuế', () => {
      expect(calculatePIT(0)).toBe(0);
      expect(calculatePIT(-5000000)).toBe(0);
    });

    it('Thu nhập chịu thuế <= 5 triệu (Bậc 1: 5%)', () => {
      expect(calculatePIT(4000000)).toBe(200000); // 4M * 5%
      expect(calculatePIT(5000000)).toBe(250000); // 5M * 5%
    });

    it('Thu nhập chịu thuế 5-10 triệu (Bậc 2: 10%)', () => {
      // 5M * 5% + (8M - 5M) * 10% = 250k + 300k = 550k
      expect(calculatePIT(8000000)).toBe(550000); 
    });

    it('Thu nhập chịu thuế 10-18 triệu (Bậc 3: 15%)', () => {
      // 5M * 5% + 5M * 10% + (15M - 10M) * 15% = 250k + 500k + 750k = 1.5M
      expect(calculatePIT(15000000)).toBe(1500000); 
    });
  });

  describe('calculatePayroll', () => {
    it('Tính chính xác lương Gross, Bảo hiểm và Lương Net (Nhân viên đi đủ 22 ngày)', () => {
      const baseSalary = 20_000_000;
      const workingDays = 22;

      const result = calculatePayroll(baseSalary, workingDays, 22);

      expect(result.grossSalary).toBe(20_000_000);
      
      // Bảo hiểm: 10.5% của 20M = 2.1M
      expect(result.insuranceInfo.total).toBe(2_100_000);
      expect(result.insuranceInfo.bhxh).toBe(1_600_000); // 8%
      
      // TN chịu thuế = Gross (20M) - BH (2.1M) - Giảm trừ gia cảnh (11M) = 6.9M
      expect(result.taxableIncome).toBe(6_900_000);
      
      // PIT cho 6.9M (Bậc 2): 250k + 190k = 440k
      expect(result.pitAmount).toBe(440_000);
      
      // Lương Net = Gross (20M) - BH (2.1M) - Thuế (440k) = 17.46M
      expect(result.netSalary).toBe(17_460_000);
    });

    it('Tính chính xác lương Gross khi nhân viên nghỉ 2 ngày (20/22 ngày)', () => {
      const baseSalary = 22_000_000;
      const workingDays = 20; // 20 ngày = 20M Gross

      const result = calculatePayroll(baseSalary, workingDays, 22);

      expect(result.grossSalary).toBe(20_000_000); // Giống test case trên do Gross bằng nhau
      expect(result.netSalary).toBe(17_460_000);
    });
  });
});
