const app = getApp()

export async function updatePhone (options) {
  const { phone } = options
  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve([loginStateError, undefined])
  }

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v2/users/updatePhone',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
      },
      data: {
        phone
      },
      success: res => {
        if (res.data.code === 200) {
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
