const app = getApp()

Page({
  data: {
    account: {},
    updateType: null, // 'flow' | 'no_flow'
    flowType: 'deposit',
    flowAmount: '',
    balance: '',
    note: ''
  },

  onLoad(options) {
    const id = parseInt(options.id)
    const account = app.globalData.accounts.find(a => a.id === id)
    this.setData({ account })
    wx.setNavigationBarTitle({ title: '更新收益 - ' + account.name })
  },

  selectType(e) {
    this.setData({ updateType: e.currentTarget.dataset.type })
  },

  setFlowType(e) {
    this.setData({ flowType: e.currentTarget.dataset.val })
  },

  submit() {
    if (!this.data.balance) {
      wx.showToast({ title: '请输入资产金额', icon: 'none' })
      return
    }
    wx.showLoading({ title: '提交中' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '更新成功' })
      setTimeout(() => wx.navigateBack(), 1500)
    }, 1000)
  }
})
