Component({
  properties: {
    integralData: {
      type: Object,
      value: null
    }
  },

  methods: {
    copyCode(e) {
      const { couponcode } = e.target.dataset
      wx.setClipboardData({
        data: couponcode
      })
    }
  }
})
