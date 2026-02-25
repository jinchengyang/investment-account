import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'CNY') {
  const symbol = currency === 'USD' ? '$' : currency === 'HKD' ? 'HK$' : '¥';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency === 'CNY' ? 'CNY' : currency === 'HKD' ? 'HKD' : 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
