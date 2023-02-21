Page({
  data: {
    link: ''
  },

  onLoad(options) {
    const { url } = options
    this.setData({
      link: decodeURIComponent(url)
    })
  }
})
