const app = getApp()
const api = require('../../../../utils/api.js')
Page({
  data: {
    currentCenter: ''
  },
  onLoad: function (options) {
    this.getData()
  },
  getData(){
    api.requestServerData('/api/login/registration', 'get', {}, true).then((res) => {
      if (res.data.status == 1) {
        this.setData({
          currentCenter: res.data.data[0].menu_content
        })
      }
    })
  }
})