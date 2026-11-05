import { PascalResult, XSMBDraw } from '../types/lottery.ts';

/**
 * Thuật toán Cầu Pascal XSMB:
 * Lấy 5 số Giải Đặc Biệt ghép với 5 số Giải Nhất thành dãy 10 chữ số.
 * Cộng 2 chữ số liền kề lấy số hàng đơn vị (modulo 10), lặp lại đến khi còn đúng 2 chữ số.
 */
export function calculatePascal(draw: XSMBDraw): PascalResult {
  const gdb = draw.prizes.db || '00000';
  const g1 = draw.prizes.g1 || '00000';
  const combinedNumber = `${gdb}${g1}`.replace(/\D/g, '').slice(0, 10);

  const steps: string[] = [combinedNumber];
  let current = combinedNumber;

  while (current.length > 2) {
    let nextRow = '';
    for (let i = 0; i < current.length - 1; i++) {
      const sum = (parseInt(current[i], 10) + parseInt(current[i + 1], 10)) % 10;
      nextRow += sum.toString();
    }
    steps.push(nextRow);
    current = nextRow;
  }

  const primaryNumber = current.padStart(2, '0');
  const reverseNumber = primaryNumber.split('').reverse().join('');

  return {
    combinedNumber,
    steps,
    pair: [primaryNumber, reverseNumber],
    primaryScore: 85, // Pascal base algorithmic confidence score
  };
}
