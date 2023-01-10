export async function changeQrcodeStatus (options) {
  const app = getApp()
  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve(loginStateError, undefined)
  }

  const { qrcodeId, action } = options

  return new Promise((resolve) => {
    // https://api.authing.cn/openapi/v3/authentication/#tag/%E7%99%BB%E5%BD%95/%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95/operation/SignInV3Controller_changeQRCodeStatus
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v3/change-qrcode-status',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
      },
      data: {
        qrcodeId,
        action
      },
      success: res => {
        if (res.data.statusCode === 200) {
          resolve([undefined, res.data])
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
