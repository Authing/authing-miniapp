import { formatUserInfo } from '../../utils/utils'

import { changeQrcodeStatus } from '../../apis/index'

const app = getApp()

Page({
  data: {
    userInfo: null,
    isShowLoginModal: false
  },

  async onLoad(options = {}) {
    console.log('start options: ', options)

    const { scene } = options

    const [loginStateError] = await app.authing.getLoginState()

    // 通过扫码登录方式直接进入当前页面
    if (scene) {
      app.globalData.scanCodeLoginConfig.scene = scene

      // 未登录，展示弹窗引导用户去登录
      if (loginStateError) {
        this.setData({
          isShowLoginModal: true
        })
      } else {
        // 已登录
        await this.getUserInfo()
        this.authenticatePhoneAndChangeQrcodeStatus()
      }
    } else {
      if (loginStateError) {
        return
      }

      const [userInfoError, userInfo] = await app.authing.getUserInfo()
    
      if (userInfoError) {
        return
      }
      
      this.setData({
        userInfo: formatUserInfo(userInfo)
      })
    }
  },

  onLogin (e) {
    this.setData({
      userInfo: e.detail,
      isShowLoginModal: false
    })
    this.authenticatePhoneAndChangeQrcodeStatus()
  },

  async authenticatePhoneAndChangeQrcodeStatus () {
    // 只有从扫码登录进入，才引导用户绑定手机号
    if (!app.globalData.scanCodeLoginConfig.scene) {
      return
    }

    const [error] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'SCAN'
    })

    if (error) {
      return wx.showToast({
        title: '二维码状态更新失败，请重新扫码'
      })
    }

    // 用户是否绑定手机号
    if (this.data.userInfo.phone) {
      changeQrcodeStatus({
        qrcodeId: app.globalData.scanCodeLoginConfig.scene,
        action: 'CONFIRM'
      })

      wx.navigateTo({
        url: '/pages/scan-qrcode-login-success/scan-qrcode-login-success',
      })
    } else {
      wx.navigateTo({
        url: '/pages/authenticate-phone/authenticate-phone',
      })
    }
  },

  async toLogin () {
    wx.showLoading({
      title: '加载中',
    })

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
      return app.showLoginErrorToast()
    }

    await this.getUserInfo()

    wx.hideLoading()
  },

  async getUserInfo () {
    const [error, userInfo] = await app.authing.getUserInfo()

    if (error) {
      return wx.showToast({
        title: '用户信息获取失败，请重新操作'
      })
    }

    this.setData({
      userInfo: formatUserInfo(userInfo)
    })
  },

  logout () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '退出',
      success: async (res) => {
        if (res.confirm) {
          await app.authing.logout()
          this.setData({
            userInfo: null
          })
        }
      }
    })
  }
})
