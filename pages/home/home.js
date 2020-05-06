const app = getApp();
const api = require('../../utils/api.js')
const toolTip = require('../../utils/toolTip.js')
const common = require('../../utils/common.js')
Page({
  data: {
    // 轮播图
    indicatorDots: true,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    bannerList: [],
    // 上拉加载
    loadingFlag: true,
    // 列表
    currentList: [],
    // 问答
    hotList: [],
    // 功能
    typeData: 2,
    // 阴影层
    shadowFlag: false,
    loginFlag: true,
    title: [{ title: '护工', value: 1}, { title: '产品', value: 2}, { title: '康复知识', value: 3}],
    tityeVlue: 1,
    searchType: false,
    titleVlue: '护工',
    homeHeight: 0,
    bindscrolltoupperFlag: false
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '随身健康'
    })
    wx.removeStorageSync('lf_inputValue')
    options.jurisdiction !== undefined ? wx.setStorageSync('role_id', options.jurisdiction) : wx.setStorageSync('role_id', 2)
    // 医院
    if (options.department != undefined) {
      wx.setStorageSync('department', options.department)
      wx.setStorageSync('hospital', options.hospital)
    }
    // if (options.jurisdiction != undefined) {
    //   lsh_type = options.jurisdiction
    // }
    this.getData()
    let positionData = wx.getStorageSync('position')
    if (!positionData) {
      app.position()
    }
    common.windowHeight().then((res) => {
      this.setData({
        homeHeight: res
      })
    })
  },
  onShow() {
    this.data.typeData = wx.getStorageSync('lsh_role_id')
    !this.data.typeData ? this.data.typeData = 2 : ''
    this.setData({
      typeData: this.data.typeData
    })
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (btnFlag !== '' || app.globalData.accredit == 1 || app.globalData.loginFlag == 2) {
      this.data.loginFlag = false
    } else {
      this.data.loginFlag = true
    }
    this.data.loginFlag ? app.globalData.loginFlag = 2 : app.globalData.loginFlag == 1
    this.setData({
      loginFlag: this.data.loginFlag
    })
    if(this.data.shadowFlag){
      this.lshShadow.hideShadow()
      this.lshShadow.lsBack()
    }
    if (this.data.searchType) {
      this.setData({
        searchType: false
      })
    }
  },
  onReady() {
    this.load = this.selectComponent("#load")
  },
  onBindLogin(e) {
    if (e.detail.type == 2){
      wx.navigateTo({
        url: '../index/index',
      })
    }
    this.setData({
      loginFlag: false,
    })
  },
  // 功能区域
  homeFunction: function(e) {
    var id = e.currentTarget.dataset.index
    if (id == "../lookCare/lookCare"){
      wx.reLaunch({
        url: id
      })
    }else{
      wx.navigateTo({
        url: id
      })
    }
  },
  // 数据
  getData: function () {
    api.requestServerData("/api/index", "get", '', false).then((res) => {
      let data = res.data.data
      if (res.data.status == 1){
        this.setData({
          bannerList: data.ads_list,
          currentList: data.article_list,
          // hotList: data.index_img,
          titleData: data.title.menu_name
        })
      }else{
        toolTip.noPhotoTip('数据获取失败')
      }
      this.data.bindscrolltoupperFlag = false
      if (this.data.loadflag) {
        this.data.loadflag = !this.data.loadflag
        app.postpone()
      }
    });
  },
  // 点击热门问答及列表
  articleDetails(e) {
    let index = e.currentTarget.dataset.index
    app.globalData.dataList = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../recovery/view/view?id=3'
    })
  },
  userINFO(){
    wx.authorize({ scope: "scope.userInfo" })
  },
  // // 下拉刷新
  // onPullDownRefresh: function () {
  //   wx.showNavigationBarLoading();
  //   this.data.loadflag = true
  //   this.getData()
  // },
  // search type
  titleType(e) {
    let data = e.currentTarget.dataset
    this.setData({
      searchType: false,
      titleVlue: data.name,
      tityeVlue: data.type
    })
  },
  // bind title style
  searchStyle() {
    this.setData({
      searchType: true
    })
  },
  // input
  bindInput(e) {
    this.data.inputValue = e.detail.value
  },
  // search
  search (){
    let url = null
    if (!this.data.inputValue) {
      toolTip.noPhotoTip('请输入搜索内容')
      return false
    }
    this.data.tityeVlue == 1 ? url = '/pages/lookCare/search/search?value=' + this.data.inputValue : (this.data.tityeVlue == 2 ? url = '/pages/product/search/search?value=' + this.data.inputValue : url = '/pages/recovery/recovery?id=2&value=' + this.data.inputValue)
    wx.navigateTo({
      url: url,
    })
  },
  // bindconfirm
  bindconfirm(e) {
    this.data.inputValue = e.detail.value['search - input'] ? e.detail.value['search - input'] : e.detail.value
    this.search()
  },
  bindscrolltoupper() {
    if (this.data.bindscrolltoupperFlag){
      return false;
    }
    this.data.bindscrolltoupperFlag = true
    wx.startPullDownRefresh()
    wx.showNavigationBarLoading();
    this.data.loadflag = true
    this.getData()
  },
  bindImage(e){
    let data = e.currentTarget.dataset
    if(data.type == 1){
      app.globalData.bindImage.menu_content = this.data.bannerList[data.index].plug_ad_content
      app.globalData.bindImage.menu_name = this.data.bannerList[data.index].plug_ad_name
    }else{
      app.globalData.bindImage = this.data.currentList[data.index]
    }
    wx:wx.navigateTo({
      url: 'view/view'
    })
  },
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/home/home',
      success: res => {
        app.shareTip()
      }
    }
  }
})