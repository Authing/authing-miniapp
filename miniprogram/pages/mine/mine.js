import { formatUserInfo } from '../../utils/utils'

import { checkin, logout, checkExistsUser } from '../../apis/index'

const app = getApp()

Page({
  data: {
    userInfo: null,
    isShowTabbar: false
  },

  async onLoad() {
    wx.hideHomeButton()
    wx.showLoading()

    const { scene } = app.globalData.scanCodeLoginConfig

    await app.getAuthing({
      qrcodeId: scene
    })

    this.setData({
      isShowTabbar: !scene
    })

    // 通过扫码登录方式直接进入当前页面
    if (scene) {
      return this.authenticatePhoneAndChangeQrcodeStatus()
    }

    // 直接打开小程序进入当前页面
    const [loginStateError] = await app.authing.getLoginState()
    if (loginStateError) {
      return wx.hideLoading()
    }

    const [userInfoError, userInfo] = await app.authing.getUserInfo()
    if (userInfoError) {
      return wx.hideLoading()
    }

    this.setData({
      userInfo: formatUserInfo(userInfo)
    })

    wx.hideLoading()
  },

  onHide() {
    wx.hideLoading()
  },

  onShow() {
    this.getUserInfo()
  },

  async onLogin(e) {
    this.setData({
      userInfo: e.detail
    })
    checkin()
  },

  async authenticatePhoneAndChangeQrcodeStatus() {
    // 只有从扫码登录进入，才引导用户绑定手机号
    if (!app.globalData.scanCodeLoginConfig.scene) {
      return
    }

    const [checkExistUserError, checkExistUserInfo] = await checkExistsUser()
    if (checkExistUserError) {
      return wx.showToast({
        title: checkExistUserError.message,
        icon: 'none'
      })
    }

    const { hasBindUser, hasBindPhone } = checkExistUserInfo

    // 老用户 & 已绑定手机
    if (hasBindUser && hasBindPhone) {
      return app.invokeRemainLoginCodeSteps()
    }

    // 其他场景跳转到授权页
    wx.navigateTo({
      url: `/pages/authenticate-phone/authenticate-phone?hasBindUser=${+hasBindUser}&hasBindPhone=${+hasBindPhone}`
    })
  },

  async getUserInfo() {
    if (!app.authing) {
      return
    }

    const [loginStateError] = await app.authing.getLoginState()

    if (loginStateError) {
      return
    }

    const [error, userInfo] = await app.authing.getUserInfo()

    if (error) {
      return wx.showToast({
        title: '用户信息获取失败，请重新操作',
        icon: 'none'
      })
    }

    this.setData({
      userInfo: formatUserInfo(userInfo)
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '退出',
      success: async res => {
        if (!res.confirm) {
          return
        }

        await logout()

        this.setData({
          userInfo: null
        })

        app.resetScanCodeLoginConfig({
          scene: '',
          bind: 0
        })
      }
    })
  }
})
