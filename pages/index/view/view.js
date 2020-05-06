const app = getApp()
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    type: 2,
    url: '',
    urlData: ''
  },
  onLoad(options)    {},
  bindSelect(e) {
    let role_id = e.currentTarget.dataset.type  //1、护工 2、患者
    this.setData({
      type: role_id
    })
  },
  bindBtn(){
    if (!this.data.type){
      toolTip.noPhotoTip('请选择身份')
      return false;
    }
    wx.setStorageSync('role_id', this.data.type)
    wx.navigateTo({
      url: '../index' + this.data.urlData
    })
  },
  // //  用户点击右上角分享
  // onShareAppMessage() {
  //   return {
  //     title: app.share.name,
  //     path: 'pages/index/view/view',
  //     success: res => {
  //       app.shareTip()
  //     }
  //   }
  // }
})