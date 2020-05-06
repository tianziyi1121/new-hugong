//product.js
const app = getApp()
const api = require('../../utils/api.js')
Page({
  data: {
    height: '',
    // 左侧
    listData: [],
    leftScrollTop: 0,
    activeIndex: 0,
    // 右
    toView: 'a0',
    // 提醒
    viewTile: '',
    showFlag: true,
    flag: true,
    titleValue: ''
  },
  onLoad: function (options) {
    this.data.showFlag = false
    this.data.titleValue = wx.getStorageSync('lf_inputValue')
    this.bindHeight()
    this.getData().then((res) => {
      let data = res.cate_info
      for( var i = 0; i < data.length; i++ ){
        if (data[i].product.length != 0) {
          this.data.viewTile = data[i].cat_name
          break
        }
      }
      this.setData({
        listData: data,
        viewTile: this.data.viewTile
      })
      this.getList()
    })
  },
  onShow(){
    if (this.data.showFlag) {
      this.data.flag = false
      this.onLoad()
    }
  },
  getData() {
    return new Promise((resolve, reject) => {
      api.requestServerData("/api/product/product_list", "get", {
        keyword: this.data.titleValue
      }, this.data.flag).then((res) => {
        let data = res.data
        if(data.status == 1){
          resolve(data.data)
        } else {
          this.data.showFlag = true
        }
      })
    })
  },
  // 列表数据
  getList() {
    var that = this;
    var sysinfo = wx.getSystemInfoSync().windowHeight;
    let offsetS = 80
    //兼容iphoe5滚动
    if (sysinfo < 550) {
      offsetS = -40
    }
    //兼容iphoe Plus滚动
    if (sysinfo > 650 && sysinfo < 700) {
      offsetS = 240
    }
    let scrollArr = [0]
    let indexFlag = true
    for (let i = 0; i < this.data.listData.length; i++) {
      scrollArr.push(scrollArr[i] + 93 * this.data.listData[i].product.length + 23)
      if (indexFlag && this.data.listData[i].product.length > 0) {
        indexFlag = false
        this.data.activeIndex = i
      }
    }
    that.setData({
      scrollArr: scrollArr,
      listData: this.data.listData,
      loading: true,
      scrollH: sysinfo * 2 - offsetS,
      activeIndex: this.data.activeIndex
    })
    this.data.showFlag = true
  },
  // 点击scroll-view 监听滚动 完成右到左的联动
  scroll(e) {
    let index = 0
    var dis = e.detail.scrollTop
    for (let i = 0; i < this.data.scrollArr.length; i++) {
      if (i < this.data.scrollArr.length - 1) {
        if (dis == 0) {
          this.setData({
            activeIndex: 0,
          })
          break
        } else if (dis > this.data.scrollArr[i] && dis < this.data.scrollArr[i + 1]) {
          let flag = true
          for (var j = i; j < this.data.listData.length; j++) {
            if (flag && this.data.listData[j].product.length > 0) {
              flag = false
              i = j
            }
          }
          if (wx.getStorageSync('ls_activeIndex')) {
            index = wx.getStorageSync('ls_activeIndex')
            wx.removeStorageSync('ls_activeIndex')
          } else {
            index = i
          }
          this.setData({
            activeIndex: index,
          })
          break;
        }
      } else {
        this.setData({
          activeIndex: this.data.scrollArr.length - 1,
        })
      }
    }
    let len = this.data.activeIndex
    len > 0 ? this.data.leftScrollTop = 48 * len : this.data.leftScrollTop = 0
    len > 0 ? (len == this.data.listData.length ? len = this.data.listData.length - 1 : len = len ) : len = 0
    this.data.viewTile = this.data.listData[len].cat_name
    this.setData({
      leftScrollTop: this.data.leftScrollTop,
      viewTile: this.data.viewTile
    })
  },
  // 点击侧边栏
  selectMenu: function (e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      activeIndex: index,
      toView: 'a' + index,
    })
    wx.setStorageSync('ls_activeIndex',index)
  },
  // 点击列表
  bindList(e) {
    wx.navigateTo({
      url: 'view/view?id='+ e.currentTarget.dataset.id
    })
  },
  // 获取当前手机的高度
  bindHeight() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        let windowHeight = (res.windowHeight * (750 / res.windowWidth))
        that.setData({
          height: windowHeight-30
        })
      }
    })
  },
  // 列表
  onProductList: function(e) {
    wx.navigateTo({
      url: 'product-particulars/product-particulars?id='+ e.currentTarget.dataset.id
    })
  },
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/product/product',
      success: res => {
        app.shareTip()
      }
    }
  },
  // 注销
  onHide() {
    wx.removeStorageSync('ls_activeIndex')
  }
})
