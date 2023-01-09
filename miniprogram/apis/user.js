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

  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve([loginStateError, undefined])
  }

  return new Promise(resolve => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v3/get-wechat-miniprogram-phone-data',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
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
