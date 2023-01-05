import { changeQrcodeStatus, updatePhone } from '../../apis/index'

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

    const [phoneInfoError, phoneInfo] = await app.authing.getPhone({
      extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
      code
    })
    
    if (phoneInfoError) {
      return wx.showToast({
        title: '手机号解析失败，请重新操作',
        icon: 'none'
      })
    }

    // 走接口绑定手机号
    const [updatePhoneError] = await updatePhone({
      phone: phoneInfo.phoneNumber
    })

    if (updatePhoneError) {
      return wx.showToast({
        title: updatePhoneError.message,
        icon: 'none'
      })
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