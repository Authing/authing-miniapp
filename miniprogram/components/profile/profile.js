import { formatUserInfo } from '../../utils/utils'

import { checkin } from '../../apis/index'

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
        _userInfo: this.data.userInfo
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
        extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnidentifier,
        wechatMiniProgramCodePayload: {
          encryptedData,
          iv
        },
        options: {
          scope: 'openid profile offline_access'
        }
      })

      if (error) {
        console.log('loginByCode error: ', error)
        return wx.showModal({
          content: JSON.stringify(error)
        })
        return app.showLoginErrorToast()
      }

      await this.getUserInfo()

      wx.hideLoading()
    },

    async getUserInfo () {
      const [error, userInfo] = await app.authing.getUserInfo()

      if (error) {
        return wx.showToast({
          title: '用户信息获取失败，请重新登录'
        })
      }

      const _userInfo = formatUserInfo(userInfo)

      this.setData({
        _userInfo
      })

      this.triggerEvent('onLogin', _userInfo)
    },

    checkin () {
      checkin()
    }
  }
})
