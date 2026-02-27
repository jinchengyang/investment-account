App({
  globalData: {
    userInfo: null,
    // 模拟全局数据
    summary: {
      totalAssets: 5518235.49,
      cumulativeProfit: 736489.74,
      annualizedReturn: 2.83,
      timeWeightedReturn: 9.15
    },
    accounts: [
      { id: 1, name: '港股账号', currency: 'HKD', balance: 2957321.00, profit: 799880.02, rate: 12.41, updateTime: '7天前' },
      { id: 2, name: '人民币账户', currency: 'CNY', balance: 2883976.00, profit: 45526.00, rate: 1.26, updateTime: '7天前' },
      { id: 3, name: '美元账户', currency: 'USD', balance: 1231.00, profit: 876.82, rate: 48.81, updateTime: '7天前' }
    ]
  }
})
