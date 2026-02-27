const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const formatCurrency = (value, currency = 'CNY') => {
  const symbols = { 'CNY': '¥', 'USD': '$', 'HKD': 'HK$' };
  const symbol = symbols[currency] || '¥';
  return symbol + value.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

module.exports = {
  formatCurrency
}
