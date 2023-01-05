const app = getApp()

/**
 * 积分列表
 */
export async function getIntegralList () {
  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v2/points-vouchers/list',
      method: 'GET',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId
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

/**
 * 获取用户积分
 */
export async function getUserIntegrals () {
  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve([loginStateError, undefined])
  }

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v2/users-points/mypoints',
      method: 'GET',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
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

/**
 * 签到
 */
export async function checkin () {
  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve([loginStateError, undefined])
  }

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v2/users-points/checkin',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
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

/**
 * 兑换积分
 */
export async function exchangeIntegral (options) {
  const { vouchersCode } = options

  if (!vouchersCode) {
    return Promise.resolve([{
      message: 'vouchersCode is not defined'
    }, undefined])
  }

  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve([loginStateError, undefined])
  }

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v2/users-points/redeem',
      method: 'POST',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
      },
      data: {
        vouchersCode
      },
      success: res => {
        console.log('res.data: ', res.data)
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

/**
 * 用户积分兑换记录
 */
export async function getExchangedRecordList (options) {
  const { pageNo = 1, pageSize = 10 } = options

  const [loginStateError, loginStateInfo] = await app.authing.getLoginState()

  if (loginStateError) {
    return Promise.resolve([loginStateError, undefined])
  }

  return new Promise((resolve) => {
    wx.request({
      url: app.globalData.miniappConfig.host + '/api/v2/users-points/pageRedeemHist',
      method: 'GET',
      header: {
        'x-authing-app-id': app.globalData.miniappConfig.appId,
        Authorization: loginStateInfo.access_token
      },
      data: {
        pageNo,
        pageSize
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
