Component({
  properties: {
    isShow: {
      type: Boolean,
      value: false
    },
    integralData: {
      type: Object,
      value: null
    }
  },

  methods: {
    authenticatePhone (e) {
      this.triggerEvent('close', e.detail)
    }
  }
})
