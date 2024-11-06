export function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
}

export const calcPercent = (a?: number, b?: number) => a && b ? (a / b) * 100 : 0

export const isZero = (a?: number) => !(a && a > 0)

export const toInt = (number: any) => number ? ~~+number.toString().replace(/,/g, '') : 0
export const toFloat = (number: any) => number ? +number.toString().replace(/,/g, '') : 0
export const decimalFix = (number: any, decimal: any = 2, nzero = true) => {
  number = toFloat(number)

  return !nzero && number === 0 ? '' : number.toFixed(decimal).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}