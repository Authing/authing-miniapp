Component({
  properties: {
    integralData: {
      type: Object,
      data: null
    },
    userInfo: {
      type: Object,
      data: null
    },
    userIntegrals: {
      type: Object,
      data: null
    }
  },

  methods: {
    toExchange () {
      if (!this.data.userInfo) {
        return wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
      }

      const { integralData, userIntegrals } = this.data

      // 已抢光
      if (integralData && integralData.remain <= 0) {
        return wx.showToast({
          title: '已抢光',
          icon: 'none'
        })
      }

      // 积分不足
      if (userIntegrals && userIntegrals.checkinPointsBalance < integralData.points) {
        return wx.showToast({
          title: '积分不足',
          icon: 'none'
        })
      }

      this.triggerEvent('toExchange', {
        id: this.data.integralData.id
      })
    }
  }
})
