Component({
  properties: {
    userInfo: {
      type: Object,
      value: null
    },
    userIntegrals: {
      type: Object,
      value: null
    }
  },

  data: {
    isShowActiveRule: false,
    activeRuleContent: `每天首次登录可获取 10 积分，积分可用于兑换 Authing 用户池体验券。\n\n 本商城解释权归北京蒸汽记忆科技有限公司所有。`
  },

  methods: {
    showRules () {
      this.setData({
        isShowActiveRule: true
      })
    },

    onCloseActiveRuleModal () {
      this.setData({
        isShowActiveRule: false
      })
    },

    showExchangeRecord () {
      wx.navigateTo({
        url: '/pages/exchange-records/exchange-records',
      })
    }
  }
})
