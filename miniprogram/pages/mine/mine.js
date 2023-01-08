import { formatUserInfo } from '../../utils/utils'

import { changeQrcodeStatus, checkin } from '../../apis/index'

const app = getApp()

Page({
  data: {
    userInfo: null,
    isShowLoginModal: false,
    isShowTabbar: false
  },

  async onLoad() {
    wx.hideHomeButton()

    const { scene } = app.globalData.scanCodeLoginConfig

    await app.getAuthing({
      qrcodeId: scene
    })

    const [loginStateError] = await app.authing.getLoginState()

    // 通过扫码登录方式直接进入当前页面
    if (scene) {
      this.setData({
        isShowTabbar: app.globalData.miniappConfig.showPointsFunc
      })

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
      this.setData({
        isShowTabbar: app.globalData.miniappConfig.showPointsFunc
      })

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

  onShow () {
    this.getUserInfo()
  },

  async onLogin (e) {
    this.setData({
      userInfo: e.detail,
      isShowLoginModal: false
    })
    checkin()
    this.authenticatePhoneAndChangeQrcodeStatus()
  },

  async authenticatePhoneAndChangeQrcodeStatus () {
    // 只有从扫码登录进入，才引导用户绑定手机号
    if (!app.globalData.scanCodeLoginConfig.scene) {
      return
    }

    // 先修改一次二维码状态，确认已扫码
    const [scanError] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'SCAN'
    })

    if (scanError) {
      return wx.showToast({
        title: scanError.message || '二维码状态更新失败，请重新扫码',
        icon: 'none'
      })
    }

    // 未绑定手机号
    if (!this.data.userInfo.phone) {
      return wx.navigateTo({
        url: '/pages/authenticate-phone/authenticate-phone',
      })
    }

    // 如果已绑定手机号：
    // 1. 修改二维码状态
    // 2. 跳转到登录成功页面
    const [confirmError] = await changeQrcodeStatus({
      qrcodeId: app.globalData.scanCodeLoginConfig.scene,
      action: 'CONFIRM'
    })

    if (confirmError) {
      return wx.showToast({
        title: confirmError.message || '二维码状态更新失败，请重新扫码',
        icon: 'none'
      })
    }

    wx.navigateTo({
      url: '/pages/scan-qrcode-login-success/scan-qrcode-login-success',
    })
  },

  async getUserInfo () {
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

  logout () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '退出',
      success: async (res) => {
        if (!res.confirm) {
          return
        }

        await app.authing.logout()

        this.setData({
          userInfo: null
        })

        app.resetScanCodeLoginConfig({
          scene: ''
        })
      }
    })
  }
})
