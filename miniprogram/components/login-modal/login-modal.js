import { formatUserInfo } from '../../utils/utils'

const app = getApp()

Component({
  properties: {
    isShow: {
      type: Boolean,
      value: false
    }
  },

  data: {
    _isShow: false
  },

  observers: {
    isShow (value) {
      this.setData({
        _isShow: value
      })
    }
  },

  methods: {
    async toLogin () {
      const { encryptedData, iv } = await wx.getUserProfile({
        desc: 'getUserProfile'
      })
      
      const [error] = await app.authing.loginByCode({
        extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
        wechatMiniProgramCodePayload: {
          encryptedData,
          iv
        },
        options: {
          scope: 'openid profile offline_access'
        }
      })

      if (error) {
        return app.showLoginErrorToast()
      }

      this.getUserInfo()
    },

    async getUserInfo () {
      wx.showLoading({
        title: '加载中'
      })

      const [error, userInfo] = await app.authing.getUserInfo()

      wx.hideLoading()

      if (error) {
        return wx.showToast({
          title: '用户信息获取失败，请重新登录',
          icon: 'none'
        })
      }

      const _userInfo = formatUserInfo(userInfo)

      this.setData({
        _userInfo
      })

      this.triggerEvent('onLogin', _userInfo)
    }
  }
})
