const app = getApp()

Page({
  data: {
    visible: true,
    summary: {},
    accounts: []
  },

  onLoad() {
    this.setData({
      summary: app.globalData.summary,
      accounts: app.globalData.accounts
    })
  },

  toggleVisible() {
    this.setData({ visible: !this.data.visible })
  },

  goToSummary() {
    wx.navigateTo({ url: '/pages/summary/summary' })
  },

  goToUpdate(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/update/update?id=${id}` })
  },

  addAccount() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  }
})
