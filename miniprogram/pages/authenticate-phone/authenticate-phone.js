import { changeQrcodeStatus, updatePhone, getCryptedPhone } from '../../apis/index'

import { delay } from '../../utils/utils'

const app = getApp()

Page({
  data: {
    userInfo: null,
    appName: ''
  },

  async onLoad() {
    await app.getAuthing()
    this.getUserInfo()
    this.setData({
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

  async getUserInfo () {
    const [error, userInfo] = await app.authing.getUserInfo()

    if (!error) {
      this.setData({
        userInfo
      })
    }
  },

  async authenticatePhoneAndInvokeLogin (e) {
    const { code } = e.detail

    // 用户未授权手机号，不能阻断登录流程，直接修改二维码状态
    if (!code) {
      return this.invokeRemainLoginSteps()
    }

    const [phoneInfoError, phoneInfo] = await getCryptedPhone({
      extIdpConnIdentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      code
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

      return this.invokeRemainLoginSteps()
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

    await delay()

    return this.invokeRemainLoginSteps()
  },

  async invokeRemainLoginSteps () {
    const status = await this.confirmQrcodeStatus()
    
    // 二维码状态修改失败
    if (!status) {
      return wx.showToast({
        title: changeQrcodeStatusError.message,
        icon: 'none'
      })
    }

    this.toLoginSuccessPage()
  },

  async confirmQrcodeStatus () {
    const [changeQrcodeStatusError] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CONFIRM'
    })

    if (changeQrcodeStatusError) {
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
  }
})
