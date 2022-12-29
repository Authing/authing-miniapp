Component({
  properties: {

  },

  data: {

  },

  methods: {
    showRules () {
      wx.showModal({
        title: '活动规则',
        content: '这里是活动规则这里是活动规则这里是活动规则这里是活动规则这里是活动规则这里是活动规则这里是活动规则这里是活动规则这里是活动规则这里是活动规则',
        showCancel: false,
        confirmText: '好的'
      })
    },

    showExchangeRecord () {
      wx.navigateTo({
        url: '/pages/exchange-records/exchange-records',
      })
    }
  }
})
