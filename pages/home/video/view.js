const app = getApp();
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
const common = require('../../../utils/common.js')
const agoraMiniappSDK = require('../../../utils/Agora_Miniapp_SDK_for_WeChat.js')
Page({
  data: {
    videoUp: false,
    shadow: '',
    content: '',
    p: 1,
    keyworkd: '',
    currentList: [],
    pn: 1,
    hospitalData: [],
    noData: false,
    height: 0,
    loadingFlag: true
  },
  onLoad: function (options) {
    this.noData = this.selectComponent("#noData")
    common.windowHeight().then( res => {
      this.setData({
        height: res - 305
      })
    })
    this.getData();
    this.hospitalList();
  },
  // footer
  catchNav (e) {
    videoPage
  },
  // get data
  getData () {
    api.requestServerData("/api/other_cate/get_chat_message", "get", {
      uid: 1,
      token: app.globalData.token,
      p: this.data.p,
      keyworkd: this.data.keyworkd
    }, false).then((res) => {
      let data = res.data.data
      let pn = this.data.p - 1
      if (this.data.p == 1 && data.length == 0) {
        this.noData.noData()
      } else {
        this.noData.noDataTrue()
        this.setData({
          ['currentList[' + pn + ']']: data
        })
      }
      
    })
  },
  // hospital list
  hospitalList () {
    common.hospitalList(1, app.globalData.token, this.data.pn, 0).then( res => {
      if (res.status == 1) {
        let p = this.data.pn - 1
        this.setData({
          ['hospitalData[' + p + ']']: res.data.list
        })
      }else{
        toolTip.noPhotoTip(res.msg)
      }
    })
  },
  bindType () {
    if (this.data.videoUp) {
      this.catchList()
      return false
    }
    this.setData({
      videoUp: true,
      shadow: 1,
      content: 1
    })
  },
  catchList() {
    this.setData({
      shadow: 2,
      content: 2
    })
    setTimeout(() => {
      this.setData({
        videoUp: false
      })
    },400)
  },
  catcahHospital (e) {
    let data = e.currentTarget.dataset
    this.catchList()
    setTimeout(() => {
      wx.navigateTo({
        url: 'view/view?data=' + data.data +'&id=' + data.id,
      })
    }, 400)
  },
  onCatchNav (e) {
    
  },
  // hospital Pull on loading
  bindTolower() {
    if (this.data.hospitalData[this.data.pn - 1].length == 10) {
      this.data.pn += 1
      this.hospitalList()
    } else {
      this.setData({
        naData: true
      })
    }
  },
  // list Pull on loading
  bindList () {
    this.setData({
      loadingFlag: false
    })
    this.load = this.selectComponent("#load")
    if (this.data.currentList[this.data.pn- 1].length == 10) {
      this.data.p += 1
      this.getData()
    } else {
      this.load.change();
    }
  },
  bindData () {
    wx.navigateTo({
      url: '../videoPage/videoPage',
    })
  }
})