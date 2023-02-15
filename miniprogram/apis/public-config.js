export async function getPublicConfig (options) {
  const app = getApp()

  const { appId } = app.globalData.miniappConfig

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + `/api/v2/applications/${appId}/public-config`,
      method: 'GET',
      success: res => {
        if (res.data.code === 200) {
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
