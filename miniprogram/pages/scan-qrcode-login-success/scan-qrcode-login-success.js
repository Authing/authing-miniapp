const app = getApp()

Page({
  data: {
    appName: ''
  },

  onLoad () {
    this.setData({
      appName: app.globalData.miniappConfig.appName
    })
  },
  
  confirm () {
    wx.navigateBack()
  }
})