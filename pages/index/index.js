const app = getApp()
const api = require('../../utils/api.js')
const toolTip = require('../../utils/toolTip.js')
const common = require('../../utils/common.js')
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    code: null,
    btnFlag: 1,
    title: '获取你的公开信息（昵称、头像等）',
    // 分享
    url: '../home/home'
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../product/product'
    })
  },
  onLoad: function (options) {
    // this.data.url = '../home/home'
    // if (options.url1 != undefined){
    //   if (options.type == 1){
    //     this.data.url = options.url1 + '?id=' + options.id
    //   }else{
    //     this.data.url = '../home/home?url1=' + options.url1 + '&id=' + options.id + '&type=' + options.type
    //   }
    // }
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    btnFlag !== '' && phone == '' ? this.data.title = '获取你绑定的手机号码' : ''
    this.setData({
      btnFlag: btnFlag,
      title: this.data.title
    })
    if (app.globalData.userInfo) {
      this.skip();
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        app.globalData.userInfo = res.userInfo
        this.skip();
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.skip();
        }
      })
    }
  },
  // refuse
  bindRefuse() {
    wx.navigateBack({
      delta: 1
    })
  },
  // 获取用户信息
  getUserInfo: function (e) {
    if (!e.detail.userInfo) {
      toolTip.noPhotoTip('拒绝授权会影响小程序功能使用')
    } else {
      app.globalData.userInfo = e.detail.userInfo
      wx.removeStorageSync('phone')
      wx.setStorageSync('btnFlag', 2)
      this.login()
    }
  },
  // 获取手机号码
  getPhoneNumber(e) {
    if (!e.detail.encryptedData) {
      toolTip.noPhotoTip('拒绝授权会影响小程序使用')
      wx.setStorageSync('phone', false)
    } else {
      wx.login({
        success: res => {
          let code = res.code
          // 保存电话号码
          api.requestServerData("/api/login/getTelNumber", "post", {
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv,
            code: code,
            uid: app.globalData.uid,
            headpic: app.globalData.headpic,
            nickname: app.globalData.nickName,
            oauth_from: 'wechat'
          }, true).then((resp) => {
            let data = resp.data
            if (data.status == 1) {
              app.globalData.uid = data.data.uid
              app.globalData.token = data.data.token
              wx.setStorageSync('phoneNumber', data.data.mobile)
              wx.setStorageSync('uid', data.data.uid)
              wx.setStorageSync('token', data.data.token)
              wx.setStorageSync('phone', true)
              this.userData()
            }
          })
        }
      })
    }
  },
  // 登录
  login() {
    wx.login({
      success: res => {
        let code = res.code
        wx.getUserInfo({
          withCredentials: true,
          lang: 'zh_CN',
          success: resp => {
            let user = resp.userInfo
            app.globalData.nickName = user.nickName
            app.globalData.headpic = user.avatarUrl
            this.getUnionId(code, resp.encryptedData, resp.iv).then(resData => {
              let data = resData.data.data
              if (resData.data.status == 1) {
                app.globalData.getUserInfo = user
                app.globalData.uid = data.uid
                if(data.is_user == 1){
                  app.globalData.token = data.token
                  wx.setStorageSync('uid', data.uid)
                  wx.setStorageSync('token', data.token)
                  app.globalData.uid = data.uid
                  app.globalData.token = data.token
                  wx.setStorageSync('phone', true)
                  wx.setStorageSync('phoneNumber', data.mobile)
                  wx.setStorageSync('role_id', data.role_id)
                  this.userData()
                } else{
                  this.setData({
                    title: '获取你绑定的手机号码',
                    btnFlag: 2
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  // 获取unionid
  getUnionId( code, encryptedData, iv) {
    let id = wx.getStorageSync('role_id')
    return new Promise((resolve, reject) => {
      api.requestServerData("/api/login/getinfo", "post", {
        oauth_from: 'wechat',
        code: code,
        encryptedData: encryptedData,
        iv: iv,
        role_id: id
      }, false).then((res) => {
        resolve(res)
      })
    })
  },
  skip() {
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (phone && btnFlag != 1) {
      wx.navigateBack({
        delta: 1
      })
    }else{
      return false
    }
  },
  userData(){
    common.userData(app.globalData.uid, app.globalData.token).then((res) => {
      if (res.status == 1) {
        console.log(res.data)
        wx.setStorageSync('lsh_role_id', res.data.member_role_id)
        this.skip()
      }
    })
  }
})