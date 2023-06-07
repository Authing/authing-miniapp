import { Authing } from '@authing/miniapp-wx'

import { grantWxapp, authWxapp } from './apis/index'

// ***** 上线前需要修改环境变量 *****
const environment = 'prod'

const apiHostMap = {
  why: 'https://68490cce.r7.cpolar.top',
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

  resetScanCodeLoginConfig(config) {
    this.globalData.scanCodeLoginConfig = {
      ...this.globalData.scanCodeLoginConfig,
      ...config
    }
  },

  initAuthing(options = {}) {
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

  resetAuthing() {
    this.authing = null
  },

  async getAuthing(options = {}) {
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

  async getAppConfig(options = {}) {
    const { qrcodeId = '' } = options

    const data = {}

    if (qrcodeId) {
      data.qrcodeId = qrcodeId
    }

    return new Promise(resolve => {
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

  showLoginErrorToast(error) {
    wx.showToast({
      title: error.message || '请重新登录',
      icon: 'none'
    })
  },

  async loginByCode() {
    return await this.authing.loginByCode({
      extIdpConnidentifier: this.globalData.miniappConfig.extIdpConnIdentifier,
      wechatMiniProgramCodePayload: {
        encryptedData: '',
        iv: ''
      },
      options: {
        scope: 'openid profile offline_access'
      }
    })
  },

  async invokeRemainLoginCodeSteps() {
    const [loginByCodeError] = await this.loginByCode()

    if (loginByCodeError) {
      return wx.showToast({
        title: loginByCodeError.message,
        icon: 'none'
      })
    }

    const [userInfoError, userInfo] = await this.authing.getUserInfo()

    if (userInfoError) {
      return wx.showToast({
        title: userInfoError.message || '用户信息获取失败，请重新扫码',
        icon: 'none'
      })
    }

    this.changeQrcodeStatusAndToLoginSuccessPage({
      userInfo
    })
  },

  async changeQrcodeStatusAndToLoginSuccessPage(options) {
    const { userInfo } = options

    wx.showLoading()

    const [grantWxappError, grantWxappInfo] = await grantWxapp()

    if (grantWxappError) {
      return wx.showToast({
        title: grantWxappError.message,
        icon: 'none'
      })
    }

    userInfo.openid = grantWxappInfo.openid
    userInfo.unionid = grantWxappInfo.unionid

    const [authWxappError] = await authWxapp({
      userInfo
    })

    if (authWxappError) {
      return wx.showToast({
        title: authWxappError.message,
        icon: 'none'
      })
    }

    wx.hideLoading()

    this.toLoginSuccessPage()
  },

  toLoginSuccessPage() {
    const pageStack = getCurrentPages()
    const url = '/pages/scan-qrcode-login-success/scan-qrcode-login-success'

    if (pageStack.length > 1) {
      return wx.redirectTo({
        url
      })
    }

    wx.navigateTo({
      url
    })
  }
})
