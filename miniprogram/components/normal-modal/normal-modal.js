Component({
  properties: {
    isShow: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: ''
    },
    content: {
      type: String,
      value: ''
    },
    onCloseText: {
      type: String,
      value: '好的'
    }
  },

  methods: {
    onClose () {
      this.triggerEvent('onClose')
    }
  }
})
