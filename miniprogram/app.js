import { Authing } from '@authing/miniapp-wx'

const configAPIHost = 'https://core.mysql.authing-inc.co'

App({
  globalData: {
    miniappConfig: {
      // 以下字段用接口动态获取
      host: '',
      appId: '',
      appName: '',
      userPoolId: '',
      extIdpConnIdentifier: '',
      showPointsFunc: false
    },
    scanCodeLoginConfig: {
      // 小程序扫码登录的 scene
      scene: ''
    }
  },

  authing: null,

  initAuthing (options = {}) {
    const { userpool, app, extIdpConnIdentifier, host, showPointsFunc } = options

    this.globalData.miniappConfig = {
      appId: app.id,
      appName: app.name,
      userPoolId: userpool.id,
      host,
      extIdpConnIdentifier,
      showPointsFunc
    }

    this.authing = new Authing({
      appId: app.id,
      host,
      userPoolId: userpool.id
    })
  },

  async getAuthing (options = {}) {
    if (this.authing) {
      return this.authing
    }

    const { qrcodeId } = options

    const [error, config] = await this.getAppConfig({
      qrcodeId
    })

    if (error) {
      wx.showToast({
        title: error.message || 'App config 获取失败',
        icon: 'none'
      })
      return null
    }

    this.initAuthing(config.data)

    return this.authing
  },

  async getAppConfig (options = {}) {
    const { qrcodeId = '' } = options

    const data = {}

    if (qrcodeId) {
      data.qrcodeId = qrcodeId
    }

    return new Promise((resolve) => {
      wx.request({
        url: configAPIHost + '/api/v2/wechat-miniprogram-config/launch-params',
        method: 'GET',
        data,
        success: res => {
          if (res.data.code === 200) {
            resolve([undefined, res.data])
          } else {
            resolve([res.data, undefined])
          }
        },
        fail: res => {
          resolve([res, undefined])
        }
      })
    })
  },

  showLoginErrorToast () {
    wx.showToast({
      title: '请重新登录',
      icon: 'none'
    })
  }
})
