import { changeQrcodeStatus, updatePhone, getCryptedPhone } from '../../apis/index'

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

  async getPhone (e) {
    const { code } = e.detail

    const [phoneInfoError, phoneInfo] = await getCryptedPhone({
      extIdpConnIdentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      code
    })
    
    if (phoneInfoError) {
      return wx.showToast({
        title: '手机号解析失败，请重新操作',
        icon: 'none'
      })
    }

    // 走接口绑定手机号
    await updatePhone({
      phoneCountryCode: phoneInfo.phone_info.countryCode,
      phone: phoneInfo.phone_info.purePhoneNumber,
      codeForUpdatePhone: phoneInfo.codeForUpdatePhone
    })

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