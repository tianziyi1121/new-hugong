const app = getApp()
const api = require('../../../utils/api.js')
Page({
  data: {
    currentData: ''
  },
  onLoad(){
    this.getData()
  },
  getData() {
    api.requestServerData('/api/Login/about', 'get',{} ,true).then((res) => {
      if(res.data.status == 1) {
        this.setData({
          currentData: res.data.data[0].menu_content
        })
      }
    })
  },
  userDeal() {
    wx.navigateTo({
      url: 'view/view',
    })
  }
  // 分享
  // onShareAppMessage() {
  //   return {
  //     title: app.share.name,
  //     path: 'pages/user/about/about',
  //     success: res => {
  //       app.shareTip()
  //     }
  //   }
  // }
})