const app = getApp()

Page({
  data: {
    appName: ''
  },

  onLoad() {
    this.setData({
      appName: app.globalData.miniappConfig.appName
    })

    // 为避免影响个人中心 onLoad 中对 scene 的判断逻辑
    // 授权登录成功后清除掉已过期/无效的 scene
    app.resetScanCodeLoginConfig({
      scene: ''
    })
  },

  confirm() {
    wx.navigateBack()
  }
})
