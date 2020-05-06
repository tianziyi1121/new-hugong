var app = getApp();
var api = require('../../utils/api.js')
var common = require('../../utils/common.js')
Page({
  data: {
    balance: '0.00',
    bankType: '',
    uid: '',
    token: '',
    dataFlag: true,
    loginFlag: false
  },
  onLoad: function() {
    this.data.dataFlag = false
    if (app.globalData.uid == ''){
      this.data.dataFlag = true
      return false
    }
    this.getData()
    this.bindBank()
  },
  onShow() {
    if (this.data.dataFlag &&  app.globalData.uid != ''){
      this.getData()
      this.bindBank()
    }else{
      this.data.dataFlag = true
    }
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
        url: '/pages/index/index',
      })
    }
    this.setData({
      loginFlag: false,
    })
  },
  getData() {
    api.requestServerData('/api/member/index', 'get', {
      uid: app.globalData.uid,
      token: app.globalData.token
    }, true).then((res) => {
      if (res.data.status == 1) {
        let data = res.data.data
        this.setData({
          balance: data.coin
        })
      }
    })
  },
  // 功能
  withdraw(e) {
    if(app.globalData.uid === ''){
      this.login()
      return false
    }
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },
  // 分享
  // onShareAppMessage() {
  //   return {
  //     title: app.share.name,
  //     path: 'pages/balance/balance',
  //     success:res => {
  //       app.shareTip()
  //     }
  //   }
  // },
  // 银行卡
  bindBank() {
    common.bankData(app.globalData.uid, app.globalData.token).then((res) => {
      this.setData({
        bankType: res
      })
    })
  },
  // 明细
  bindDetail() {
    if (app.globalData.uid === '') {
      this.login()
      return false
    }
    wx.navigateTo({
      url: 'view/view',
    })
  }
})