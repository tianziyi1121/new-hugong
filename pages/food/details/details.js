const app = getApp()
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    domeMode: true,// 弹窗
    checkNum: 0,
    total: '0.00',
    listData: {},
    currentList: [],
    loginFlag: false
  },
  onLoad: function (options) {
    this.getData(options.id)
    let list = []
    list = wx.getStorageSync('Lsh_ListdATA')
    if (!list || options.type == 1){
      this.setData({
        currentList: [], 
      })
    }else{
      this.setData({
        currentList: list,
        checkNum: options.checkNum,
        total: options.total
      })
    }
    
  },
  getData(id) {
    api.requestServerData('/api/catering/catering_info', "get", {
      uid: app.globalData.uid,
      token: app.globalData.token,
      cate_id: id
    }, true).then((res) => {
      if (res.data.status == 1){
        let data = res.data.data
        data.cate_content = data.cate_content.replace(/<(?!\/?p|\/?IMG)[^<>]*>/ig, '')
          .replace(/<p([\s\w"=\/\.:;]+)((?:(style="[^"]+")))/ig, '<p')
          .replace(/<p>/ig, '<p class="f12" style="color: #aaa;">');
        this.setData({
          listData: data
        })
      }else{
        toolTip.noPhotoTip(res.data.msg)
      }
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
  // // 加入购物车
  bindShop() {
    if (app.globalData.uid == '') {
      this.login()
      return false
    }
    let dataList = this.data.currentList
    let listData = this.data.listData
    let flag = false 
    let num = null
    let total = 0
    let number = 0
    dataList.map((item,index) => {
      if (item.cate_id == listData.cate_id) {
        flag = true
        num = index
      }
    })
    if (flag){
      dataList[num].num += 1
      listData.num = dataList[num].num
    }else{
      listData.num += 1
      dataList.push(listData)
    }
    dataList.map( item => {
      total += Number(item.cate_price) * item.num
      number += item.num
    })
    this.setData({
      checkNum: number,
      currentList: dataList,
      total: total.toFixed(2)
    })
    wx.setStorageSync('Lsh_ListdATA', dataList)
    wx.setStorageSync('Lsh_liData', listData)
  },
  // 在线支付
  bindPayment() {
    this.hideModal()
    this.bindPay()
  },
  // 去支付
  bindPay() {
    if (app.globalData.uid == '') {
      this.login()
      return false
    }
    if(this.data.checkNum <= 0) {
      toolTip.noPhotoTip('餐饮不能为空')
    }else {
      wx.setStorageSync('lsh_currentList', this.data.currentList)
      wx.navigateTo({
        url: '../view/view?total=' + this.data.total
      })
    }
  }
})