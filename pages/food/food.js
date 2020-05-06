const app = getApp()
const api = require('../../utils/api.js')
const toolTip = require('../../utils/toolTip.js')
Page({
  data: {
    height: '',
    // 左侧
    listData: [],
    leftScrollTop: 0,
    activeIndex: 0,
    toView: 'a0',// 右
    domeMode: true,// 弹窗
    checkNum: 0,// 点
    currentList: [],// 弹窗数据
    total: 0,// 总价
    showFlag: false,
    viewTile: '',
    loginFlag: false
  },
  onLoad: function () {
    // 获取到屏幕的高度
    this.bindHeight()
    this.getData().then((res) => {
      this.data.viewTile = res.data.cate_info[0].name
      this.setData({
        listData: res.data.cate_info,
        viewTile: this.data.viewTile
      })
      this.getList()
    })
  },
  // 数据
  getData() {
    return new Promise((resolve, reject) => {
      api.requestServerData('/api/catering/catering_list', "get", '', true).then((res) => {
        let data = res.data
        if (data.status == 1) {
          resolve(data)
        } else {
          toolTip.noPhotoTip(data.msg)
        }
      })
    })
  },
  // user login
  login() {
    this.setData({
      loginFlag: true
    })
  },
  // 点击按钮
  onBindLogin(e) {
    if (e.detail.type == 2) {
      wx.navigateTo({
        url: '../index/view/view',
      })
    }
    this.setData({
      loginFlag: false,
    })
  },
  // 列表数据
  getList() {
    var that = this;
    var sysinfo = wx.getSystemInfoSync().windowHeight;
    wx.showLoading()
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
      scrollArr.push(scrollArr[i] + 95 * this.data.listData[i].catering.length + 22)
      if (indexFlag && this.data.listData[i].catering.length > 0) {
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
    wx.hideLoading();
  },
  // 点击scroll-view 监听滚动 完成右到左的联动
  scroll(e) {
    var dis = e.detail.scrollTop
    let index = 0
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
            if (flag && this.data.listData[j].catering.length > 0) {
              flag = false
              i = j
            }
          }
          if (wx.getStorageSync('lsh_activeIndex')){
            index = wx.getStorageSync('lsh_activeIndex')
            wx.removeStorageSync('lsh_activeIndex')
          }else{
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
    len > 0 ? (len == this.data.listData.length ? len = this.data.listData.length - 1 : len = len) : len = 0
    this.data.viewTile = this.data.listData[len].name
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
      toView: 'a' + index
    })
    wx.setStorageSync('lsh_activeIndex', index)
  },
  // 弹窗动画
  bindShopping() {
    this.setData({
      domeMode: false
    })
    let animation = wx.createAnimation({
      timingFunction: 'linear',
    })
    this.animation = animation
    setTimeout(() => {
      this.fadeIn()
    }, 100)
  },
  // 出现动画
  fadeIn() {
    this.animation.translateY(0).step({
      duration: 300
    })
    this.setData({
      animationData: this.animation.export()
    })
  },
  // 消失动画
  hideModal() {
    let animation = wx.createAnimation({
      timingFunction: 'linear'
    })
    this.fadeDown()
    setTimeout(() => {
      this.setData({
        domeMode: true
      })
    }, 300)
  },
  fadeDown() {
    this.animation.translateY(800).step({
      duration: 300
    })
    this.setData({
      animationData: this.animation.export()
    })
  },
  // 获取当前手机的高度
  bindHeight() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        let windowHeight = (res.windowHeight * (750 / res.windowWidth))
        that.setData({
          height: windowHeight - 120
        })
      }
    })
  },
  // 列表
  onProductList: function (e) {
    wx.navigateTo({
      url: 'product-particulars/product-particulars?id=' + e.currentTarget.dataset.id
    })
  },
  // 点击加号
  catchAdd(e) {
    if (app.globalData.uid == '') {
      this.login()
      return false
    }
    let i = e.currentTarget.dataset.index
    let j = e.currentTarget.dataset.number
    let data = this.data.listData
    data[i].catering[j].num += 1
    this.setData({
      ['listData[' + i + ']catering[' + j + ']']: data[i].catering[j]
    })
    this.totalMoney()
  },
  // 减号
  catchMin(e){
    let i = e.currentTarget.dataset.index
    let j = e.currentTarget.dataset.number
    let data = this.data.listData
    let dataList = data[i].catering[j].num
    if (dataList > 0){
      data[i].catering[j].num -= 1
    }else{
      data[i].catering[j].num = 0
    }
    this.setData({
      ['listData[' + i + ']catering[' + j + ']']: data[i].catering[j]
    })
    this.totalMoney()
  },
  // 总价
  totalMoney() {
    let data = this.data.listData
    let total = 0
    this.data.currentList = []
    let number = 0
    data.map(item => {
      item.catering.map(items => {
        if (items.num != 0) {
          this.data.currentList.push(items)
          total += Number(items.cate_price) * items.num
          number += items.num
        }
      })
    })
    total = total.toFixed(2)
    this.setData({
      total: total,
      currentList: this.data.currentList,
      checkNum: number
    })
  },
  // 在线支付
  bindPayment() {
    this.hideModal()
    this.bindPay()
  },
  // 去支付
  bindPay() {
    if (app.globalData.uid == ''){
      this.login()
      return false
    }
    if (this.data.checkNum <= 0) {
      toolTip.noPhotoTip('产品不能为空')
      return false
    }else{
      wx.setStorageSync('lsh_currentList', this.data.currentList)
      wx.navigateTo({
        url: 'view/view?total='+ this.data.total
      })
    }
  },
  // 点击列表
  bindList(e) {
    let i = e.currentTarget.dataset.index
    let j = e.currentTarget.dataset.number
    wx.setStorageSync('Lsh_ListdATA', this.data.currentList)
    wx.setStorageSync('food_I', i)
    wx.setStorageSync('food_j',j)
    this.data.showFlag = true
    wx.navigateTo({
      url: 'details/details?checkNum=' + this.data.checkNum + '&total=' + this.data.total + '&id=' + e.currentTarget.dataset.id
    })
  },
  onShow() {
    if (this.data.showFlag){
      let data = wx.getStorageSync('Lsh_ListdATA')
      let list = wx.getStorageSync('Lsh_liData')
      let i = wx.getStorageSync('food_I')
      let j = wx.getStorageSync('food_j')
      if (list) {
        this.setData({
          ['listData[' + i + ']catering[' + j + '].num']: list.num,
          currentList: data
        })
        this.totalMoney()
        this.data.showFlag = false
      }
      wx.removeStorageSync('Lsh_ListdATA')
      wx.removeStorageSync('Lsh_liData')
      wx.removeStorageSync('food_I')
      wx.removeStorageSync('food_j')
    }
  },
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/food/food',
      success: res => {
        app.shareTip()
      }
    }
  },
  // 注销
  onHide(){
    wx.removeStorageSync('lsh_activeIndex')
  }
})