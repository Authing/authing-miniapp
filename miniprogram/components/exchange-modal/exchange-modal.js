Component({
  properties: {
    isShow: {
      type: Boolean,
      value: false
    }
  },

  data: {
    _isShow: false
  },

  lifetimes: {
    attached () {
      this.setData({
        _isShow: this.data.isShow
      })
    }
  },

  observers: {
    'isShow': function (value) {
      this.setData({
        _isShow: value
      })
    }
  },

  methods: {
    authenticatePhone (e) {
      this.setData({
        _isShow: false
      })
    }
  }
})
