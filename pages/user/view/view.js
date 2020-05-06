const app = getApp()
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    lastTiles: '是否删除该收藏?',
    // 弹窗
    oshowFlag: true,
    // 当前数据
    currentList: [],
    index: null,
    // 请求参数列表
    list: {
      type: 1,  // 分类
      p: 1, // 页数
      token: null,
      uid: null
    },
    uid: null,
    token: null,
    // 加载
    loadingFlag: true,
    topFlag: false,
    // 删除参数列表
    deletList: {
      collection_id: null,
      uid: null,
      token: null
    },
    num: 0,
    pn: 10,
    // 显示loading
    flag: true,
    loginFalg: false
  },
  onLoad: function (options) {
    this.data.uid = app.globalData.uid
    this.data.token = app.globalData.token
    this.noData = this.selectComponent("#noData");
    if (this.data.uid == '') {
      this.noData.noData()
      this.data.loginFalg = true
      return false
    }
    this.getData()
  },
  onShow(){
    this.data.uid = app.globalData.uid
    this.data.token = app.globalData.token
    this.data.loginFalg && this.data.uid != '' ? this.getData() : ''
  },
  onReady: function () {
    this.oShow = this.selectComponent("#oshow");
    this.load = this.selectComponent("#load");
  },
  // bindtitle
  bindTile(e) {
    this.setData({
      ['list.type']: e.currentTarget.dataset.type
    })
    this.setData({
      currentList: [],
      loadingFlag: true
    })
    if (this.data.uid == '') {
      return false
    }
    this.data.list.p = 1
    this.noData.noDataTrue()
    this.data.flag = true
    this.getData()
  },
  // 数据列表
  getData() {
    this.data.list.uid = this.data.uid
    this.data.list.token = this.data.token
    api.requestServerData('/api/member/collection_list','get',this.data.list,this.data.flag).then((res) => {
      let data = res.data.data
      if(res.data.status == 1){
        this.noData.noDataTrue()
        this.data.num = data.list.length
        this.data.list.p == 1 ? this.data.currentList = data.list : this.data.currentList.concat(data.list)
        this.setData({
          currentList: this.data.currentList
        })
      }else{
        if (res.data.status == 2 && this.data.currentList.length > 0){
          this.data.num = 0
          this.load.change();
        }else{
          this.noData.noData()
        }
      }
    })
  },
  // 删除
  catchDelet(e) {
    this.setData({
      oshowFlag: false
    })
    this.oShow.relation()
    this.data.index = e.currentTarget.dataset.index
    this.data.deletList.collection_id = e.currentTarget.dataset.id
    this.data.deletList.uid = this.data.uid
    this.data.deletList.token = this.data.token
  },
  // 确认
  onbindShow() {
    api.requestServerData('/api/member/collection_del', 'get', this.data.deletList).then((res) => {
      let title = null
      if (res.data.status == 1){
        title = res.data.msg
        this.data.currentList.splice(this.data.index, 1)
        this.setData({
          currentList: this.data.currentList
        })
        if (this.data.currentList.length == 0) {
          this.noData.noData()
        }
      }else{
        title = '删除失败'
      }
      toolTip.noPhotoTip(res.data.msg)
    })
  },
  // 取消
  onbindClose() {
    toolTip.noPhotoTip('已取消')
  },
  // 物品点击
  onProductList(e) {
    let id = e.currentTarget.dataset.id
    let url = null
    if (this.data.list.type == 1){
      url = '../../lookCare/view/view?id=' + id
    }else{
      url = '../../product/view/view?id=' + id
    }
    wx.navigateTo({
      url: url
    })
  },
  // 上拉加载
  onReachBottom() {
    let flag = true
    if (this.data.num < this.data.pn) {
      this.load.change();
      flag = false
    }
    setTimeout(() => {
      this.setData({
        loadingFlag: false
      })
    }, 100)
    if (flag) {
      this.data.list.p += 1
      this.data.flag = false
      this.getData()
    }
  },
  // 分享
  // onShareAppMessage() {
  //   return {
  //     title: app.share.name,
  //     path: 'pages/user/view/view',
  //     success: res => {
  //       app.shareTip()
  //     }
  //   }
  // }
})