export async function grantWxapp () {
  const app = getApp()
  const code  = await app.authing.getLoginCode()
  const { scene } = app.globalData.scanCodeLoginConfig

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + `/oauth/wxapp/grant/?alias=wxapp&code=${code}&random=${scene}&enableFetchPhone=true&&useSelfWxapp=false`,
      method: 'GET',
      success: res => {
        if (res.data.code === 200) {
          resolve([undefined, res.data.data])
        } else {
          resolve([res.data, undefined])
        }
      },
      fail: res => {
        resolve([res.data, undefined])
      }
    })
  })
}

export async function authWxapp (options) {
  const app = getApp()
  const { userInfo } = options
  const { scene } = app.globalData.scanCodeLoginConfig

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + `/oauth/wxapp/redirect?random=${scene}`,
      method: 'POST',
      data: userInfo,
      success: res => {
        if (res.data.code === 200) {
          // 接口 response 中的 res.data.data 为 undefined
          resolve([undefined, res.data])
        } else {
          resolve([res.data, undefined])
        }
      },
      fail: res => {
        resolve([res.data, undefined])
      }
    })
  })
}