const routerMap = {
  integral: '/pages/integral-index/integral-index',
  mine: '/pages/mine/mine'
}

Component({
  properties: {
    active: {
      type: String,
      value: 'integral'
    }
  },

  data: {
    _active: '',
    tabbarList: [{
      name: 'integral',
      iconPath: './images/integral-icon.svg',
      selectedIconPath: './images/integral-icon-selected.svg'
    }, {
      name: 'mine',
      iconPath: './images/mine-icon.svg',
      selectedIconPath: './images/mine-icon-selected.svg'
    }]
  },

  lifetimes: {
    attached () {
      this.setData({
        _active: this.data.active
      })
    }
  },

  methods: {
    onClickTab (e) {
      const { name } = e.currentTarget.dataset
      wx.redirectTo({
        url: routerMap[name]
      })
    }
  }
})
