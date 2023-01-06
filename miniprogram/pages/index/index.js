const app = getApp()

let timer = null

Page({
  onLoad() {
    timer = setTimeout(() => {
      const url = app.globalData.scanCodeLoginConfig.scene
        ? '/pages/mine/mine'
        : '/pages/integral-index/integral-index'
      wx.redirectTo({
        url
      })
    }, 1000)
  },

  onHide () {
    timer && clearTimeout(timer)
  }
})
