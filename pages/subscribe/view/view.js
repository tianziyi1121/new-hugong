const app = getApp()
const api = require("../../../utils/api.js")
const common = require("../../../utils/common.js")
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    houser: '',
    minutes: '',
    seconds: '',
    id: 0,
    setTime: '',
    total: '',
    // 点单id
    id: null,
    imageSrc1: '../../../static/icon_paychoose_paypage_normal@2x.png',
    imageSrc2: '../../../static/icon_paychoose_paypage_on@2x.png',
    // 支付
    balance: 1,
    wechat: 2,
    tranType: 'JSAPI', // JSAPI 微信付款 BALANCE 余额支付
    // 二维码
    codeImg: '', 
    timer: '',
    // 定时器
    getPayTime: '',
    // 支付
    paymentFlag: false,
    // 余额
    lsh_money: '',
    getTimer: '',
    orderType: null,
    loginFlag: false,
    wechatFlag: false
  },
  onLoad(options) {
    this.setData({
      total: options.total,
      orderType: options.orderType
    })
    this.data.id = options.id
    this.data.time = options.timer
    this.timer(this.data.time)
    if (app.globalData.uid == '') {
      this.login()
      return false
    }
    this.loginAccredit()
  },
  onShow() {
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (phone && btnFlag || app.globalData.loginFlag == 2) {
      this.data.loginFlag = false
      phone && btnFlag ? this.loginAccredit() : ''
    } else {
      this.data.loginFlag = true
    }
    this.data.loginFlag ? app.globalData.loginFlag = 2 : app.globalData.loginFlag == 1
    this.setData({
      loginFlag: this.data.loginFlag
    })
  },
  loginAccredit(){
    common.userData(app.globalData.uid, app.globalData.token).then(res => {
      if (res.status == 1) {
        this.setData({
          lsh_money: res.data.coin
        })
      } else {
        toolTip.noPhotoTip(res.msg)
      }
    })
  },
  // accredit
  login() {
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (phone && btnFlag) {
      this.data.loginFlag = false
    } else {
      this.data.loginFlag = true
    }
    this.setData({
      loginFlag: this.data.loginFlag
    })
  },
  // 倒计时
  timer(time) {
    let timer = Number(time) + 575
    this.leftTimer(timer)
    this.data.setTime = setInterval(() => {
      this.leftTimer(timer)
    }, 1000)
  },
  leftTimer(time) {
    var timesNow = Date.parse(new Date())
    var leftTime = time - (timesNow/1000);
    var hour = ''
    var minute = ''
    var second = ''
    if (leftTime >= 0) {
      hour = Math.floor(leftTime / 3600)
      minute = Math.floor((leftTime - hour * 60 * 60) / 60)
      second = Math.floor(leftTime - hour * 3600 - minute * 60);
    }else{
      hour = 0
      minute = 0
      second = 0
      clearInterval(this.data.setTime)
      toolTip.noPhotoTip('订单已失效')
      setTimeout(() => {
        wx.switchTab({
          url: '../../indent/indent',
        })
      }, 2000)
      return false
    }
    this.setData({
      houser: this.checkTime(hour),
      minutes: this.checkTime(minute),
      seconds: this.checkTime(second)
    })
  },
  checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  // 付款方式
  bindSelect(e) {
    let index = e.currentTarget.dataset.index
    if (index == 1){
      if (this.data.wechat == 1){
        this.data.tranType = 'JSAPI'
        this.setData({
          balance: 1,
          wechat: 2
        })
      }
    }else{
      if (this.data.balance == 1) {
        this.data.tranType = 'BALANCE'
        this.setData({
          balance: 2,
          wechat: 1
        })
      }
    }
  },
  // 找人代付
  bindAnother() {
    return {
      title: app.share.name,
      path: 'pages/subscribe/view/view?id=' + this.data.id + "&total=" + this.data.total + "&orderType=" + this.data.orderType + "&time=" + this.data.time
    }
  },
  // 确认支付
  bindpPayment() {
    if (app.globalData.uid == '') {
      this.login()
      return false
    }
    if (this.data.wechatFlag) {
      return false
    }
    this.data.wechatFlag = true
    if (this.data.wechat == 2) {
      this.ls_wxchat()
    }else{
      if (Number(this.data.lsh_money) >= Number(this.data.total)){
        this.setData({
          paymentFlag: true,
          total: this.data.total
        })
        this.payment = this.selectComponent("#payment")
        this.payment.pay()
        this.data.wechatFlag = false
      }else{
        toolTip.noPhotoTip('余额不足')
      }
    }
  },
  // 余额支付
  ls_balance(e){
    api.requestServerData('/api/Pay/index', "post", {
      uid: app.globalData.uid,
      token: app.globalData.token,
      trade_type: this.data.tranType,
      orderId: this.data.id,
      paypwd: e.detail.paypwd
    }, true).then((res) => {
      if (res.data.status == 1){
        this.router('支付成功')
        this.payment.closePup()
        return false
      }
      if (res.data.status == 3 && res.data.data == 3) {
        this.payment.eliminate()
        this.payment.closePup()
        toolTip.noPhotoTip(res.data.msg)
        return false
      }
      this.payment.eliminate()
      toolTip.noPhotoTip(res.data.msg)
    })
  },
  ls_wxchat(){
    let self = this
    wx.login({
      success: res => {
        let code = res.code
        api.requestServerData('/api/Pay/index', "post", {
          uid: app.globalData.uid,
          token: app.globalData.token,
          trade_type: self.data.tranType,
          orderId: self.data.id,
          code: code
        }, false).then((res) => {
          let data = res.data
          if (data.status == 1) {
            wx.requestPayment({
              timeStamp: data.data.timeStamp,
              nonceStr: data.data.nonceStr,
              package: data.data.package,
              signType: 'MD5',
              paySign: data.data.paySign,
              success(res) {
                self.data.wechatFlag = false
                self.router('支付成功')
              },
              fail(res) {
                self.data.wechatFlag = false
                toolTip.noPhotoTip('支付失败')
              }
            })
          } else {
            self.data.wechatFlag = false
            toolTip.noPhotoTip(data.msg)
          }
        })
      }
    })
  },
  // 支付跳转
  router(text) {
    toolTip.noPhotoTip(text)
    wx.switchTab({
      url: '../../indent/indent'
    })
  },
  // 退出
  onUnload() {
    clearInterval(this.data.setTime)
    clearInterval(this.data.getPayTime)
    clearInterval(this.data.getTimer)
  },
  // 忘记密码
  modify_password(){
    wx.navigateTo({
      url: '../../user/pay/view/view',
    })
  }
})