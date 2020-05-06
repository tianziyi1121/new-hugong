const app = getApp()
const api = require('../../utils/api.js')
const common = require('../../utils/common.js')
const toolTip = require('../../utils/toolTip.js')
Page({
  data: {
    user: {
      url: "",
      name: "",
      approve: 1
    },
    urlApp: "../../static/icon_renzheng_me@2x.png",
    srcApp: "../../static/icon_renzheng_me@2.png",
    certified: "已认证",
    unverified: "未认证",
    title: '是否联系客服？',
    hideModal: true,
    phone: '',
    // 是否设置支付密码
    currentList: {},
    member_list_paypwd: '',
    lsh_type: 1,
    userFlag: true,
    loginFlag: false,
    nursing_workers_relation: null,
    typeShadow: null,
    typeContent: null,
    typeServiceFlag: false
  },
  onLoad: function() {
    app.globalData.uid = wx.getStorageSync('uid')
    app.globalData.token = wx.getStorageSync('token')
  },
  onShow() {
    this.data.lsh_type = wx.getStorageSync('lsh_role_id')
    !this.data.lsh_type ? this.data.lsh_type = 2 : ''
    this.setData({
      lsh_type: this.data.lsh_type
    })
    if (app.globalData.uid !== ''){
      this.getData()
    }else{
      this.setData({
        userFlag: false
      })
    }
  },
  getData() {
    common.userData(app.globalData.uid, app.globalData.token).then((res) => {
      let data = res.data
      if(res.status == 1){
        app.globalData.userData = data
        wx.setStorageSync('phoneNumber', data.member_list_tel)
        data.member_list_tel = data.member_list_tel.replace(/(\d{3})\d{6}(\d{2})/, '$1******$2');
        this.setData({
          currentList: data,
          userFlag: true
        })
        data.nursing_workers_relation == 1 ? this.data.nursing_workers_relation = 2 : this.data.nursing_workers_relation = 1
      }else{
        toolTip.noPhotoTip(res.msg)
      }
    })
  },
  commonality(e) {
    let url = e.currentTarget.dataset.url
    let id = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.type
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (type == 2 && (phone == '' || btnFlag == '')){
      this.login();
      return false
    }
    if (id == 1){
      wx.navigateTo({
        url: url
      })
    }else{
      wx.switchTab({
        url: url
      })
    }
  },
  // bindtap image
  bindImage() {
    if (app.globalData.uid !== '') {
      wx.navigateTo({
        url: 'user/user',
      })
    }else{
      this.login()
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
  // login
  bindLogin() {
    wx:wx.navigateTo({
      url: '/pages/index/index'
    })
  },
  // 联系我们
  relation() {
    if(app.globalData.uid === '') {
      this.login()
      return false
    }
    this.show.relation()
  },
  // 上拉加载
  onReady() {
    this.show = this.selectComponent("#show")
  },
  // 弹窗取消
  bindCancel() {
    toolTip.noPhotoTip('操作已取消')
  },
  // 弹窗确认
  bindAffirm() {
    wx.makePhoneCall({
      phoneNumber: this.data.currentList.call_me
    })
  },
  // type of service
  // typeService(e){
  //   let type = e.currentTarget.dataset.type
  //   this.setData({
  //     nursing_workers_relation: type
  //   })
  // },
  service() {
    if (this.data.currentList.user_status == 0){
      toolTip.noPhotoTip('该账户正在审核，暂时不能修改')
    }else{
      this.setData({
        typeServiceFlag: true,
        typeShadow: false,
        typeContent: false
      })
    }
    
  },
  typeShad(e) {
    let type = e.currentTarget.dataset.type
    if(type != 1){
      api.requestServerData("/api/member/service_type_edit", "get", {
          uid: app.globalData.uid,
          nursing_id: this.data.nursing_workers_relation
      }, false).then((res) => {
        toolTip.noPhotoTip(res.data.msg)
      })
    }
    this.setData({
      typeShadow: true,
      typeContent: true
    })
    setTimeout(() => {
      this.setData({
        typeServiceFlag: false,
      })
    }, 700)
  },
  // previewImg(e) {
  //   let url = []
  //   url.push(e.currentTarget.dataset.url)
  //   wx.previewImage({
  //     current: url[0], // 当前显示图片的http链接
  //     urls: url // 需要预览的图片http链接列表
  //   })
  // },
  preventTouchMove() {},
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/user/user',
      success: res => {
        app.shareTip()
      }
    }
  }
})