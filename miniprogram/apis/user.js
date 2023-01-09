const app = getApp()

export async function updatePhone (options) {
  const { phoneCountryCode, phone, codeForUpdatePhone } = options
  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve([loginStateError, undefined])
  }

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v3/wechat-miniprogram/updatePhone',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
      },
      data: {
        phone,
        phoneCountryCode,
        codeForUpdatePhone
      },
      success: res => {
        if (res.data.statusCode === 200) {
          resolve([undefined, res.data.data])
        } else {
          resolve([res.data, undefined])
        }
      },
      fail: (res) => {
        resolve([res, undefined])
      }
    })
  })
}

export async function getCryptedPhone (options = {}) {
  const { extIdpConnIdentifier, code } = options

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v3/get-wechat-miniprogram-phone-data',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId
      },
      data: {
        extIdpConnidentifier: extIdpConnIdentifier,
        code
      },
      success: res => {
        if (res.data.statusCode === 200) {
          resolve([undefined, res.data.data])
        } else {
          resolve([res.data, undefined])
        }
      },
      fail: res => {
        resolve([res, undefined])
      }
    })
  })
}

export async function logout () {
  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  // 1. 登录态过期
  // 2. 未登录过
  if (loginStateError) {
    await app.authing.clearLoginState()
    return Promise.resolve([undefined, true])
  }

  const data = {}
  const validKeys = ['id_token', 'access_token', 'refresh_token']
  validKeys.forEach(key => {
    if (loginStateInfo[key]) {
      data[key] = loginStateInfo[key]
    }
  })

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v3/wechat-miniprogram/logout',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
      },
      data,
      success: res => {
        if (res.data.statusCode === 200) {
          resolve([undefined, res.data.data])
        } else {
          resolve([res.data, undefined])
        }
      },
      fail: res => {
        resolve([res, undefined])
      },
      complete: () => {
        app.authing.clearLoginState()
      }
    })
  })
}

export async function checkExistsUser () {
  const loginCode = await app.authing.getLoginCode()

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v3/wechat-miniprogram/checkExistsUser',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId
      },
      data: {
        code: loginCode,
        encryptedData: '',
        iv: '',
        extIdpConnidentifier: app.globalData.miniappConfig.extIdpConnIdentifier
      },
      success: res => {
        if (res.data.statusCode === 200) {
          resolve([undefined, res.data.data])
        } else {
          resolve([res.data, undefined])
        }
      },
      fail: res => {
        resolve([res, undefined])
      }
    })
  })
}
