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
      wx.showLoading()

      // let encryptedData = ''
      // let iv = ''

      // try {
      //   const res = await wx.getUserProfile({
      //     desc: 'getUserProfile'
      //   })
      //   console.log('getUserProfile res: ', res)
      //   encryptedData = res.encryptedData
      //   iv = res.iv
      // } catch (e) {
      //   return wx.hideLoading()
      // }

      const [error] = await app.authing.loginByCode({
        extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnIdentifier,
        wechatMiniProgramCodePayload: {
          encryptedData: '',
          iv: ''
        },
        options: {
          scope: 'openid profile offline_access'
        }
      })

      if (error) {
        return app.showLoginErrorToast(error)
      }

      await this.getUserInfo()

      wx.hideLoading()
    },

    async getUserInfo () {
      const [error, userInfo] = await app.authing.getUserInfo()

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
    },

    checkin () {
      checkin()
    },

    copyUserId () {
      wx.setClipboardData({
        data: this.data._userInfo.userId
      })
    }
  }
})
