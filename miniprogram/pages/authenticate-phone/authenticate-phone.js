import { changeQrcodeStatus, updatePhone, getCryptedPhone } from '../../apis/index'

import { delay } from '../../utils/utils'

const app = getApp()

Page({
  data: {
    userInfo: null
  },

  async onLoad() {
    await app.getAuthing()
    this.getUserInfo()
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

    const [phoneInfoError, phoneInfo] = await getCryptedPhone({
      extIdpConnIdentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      code
    })
    
    if (phoneInfoError) {
      return wx.showToast({
        title: phoneInfoError.message || '手机号解析失败，请重新操作',
        icon: 'none'
      })
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

      await delay()
    }

    // 修改二维码状态
    const [changeQrcodeStatusError] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CONFIRM'
    })

    if (!changeQrcodeStatusError) {
      wx.redirectTo({
        url: '/pages/scan-qrcode-login-success/scan-qrcode-login-success',
      })
    }
  },

  async cancelLogin () {
    await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CANCEL'
    })

    wx.navigateBack()
  }
})