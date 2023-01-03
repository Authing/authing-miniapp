import { getUserIntegrals, getExchangedRecordList } from '../../apis/index'

import { formatDate } from '../../utils/utils'

Page({
  data: {
    userIntegrals: null,
    exchangedRecordList: [],
    page: 1,
    totalCount: 0
  },

  onLoad() {
    this.getUserIntegrals()
    this.getExchangedRecordList()
  },

  onReachBottom () {
    if (this.data.totalCount && this.data.exchangedRecordList.length >= this.data.totalCount) {
      return
    }
    this.getExchangedRecordList()
  },

  async getUserIntegrals () {
    const [error, res] = await getUserIntegrals()

    if (error) {
      return
    }

    this.setData({
      userIntegrals: res.data
    })
  },

  async getExchangedRecordList () {
    const [error, res] = await getExchangedRecordList({
      pageNo: this.data.page
    })

    if (error) {
      return wx.showToast({
        title: error.message,
        icon: 'none'
      })
    }

    const list = res.data.list.map(item => {
      return {
        ...item,
        createdAt: formatDate(item.createdAt)
      }
    }) || []
    const exchangedRecordList = this.data.exchangedRecordList.concat(list)

    this.setData({
      exchangedRecordList,
      totalCount: res.data.totalCount,
      page: this.data.page + 1
    })
  }
})