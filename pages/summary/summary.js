const app = getApp()

Page({
  data: {
    summary: {},
    timeRanges: ['今年', '近1年', '记账以来', '未来', '自定义'],
    ec: {
      lazyLoad: true // 实际开发中需配合 echarts 库
    }
  },

  onLoad() {
    this.setData({
      summary: app.globalData.summary
    })
  }
})
