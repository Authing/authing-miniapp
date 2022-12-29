const app = getApp()

Page({
  data: {
    userInfo: null
  },

  async onLoad(options) {
    const [loginStateError] = await app.authing.getLoginState()

    if (loginStateError) {
      return
    }
    
    const [userInfoError, userInfo] = await app.authing.getUserInfo()
    
    if (userInfoError) {
      return
    }
    
    this.setData({
      userInfo
    })
  },

  onLogin (userInfo) {
    this.setData({
      userInfo
    })
  },

  async toLogin () {
    const { encryptedData, iv } = await wx.getUserProfile({
      desc: 'getUserProfile'
    })
    
    const [error] = await app.authing.loginByCode({
      extIdpConnidentifier: 'authing-zhaoyiming-miniprogram',
      wechatMiniProgramCodePayload: {
        encryptedData,
        iv
      },
      options: {
        scope: 'openid profile offline_access'
      }
    })

    if (error) {
      return wx.showToast({
        title: '登录失败，请重新登录'
      })
    }

    this.getUserInfo()
  },

  async getUserInfo () {
    const [error, userInfo] = await app.authing.getUserInfo()

    if (error) {
      return wx.showToast({
        title: '用户信息获取失败，请重新登录'
      })
    }

    this.setData({
      userInfo
    })
  }
})
