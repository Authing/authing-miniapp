const app = getApp()

Page({
  data: {
    userInfo: null,
    isShowExchangeModal: false
  },

  onLoad() {
    this.getUserInfo()
    wx.hideHomeButton()
  },

  closeExchangeModal () {
    this.setData({
      isShowExchangeModal: false
    })
  },

  async getUserInfo () {
    const [error, userInfo] = await app.authing.getUserInfo()

    if (error) {
      return
    }

    this.setData({
      userInfo
    })
  }
})