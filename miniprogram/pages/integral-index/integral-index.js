const app = getApp()

Page({
  data: {
    userInfo: null,
    isShowExchangeModal: false
  },

  onLoad(options) {
    this.getUserInfo()
    wx.hideHomeButton()
  },

  onReady() {

  },

  showRules () {

  },

  showExchangeRecord () {
    
  },

  toExchange () {
    this.setData({
      isShowExchangeModal: true
    })
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