// index.js
const app = getApp()

let timer = null

Page({
  onLoad() {
    timer = setTimeout(() => {
      wx.redirectTo({
        url: '/pages/integral-index/integral-index'
      })
    }, 1000)
  },

  onHide () {
    timer && clearTimeout(timer)
  }
})
