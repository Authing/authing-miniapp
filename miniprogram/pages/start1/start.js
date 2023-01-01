// 扫码进入当前页面

const app = getApp()

Page({
  data: {
    options: null
  },

  onLoad(options) {
    console.log('start options: ', options)
    this.setData({
      options
    })
  },

  async login () {
    const [loginStateError,] = await app.authing.getLoginState()

    if (loginStateError) {
      const { encryptedData, iv } = await wx.getUserProfile({
        desc: 'getUserProfile'
      })
      
      const [error] = await app.authing.loginByCode({
        extIdpConnidentifier: 'wx-miniapp-scan-login',
        wechatMiniProgramCodePayload: {
          encryptedData,
          iv
        },
        options: {
          scope: 'openid profile offline_access'
        }
      })

      if (error) {
        app.showLoginErrorToast()
        return
      }
    }

    const [, loginStateInfo] = await app.authing.getLoginState()

    const { scene } = this.data.options
    wx.request({
      url: 'https://core.mysql.authing-inc.co/api/v3/change-qrcode-status',
      method: 'POST',
      header: {
        'x-authing-app-id': '63ae849aff68b0282d2c4968',
        Authorization: loginStateInfo.access_token
      },
      data: {
        qrcodeId: scene,
        action: 'SCAN'
      },
      success: res => {
        wx.request({
          url: 'https://core.mysql.authing-inc.co/api/v3/change-qrcode-status',
          method: 'POST',
          header: {
            'x-authing-app-id': '63ae849aff68b0282d2c4968',
            Authorization: loginStateInfo.access_token
          },
          data: {
            qrcodeId: scene,
            action: 'CONFIRM'
          },
          success: res => {
            console.log('scan login res: ', res)
          }
        })
      }
    })
  }
})