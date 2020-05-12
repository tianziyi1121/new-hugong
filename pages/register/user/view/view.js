// pages/register/user/view/view.js
const api = require("../../../../utils/api")
const app = getApp()
Page({
  data: {
    state: null,
    status: null,
    id :null
  },
  onLoad: function (options) {
    let title = null
    if (options.states == 1){
      title = "审核状态"
    }else{
      title = "护工注册"
    }
    wx.setNavigationBarTitle({
      title: title
    })
    this.setData({
      state: options.states,
      status: options.status
    })
  }, 
  home(e) {
    let url
    if(e.currentTarget.dataset.index == 1){
      if (this.data.state == 1){
        //  url = '../../../home/home',
         api.requestServerData('nursing_workers/nursing_place', 'post', { nursingId:this.id }, true).then((res) => {
          // resolve(res)
          console.log(res);
          
        })
         }else{
        wx.navigateTo({
          url: '../../../user/message/message'
        })
        return false
      }
    } else {
      url = '../../../user/user'
    }
    wx.switchTab({
      url: url
    })
  }
  // // 分享
  // onShareAppMessage() {
  //   return {
  //     title: app.share.name,
  //     path: 'pages/register/user/view/view',
  //     success: res => {
  //       app.shareTip()
  //     }
  //   }
  // }
})