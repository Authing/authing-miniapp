import { getIntegralList, getUserIntegrals, checkin, exchangeIntegral } from '../../apis/index'

const app = getApp()

Page({
  data: {
    userInfo: null,
    isShowExchangeModal: false,
    integralList: [],
    userIntegrals: null
  },

  async onLoad() {
    wx.hideHomeButton()
  },

  onShow () {
    this.getIntegralList()
    this.getUserInfo()
    this.getUserIntegrals()
  },

  async onLogin (e) {
    this.setData({
      userInfo: e.detail
    })
    await checkin()
    this.getUserIntegrals()
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
  },

  async getIntegralList () {
    const [error, res] = await getIntegralList()

    if (error) {
      return
    }

    this.setData({
      integralList: res.data
    })
  },

  async getUserIntegrals () {
    const [error, res] = await getUserIntegrals()

    if (error) {
      return
    }

    this.setData({
      userIntegrals: res.data
    })
  },

  async toExchange (e) {
    const { id } = e.detail
    const [error, result] = await exchangeIntegral({
      vouchersCode: id
    })

    if (error) {
      return wx.showToast({
        title: error.message,
        icon: 'none'
      })
    }

    // 兑换成功
    wx.showToast({
      title: result.message,
      icon: 'none'
    })
    
    // 重新拉取用户积分数据
    this.getUserIntegrals()
  }
})