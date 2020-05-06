const app = getApp();
const api = require('../../../../utils/api.js')
const toolTip = require('../../../../utils/toolTip.js')
const common = require('../../../../utils/common.js')
Page({
  data: {
    id: null,
    p: 1,
    hospitalData:  []
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.data
    })
    this.getData(options.id)
  },
  onReady: function () {

  },
  onShow: function () {

  },
  getData (id) {
    common.hospitalList(1, app.globalData.token, this.data.p, id).then(res => {
      if (res.status == 1) {
        let pn = this.data.p - 1
        this.setData({
          ['hospitalData['+ pn +']']: res.data.list
        })
      } else {
        toolTip.noPhotoTip(res.msg)
      }
    })
  },
  bindlist (e) {
    let data = e.currentTarget.dataset
    wx.navigateTo({
      url: 'view/view?title=' + data.title + "&id=" + data.id
    })
  }
})