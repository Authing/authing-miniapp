import { changeQrcodeStatus, updatePhone, getCryptedPhone } from '../../apis/index'

import { delay } from '../../utils/utils'

const app = getApp()

Page({
  data: {
    userInfo: null,
    appName: '',
    pageOptions: {}
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
  },

  onHide () {
    this.clearScanCodeLoginConfig()
  },

  onUnload () {
    this.clearScanCodeLoginConfig()
  },

  /**
   * 为避免影响个人中心 onLoad 中对 scene 的判断逻辑
   * 授权登录成功后清除掉已过期/无效的 scene
   */
  clearScanCodeLoginConfig () {
    app.resetScanCodeLoginConfig({
      scene: ''
    })
  },

  async authenticatePhoneAndInvokeLogin (e) {
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

  async cancelLogin () {
    await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CANCEL'
    })

    wx.navigateBack()
  },

  async loginByCodeAndPhone (options = {}) {
    const { phoneCode } = options

    this.invokeRemainLoginCodeAndPhoneSteps({
      phoneCode
    })
  },

  /**
   * 新用户
   * @param { phoneCode } options 
   */
  async invokeHasNotBindUserLogic (options = {}) {
    const { phoneCode } = options
  
    if (phoneCode) {
      return this.loginByCodeAndPhone({
        phoneCode
      })
    }

    app.invokeRemainLoginCodeSteps()
  },

  /**
   * 老用户
   * @param { phoneCode } options 
   */
  async invokeHasBindUserLogic (options = {}) {
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
    // 先登录
    const [loginByCodeError] = await app.loginByCode()

    if (loginByCodeError) {
      return wx.showToast({
        title: loginByCodeError.message,
        icon: 'none'
      })
    }

    // 登录成功后绑定手机号
    const [bindPhoneError] = await this.bindPhone({
      phoneCode
    })

    // 1. 即使手机号已被另一个账号绑定
    // 2. 或因其他原因导致手机号解密失败
    // 3. 等等......
    // ***** 无论是否绑定成功，都不能阻断登录流程 *****
    if (bindPhoneError) {
      wx.showToast({
        title: bindPhoneError.message,
        icon: 'none'
      })
      await delay()
    }

    // 修改二维码状态且跳转到授权成功页，扫码登录成功
    app.changeQrcodeStatusAndToLoginSuccessPage()
  },

  /**
   * 绑定手机号
   * 1. 获取解密后的手机号
   * 2. 更新用户手机号
   * @param { phoneCode } options 
   */
  async bindPhone (options = {}) {
    const { phoneCode } = options

    const [phoneInfoError, phoneInfo] = await getCryptedPhone({
      extIdpConnIdentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      code: phoneCode
    })

    if (phoneInfoError) {
      return [phoneInfoError, undefined]
    }

    // 走接口绑定手机号
    const [updatePhoneError] = await updatePhone({
      phoneCountryCode: phoneInfo.phone_info.countryCode,
      phone: phoneInfo.phone_info.purePhoneNumber,
      codeForUpdatePhone: phoneInfo.codeForUpdatePhone
    })

    // 即使手机号更新失败，也不能阻断用户登录流程
    if (updatePhoneError) {
      return [updatePhoneError, undefined]
    }

    return [undefined, true]
  },

  async invokeRemainLoginCodeAndPhoneSteps (options) {
    const { phoneCode } = options

    const [loginByCodeAndPhoneError] = await app.authing.loginByCodeAndPhone({
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

    if (loginByCodeAndPhoneError) {
      return wx.showToast({
        title: loginByCodeAndPhoneError.message,
        icon: 'none'
      })
    }

    app.changeQrcodeStatusAndToLoginSuccessPage()
  }
})
