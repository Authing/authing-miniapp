const app = getApp()

let timer = null

Page({
  onLoad(options = {}) {
    const { scene } = options

    // 每次重新进入小程序都需要：
    // 1. 重置 Authing 小程序 SDK
    // 2. 重置 scene
    app.resetAuthing()
    app.resetScanCodeLoginConfig({
      scene: scene || ''
    })

    timer = setTimeout(() => {
      const url = app.globalData.scanCodeLoginConfig.scene
        ? '/pages/mine/mine'
        : '/pages/integral-index/integral-index'
      wx.redirectTo({
        url
      })
    }, 1000)
  },

  clearTimer () {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  },

  onUnload () {
    this.clearTimer()
  }
})
