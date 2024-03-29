import {
  getIntegralList,
  getUserIntegrals,
  checkin,
  exchangeIntegral,
  updatePhone,
  getCryptedPhone
} from '../../apis/index'

const app = getApp()

let timer = null

Page({
  data: {
    userInfo: null,
    isShowExchangeModal: false,
    integralList: [],
    userIntegrals: null,
    currentExchangedIntegral: null
  },

  onLoad() {
    wx.hideHomeButton()
  },

  async onShow() {
    await app.getAuthing()
    this.getUserInfo()
    this.getIntegralList()
    await checkin()
    this.getUserIntegrals()
  },

  onUnload() {
    timer && clearTimeout(timer)
  },

  async onLogin(e) {
    this.setData({
      userInfo: e.detail
    })
    await checkin()
    this.getUserIntegrals()
  },

  async getUserInfo() {
    const [error, userInfo] = await app.authing.getUserInfo()

    if (error) {
      return
    }

    this.setData({
      userInfo
    })
  },

  async getIntegralList() {
    const [error, res] = await getIntegralList()

    if (error) {
      return
    }

    this.setData({
      integralList: res.data
    })
  },

  async getUserIntegrals() {
    const [error, res] = await getUserIntegrals()

    if (error) {
      return
    }

    this.setData({
      userIntegrals: res.data
    })
  },

  async toExchange(e) {
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

    // 重新拉取用户积分数据
    this.getUserIntegrals()
    // 重新拉取积分列表
    this.getIntegralList()

    // 用户已绑定手机号，直接跳转到兑换记录列表
    if (this.data.userInfo.phone) {
      wx.showToast({
        title: result.message,
        icon: 'none'
      })

      timer = setTimeout(() => {
        wx.navigateTo({
          url: '/pages/exchange-records/exchange-records'
        })
      }, 1000)

      return
    }

    // 用户未绑定手机号
    const currentExchangedIntegral = this.data.integralList.find(
      item => item.id === id
    )

    this.setData({
      isShowExchangeModal: true,
      currentExchangedIntegral
    })
  },

  async onAuthenticatePhone(e) {
    this.setData({
      isShowExchangeModal: false
    })

    const { code } = e.detail

    // 用户拒绝授权或获取手机授权失败，直接跳转到兑换记录页面
    if (!code) {
      return wx.navigateTo({
        url: '/pages/exchange-records/exchange-records'
      })
    }

    // 用户允许授权手机号
    // 将手机号更新到用户信息中
    const [phoneInfoError, phoneInfo] = await getCryptedPhone({
      extIdpConnIdentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      code
    })

    if (!phoneInfoError) {
      // 更新手机号
      await updatePhone({
        phoneCountryCode: phoneInfo.phone_info.countryCode,
        phone: phoneInfo.phone_info.purePhoneNumber,
        codeForUpdatePhone: phoneInfo.codeForUpdatePhone
      })

      // 无论是否更新成功，都跳转到到兑换记录页面
      wx.navigateTo({
        url: '/pages/exchange-records/exchange-records'
      })
    }
  }
})
