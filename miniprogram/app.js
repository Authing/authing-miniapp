import { Authing } from '@authing/miniapp-wx'

// ***** 上线前需要修改环境变量 *****
const environment = 'pre'

const apiHostMap = {
  test: 'https://core.mysql.authing-inc.co',
  pre: 'https://core.pre.authing.cn',
  prod: 'https://core.authing.cn'
}

const configAPIHost = apiHostMap[environment]

const systemInfo = wx.getSystemInfoSync()
const isIpx = systemInfo.model.indexOf('iPhone X') > -1

App({
  globalData: {
    isIpx,
    miniappConfig: {
      host: '',
      // 以下字段用接口动态获取
      appId: '',
      appName: '',
      userPoolId: '',
      extIdpConnIdentifier: '',
      showPointsFunc: false
    },
    scanCodeLoginConfig: {
      // 小程序扫码登录的 scene
      scene: ''
    },
    userInfo: null
  },

  authing: null,

  resetScanCodeLoginConfig (config) {
    this.globalData.scanCodeLoginConfig = {
      ...this.globalData.scanCodeLoginConfig,
      ...config
    }
  },

  initAuthing (options = {}) {
    const { userpool, app, extIdpConnIdentifier, showPointsFunc } = options

    this.globalData.miniappConfig = {
      appId: app.id,
      appName: app.name,
      userPoolId: userpool.id,
      extIdpConnIdentifier,
      showPointsFunc,
      host: configAPIHost
    }

    this.authing = new Authing({
      appId: app.id,
      host: configAPIHost,
      userPoolId: userpool.id
    })
  },

  resetAuthing () {
    this.authing = null
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

  showLoginErrorToast (error) {
    wx.showToast({
      title: error.message || '请重新登录',
      icon: 'none'
    })
  }
})
