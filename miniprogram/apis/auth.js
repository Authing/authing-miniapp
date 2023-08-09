/**
 * 修改二维码状态，授权登录
 * @returns [{
 *  openid: string
 *  unionid: string
 *  sessionKey: string
 * }, undefined]
 */
export async function grantWxapp() {
  const app = getApp()
  const code = await app.authing.getLoginCode()
  const { scene } = app.globalData.scanCodeLoginConfig

  return new Promise(resolve => {
    wx.request({
      url:
        app.globalData.miniappConfig.host +
        `/oauth/wxapp/grant/?alias=wxapp&code=${code}&random=${scene}&enableFetchPhone=true&&useSelfWxapp=false`,
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

/**
 * 授权登录
 * @param {userInfo} options 用户个人信息，包含从 grantWxapp 获取到的 openid 和 unionid 等
 */
export async function authWxapp(options) {
  const app = getApp()
  const { userInfo } = options
  const { scene } = app.globalData.scanCodeLoginConfig

  return new Promise(resolve => {
    wx.request({
      url:
        app.globalData.miniappConfig.host +
        `/oauth/wxapp/redirect?random=${scene}`,
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

/**
 * 扫描控制台个人中心页面身份源二维码，绑定身份源
 * @param {phoneCode} options 微信手机号 code
 */
export async function bindIndentity(options = {}) {
  const { phoneCode } = options
  const app = getApp()
  const { scene } = app.globalData.scanCodeLoginConfig
  const loginCode = await app.authing.getLoginCode()

  return new Promise(resolve => {
    wx.request({
      url:
        app.globalData.miniappConfig.host + `/oauth/wxapp/bind?random=${scene}`,
      method: 'POST',
      data: {
        wxLoginInfo: {
          code: loginCode
        },
        wxPhoneInfo: {
          code: phoneCode
        }
      },
      success: res => {
        if (res.data.code === 200) {
          // 接口 response 中的 res.data.data 为 undefined
          resolve([undefined, res.data])
        } else {
          resolve([res.data || res, undefined])
        }
      },
      fail: res => {
        resolve([res.data || res, undefined])
      }
    })
  })
}
