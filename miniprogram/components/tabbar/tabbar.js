const app = getApp()

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
    isIpx: app.globalData.isIpx,
    _active: '',
    tabbarList: [
      {
        name: 'integral',
        iconPath: 'https://files.authing.co/authing-miniapp/integral-icon.svg',
        selectedIconPath:
          'https://files.authing.co/authing-miniapp/integral-icon-selected.svg'
      },
      {
        name: 'mine',
        iconPath: 'https://files.authing.co/authing-miniapp/mine-icon.svg',
        selectedIconPath:
          'https://files.authing.co/authing-miniapp/mine-icon-selected.svg'
      }
    ]
  },

  lifetimes: {
    attached() {
      this.setData({
        _active: this.data.active
      })
    }
  },

  methods: {
    onClickTab(e) {
      const { name } = e.currentTarget.dataset

      if (name === this.data._active) {
        return
      }

      wx.redirectTo({
        url: routerMap[name]
      })
    }
  }
})
