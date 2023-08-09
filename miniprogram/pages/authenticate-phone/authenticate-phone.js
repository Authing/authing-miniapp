import { getPublicConfig } from '../../apis/index'

import { extractAgreements } from '../../utils/utils'

const app = getApp()

Page({
  data: {
    userInfo: null,
    appName: '',
    pageOptions: {},
    agreements: [],
    acceptedAgreements: false
  },

  async onLoad(options = {}) {
    await app.getAuthing()
    this.setData({
      pageOptions: {
        hasBindUser: !!(options.hasBindUser - 0),
        hasBindPhone: !!(options.hasBindPhone - 0)
      },
      appName: app.globalData.miniappConfig.appName
    })
    this.getAgreements()
  },

  onUnload() {
    this.clearScanCodeLoginConfig()
  },

  /**
   * 为避免影响个人中心 onLoad 中对 scene 的判断逻辑
   * 授权登录成功后清除掉已过期/无效的 scene
   */
  clearScanCodeLoginConfig() {
    app.resetScanCodeLoginConfig({
      scene: '',
      bind: 0
    })
  },

  async getAgreements() {
    const [publicConfigError, publicConfig] = await getPublicConfig()
    if (
      publicConfigError ||
      !publicConfig.agreements ||
      !publicConfig.agreements.length
    ) {
      this.setData({
        acceptedAgreements: true
      })
      return
    }

    const agreements = publicConfig.agreements
      .filter(item => item.lang === 'zh-CN')
      .map(item => {
        const agreements = extractAgreements(item.title)

        if (!agreements.length) {
          return item
        }

        return {
          id: item.id,
          required: item.required,
          agreements
        }
      })

    this.setData({
      agreements
    })
  },

  openAgreement(e) {
    const { link } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(link)}`
    })
  },

  onChangeAgreements(e) {
    const value = e.detail.value.map(item => +item)

    const requiredAgreements = this.data.agreements.filter(
      item => item.required
    )

    const notAcceptRequiredAgreements = requiredAgreements.find(item => {
      return value.indexOf(+item.id) === -1
    })

    this.setData({
      acceptedAgreements: !notAcceptRequiredAgreements
    })
  },

  async authenticatePhoneAndInvokeLogin(e) {
    if (!this.data.acceptedAgreements) {
      return wx.showToast({
        title: '请先阅读并同意协议',
        icon: 'none'
      })
    }

    const { code } = e.detail

    // 新用户
    if (!this.data.pageOptions.hasBindUser) {
      return this.invokeHasNotBindUserLogic({
        phoneCode: code
      })
    }

    // 老用户
    this.invokeHasBindUserLogic({
      phoneCode: code
    })
  },

  async cancelLogin() {
    wx.navigateBack()
  },

  async loginByPhone(options = {}) {
    const { phoneCode } = options

    this.invokeRemainLoginByPhoneSteps({
      phoneCode
    })
  },

  /**
   * 新用户
   * @param { phoneCode } options
   */
  async invokeHasNotBindUserLogic(options = {}) {
    const { phoneCode } = options

    if (phoneCode) {
      return this.loginByPhone({
        phoneCode
      })
    }

    app.invokeRemainLoginCodeSteps()
  },

  /**
   * 老用户
   * @param { phoneCode } options
   */
  async invokeHasBindUserLogic(options = {}) {
    const { phoneCode } = options

    // 老用户未绑定手机号
    // 即使用户拒绝授权手机号，也不能阻断登录
    if (!phoneCode) {
      return app.invokeRemainLoginCodeSteps()
    }

    // 老用户已绑定手机号
    // 这里只是兜底，在 mine 页面已执行『老用户已绑定手机号』的逻辑
    if (this.data.pageOptions.hasBindPhone) {
      return app.invokeRemainLoginCodeSteps()
    }

    // 老用户未绑定手机号且未拒绝授权
    this.invokeRemainLoginByPhoneSteps({
      phoneCode
    })
  },

  async invokeRemainLoginByPhoneSteps(options) {
    const { phoneCode } = options

    wx.showLoading({
      title: '登录中...'
    })

    const [loginByCodeAndPhoneError] = await app.authing.loginByPhone({
      extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      wechatMiniProgramCodeAndPhonePayload: {
        wxPhoneInfo: {
          code: phoneCode
        }
      },
      options: {
        scope: 'openid profile offline_access'
      }
    })

    wx.hideLoading()

    if (loginByCodeAndPhoneError) {
      return wx.showToast({
        title: loginByCodeAndPhoneError.message,
        icon: 'none'
      })
    }

    const [userInfoError, userInfo] = await app.authing.getUserInfo()

    if (userInfoError) {
      return wx.showToast({
        title: userInfoError.message || '用户信息获取失败，请重新扫码',
        icon: 'none'
      })
    }

    app.changeQrcodeStatusAndToLoginSuccessPage({
      userInfo
    })
  }
})
