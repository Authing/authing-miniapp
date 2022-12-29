const app = getApp()

Component({
  properties: {
    userInfo: {
      type: Object,
      value: null
    }
  },

  data: {
    _userInfo: null
  },

  lifetimes: {
    attached () {
      this.setData({
        _userInfo: this.userInfo
      })
    }
  },

  observers: {
    userInfo (userInfo) {
      this.setData({
        _userInfo: userInfo
      })
    }
  },

  methods: {
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
        _userInfo: userInfo
      })

      this.triggerEvent('onLogin', userInfo)
    }
  }
})
