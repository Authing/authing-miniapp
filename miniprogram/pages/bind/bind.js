import { bindIndentity } from '../../apis/auth'

const app = getApp()

Page({
  data: {
    userInfo: null,
    appName: '',
    pageOptions: {}
  },

  async onLoad() {
    const { scene } = app.globalData.scanCodeLoginConfig
    await app.getAuthing({
      qrcodeId: scene
    })
    this.setData({
      appName: app.globalData.miniappConfig.appName
    })
  },

  onUnload() {
    this.clearScanCodeLoginConfig()
  },

  clearScanCodeLoginConfig() {
    app.resetScanCodeLoginConfig({
      scene: '',
      bind: 0
    })
  },

  async authenticatePhoneAndInvokeBind(e) {
    const { code } = e.detail

    const [error, bindInfo] = await bindIndentity({
      phoneCode: code
    })

    if (error) {
      return wx.showToast({
        title: error.message,
        icon: 'none'
      })
    }

    wx.showToast({
      title: bindInfo.message || '绑定成功',
      icon: 'none'
    })
  }
})
