//app.js
const api = require('utils/api.js')
App({
  onLaunch: function () {
    var logs = wx.getStorageSync('logs') || []
    let codeData = ''
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        codeData = res.code
      }
    })
    this.getData() // 上线时记得打开
    let positionData = wx.getStorageSync('position')
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              this.globalData.uid = wx.getStorageSync('uid')
              this.globalData.token = wx.getStorageSync('token')
              if (!wx.getStorageSync('token')){
                this.getUnionId(codeData).then((resData) => {
                  let data = resData.data.data
                  if (resData.data.status == 1) {
                    this.globalData.uid = data.uid
                    this.globalData.token = data.token
                    wx.setStorageSync('uid', data.uid)
                    wx.setStorageSync('token', data.token)
                  }
                })
              }
              if (!positionData){
                this.position()
              }
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  // Detection of update
  getData() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  // 
  getUnionId(code) {
    let id = wx.getStorageSync('role_id')
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        withCredentials: true,
        lang: 'zh_CN',
        success: res => {
          api.requestServerData("/api/login/getinfo", "post", {
            oauth_from: 'wechat',
            code: code,
            encryptedData: res.encryptedData,
            iv: res.iv,
            role_id: id
          }, false).then((resp) => {
            resolve(resp)
          })
        }
      })
    })
  },
  position() {
    api.requestServerData('/api/nursing_workers/nursing_workers_register', 'get', {
      uid: this.globalData.uid,
      token: this.globalData.token
    }, false).then((res) => {
      wx.setStorageSync('position', res.data)
    })
  },
  // 下拉刷新延迟
  postpone() {
    setTimeout(() => {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 500)
  },
  // 数据缓存
  globalData: {
    // 个人信息
    userInfo: null,
    // 唯一标识
    uid: '',
    token: '',
    code: null,
    openid: null,
    // 详情
    dataList: null,
    // 头像
    image: null,
    // 注册
    userForm: {},
    // 订单
    shoppingList: [],
    // 护工id
    id: null,
    // 注册信息
    currentList: '',
    // 小程序
    openid: null,
    // 地区
    area: null,
    // 科室
    office: null,
    // 头像
    headpic: '',
    // 昵称
    nickname: '',
    // accredit
    accredit: null,
    loginFlag: 1,
    userData: '',
    // time list
    timeList: [],
    // index image list
    bindImage: {
      menu_content: '',
      menu_name: ''
    }
  },
  shareTip(){
    wx.showToast({
      title: '分享成功',
      icon: 'success',
      duration: 2000
    })
  },
  // 分享
  share: {
    name: '随身护工'
  }
})