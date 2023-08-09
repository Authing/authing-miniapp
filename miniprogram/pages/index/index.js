import { parseSearch } from '../../utils/utils'

const app = getApp()

let timer = null

Page({
  async onLoad(options = {}) {
    const { scene } = options
    const decodedScene = decodeURIComponent(scene || '')

    let query = {}
    if (decodedScene) {
      if (!/\w{1,}=\w{1,}&?/.test(decodedScene)) {
        query = {
          rd: decodedScene,
          bind: '0'
        }
      } else {
        query = parseSearch(decodedScene || '')
      }
    }

    // 每次重新进入小程序都需要：
    // 1. 重置 Authing 小程序 SDK
    // 2. 重置 scene
    // 3. 清除上一次的用户登录态
    app.resetAuthing()
    app.resetScanCodeLoginConfig({
      scene: query.rd || '',
      bind: query.bind === '1' ? 1 : 0
    })
    wx.clearStorageSync()

    timer = setTimeout(() => {
      const { scene, bind } = app.globalData.scanCodeLoginConfig
      let url = ''
      if (bind === 1 && scene) {
        // 从控制台个人中心身份源绑定处扫码
        url = '/pages/bind/bind'
      } else if (scene) {
        // Guard 小程序扫码登录
        url = '/pages/mine/mine'
      } else {
        // 直接打开小程序
        url = '/pages/integral-index/integral-index'
      }
      wx.redirectTo({
        url
      })
    }, 1000)
  },

  clearTimer() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  },

  onUnload() {
    this.clearTimer()
  }
})
