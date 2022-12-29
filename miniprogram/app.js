const { Authing } = require('@authing/miniapp-wx')

const authing = new Authing({
  appId: '630ed3137dd6f2fd7001da24',
  host: 'https://test-auth-zhaoyiming.authing.cn',
  userPoolId: '62e221f85f5ac5cc47037a39'
})

App({
  globalData: {
    
  },

  authing,

  onLaunch() {
    
  }
})
