import { Authing } from '@authing/miniapp-wx'

const allMiniappConfig = {
  test: {
    appId: '63ae849aff68b0282d2c4968',
    host: 'https://core.mysql.authing-inc.co',
    userPoolId: '63ae80eca21547efd0369aec',
    extIdpConnidentifier: 'wx-miniapp-scan-login'
  },
  prod: {

  }
}

const environment = 'test'

const miniappConfig = allMiniappConfig[environment]

const authing = new Authing(miniappConfig)

App({
  globalData: {
    miniappConfig,
    environment,
    scanCodeLoginConfig: {}
  },

  authing,

  showLoginErrorToast () {
    wx.showToast({
      title: '操作失败，请重试',
    })
  }
})
