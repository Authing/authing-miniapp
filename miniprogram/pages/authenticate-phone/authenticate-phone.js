import { changeQrcodeStatus } from '../../apis/index'

const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad() {
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

    // const [error, phoneInfo] = await app.authing.getPhone({
    //   extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnidentifier,
    //   code
    // })
    
    // if (error) {
    //   return wx.showToast({
    //     title: '手机号解析失败，请重新操作',
    //   })
    // }
    // 走接口绑定手机号
    // console.log(phoneInfo.phoneNumber)

    // 修改二维码状态
    const [error] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CONFIRM'
    })

    if (!error) {
      wx.redirectTo({
        url: '/pages/scan-qrcode-login-success/scan-qrcode-login-success',
      })
    }
  },

  async cancelLogin () {
    const [error] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CANCEL'
    })

    if (error) {
      return wx.showToast({
        title: error.message
      })
    }

    wx.navigateBack()
  }
})