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

  async changeQrcodeStatusAndToLoginSuccessPage () {
    const scanStatus = await this.changeQrcodeStatusToScan()
    if (!scanStatus) {
      return
    }

    const confirmStatus = await this.changeQrcodeStatusToConfirm()
    if (!confirmStatus) {
      return
    }

    this.toLoginSuccessPage()
  },

  async changeQrcodeStatusToScan () {
    const [changeQrcodeStatusError] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'SCAN'
    })

    if (changeQrcodeStatusError) {
      wx.showToast({
        title: changeQrcodeStatusError.message,
        icon: 'none'
      })
      return false
    }

    return true
  },

  async changeQrcodeStatusToConfirm () {
    const [changeQrcodeStatusError] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CONFIRM'
    })

    if (changeQrcodeStatusError) {
      wx.showToast({
        title: changeQrcodeStatusError.message,
        icon: 'none'
      })
      return false
    }

    return true
  },

  toLoginSuccessPage () {
    wx.redirectTo({
      url: '/pages/scan-qrcode-login-success/scan-qrcode-login-success',
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

  async invokeHasNotBindUserLogic (options = {}) {
    const { phoneCode } = options
  
    if (phoneCode) {
      return this.loginByCodeAndPhone({
        phoneCode
      })
    }

    this.invokeRemainLoginCodeSteps()
  },

  async invokeHasBindUserLogic (options = {}) {
    const { phoneCode } = options

    // 即使用户拒绝授权手机号，也不能阻断登录
    if (!phoneCode) {  
      return this.invokeRemainLoginCodeSteps()
    }

    // 已绑定手机号
    if (this.data.pageOptions.hasBindPhone) {  
      return this.invokeRemainLoginCodeSteps()
    }

    // 未绑定手机号
    const [phoneInfoError, phoneInfo] = await getCryptedPhone({
      extIdpConnIdentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      code: phoneCode
    })

    // 1. 即使手机号已被另一个账号绑定
    // 2. 或因其他原因导致手机号解密失败
    // 3. 等等......
    // 也不能阻断正常登录流程
    if (phoneInfoError) {
      wx.showToast({
        title: phoneInfoError.message,
        icon: 'none'
      })

      await delay()

      return this.invokeRemainLoginCodeSteps()
    }

    // 走接口绑定手机号
    const [updatePhoneError] = await updatePhone({
      phoneCountryCode: phoneInfo.phone_info.countryCode,
      phone: phoneInfo.phone_info.purePhoneNumber,
      codeForUpdatePhone: phoneInfo.codeForUpdatePhone
    })

    // 即使手机号更新失败，也不能阻断用户登录流程
    if (updatePhoneError) {
      wx.showToast({
        title: updatePhoneError.message || '手机号更新失败，请在控制台个人信息中修改手机号',
        icon: 'none'
      })
    }

    return this.invokeRemainLoginCodeSteps()
  },

  async invokeRemainLoginCodeSteps () {
    const [loginByCodeError] = await app.authing.loginByCode({
      extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      wechatMiniProgramCodePayload: {
        encryptedData: '',
        iv: ''
      },
      options: {
        scope: 'openid profile offline_access'
      }
    })

    if (loginByCodeError) {
      return wx.showToast({
        title: loginByCodeError.message,
        icon: 'none'
      })
    }

    this.changeQrcodeStatusAndToLoginSuccessPage()
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

    this.changeQrcodeStatusAndToLoginSuccessPage()
  }
})
