const app = getApp()
const api = require('../../utils/api.js')
Component({
  properties: {},
  data: {
    ls_flag: true
  },
  attached() {
    wx.showLoading({
      title: '加载中',
    })
  },
  methods: {
    hideShadow() {
      wx.hideLoading()
    },
    lsBack(){
      this.setData({
        ls_flag: false
      })
    }
  }
})