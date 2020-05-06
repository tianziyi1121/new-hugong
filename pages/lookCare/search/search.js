const app = getApp()
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    lookCareNav: [
      {
        nav: '年龄',
        id: 0,
        flag: true
      },
      {
        nav: '性别',
        id: 1,
        flag: true
      },
      {
        nav: '护龄',
        id: 2,
        flag: true
      },
      {
        nav: '科室',
        id: 3,
        flag: true
      }
    ],
    lookCare: [
      {
        nav: '级别',
        id: 4,
        flag: true
      },
      {
        nav: '地区',
        id: 5,
        flag: true
      },
      {
        nav: '一对一',
        id: 6,
        flag: false
      },
      {
        nav: '一对多',
        id: 7,
        flag: false
      }
    ],
    lookCareIndex: null,
    // 弹窗
    dialogShow: false,
    // 选择储存
    age: ["不限", "20岁~25岁", "25岁~30岁", "30岁~35岁", "35岁~40岁", "40岁~45岁", "45岁~50岁", "50岁~55岁", "55岁~60岁", "60岁~65岁"],
    sex: ["不限","男护工", "女护工"],
    // 护龄
    workExperience: ["不限","1年~3年", "4年~7年", "8年~11年", "12年~15年", "16年~19年", "20年~23年", "24年~27年", "28年~31年", "32年~35年", "36年~39年", "40年~42年"],
    // 级别
    rankList: ["不限","普通","高级"],
  // 科室
    hospitalList: [],
    hospitalIndex: 100,
    // 公共的
    screenIndex: 12,
    // 数据
    form: {
      uid: null,
      token: null,
      p: 1,
      nursing_workers_age: '',// 年龄
      nursing_workers_sex: '',// 性别
      department: '',// 科室
      hospital: '',// 医院
      nursing_list_province: '',// 省
      nursing_list_city: '',// 市
      nursing_list_town: '',// 县
      nursing_workers_experience: '',//  经验
      nursing_rank: '',// 级别
      nursing_workers_relation: '',// 1、一对一；2、一对多
    },
    // 列表
    lookCareList: [],
    busy: '忙碌',
    leisure: '空闲',
    // 小头像
    busyImg: '../../../static/icon_person_on@2x.png',
    leisureImg: '../../../static/icon_person_normal@2x.png',
    // 循环
    busyState: [1],
    leisureState: [1,2,3],
    // 收藏
    collectUrl: '../../../static/collect.png',
    collectBlockUrl: '../../../static/collect_block.png',
    // 上拉加载
    loadingFlag: true,
    positionFlag: false,
    // 下拉刷新
    num: null,
    pn: 10,
    loadflag: false,
    hasUserInfo: false,
    // 监听页面滚动
    scrolltop: false,
    // 组件
    dataType: 1,
    positionType: true,
    // 加载
    flag: true,
    lookFlag: false,
    // 弹窗
    lsh_order: false,
    indextData: 10,
    onShowFlage: false,
    loginFlag: false,// login
    loadDataFlag: false,
  },
  onLoad(options) {
    this.data.form.keyword = options.value
    this.noData = this.selectComponent("#noData")
    this.data.form.uid = app.globalData.uid
    this.data.form.token = app.globalData.token
    wx.setStorageSync('lookCareNav', this.data.lookCareNav)
    wx.setStorageSync('lookCare', this.data.lookCare)
    if (app.globalData.uid == '') {
      this.noData.noData()
      this.data.onShowFlage = true
      return false;
    }
    this.scanCode().then(() => {
      this.getData()
    })
    this.rankData()
  },
  onShow(){
    let flag = wx.getStorageSync('lookCare_list_flag')
    if (flag) {
      let i = wx.getStorageSync('lookCare_i')
      let j = wx.getStorageSync('lookCare_j')
      let status = wx.getStorageSync('lookCare_collect')
      this.setData({
        ['lookCareList[' + i + '][' + j + '].collection_count']: status
      })
      wx.removeStorageSync('lookCare_i')
      wx.removeStorageSync('lookCare_j')
      wx.removeStorageSync('lookCare_collect')
      wx.removeStorageSync('lookCare_list_flag')
    }else{
      if (app.globalData.uid == '') {
        return false
      }
      this.data.form.uid = app.globalData.uid
      this.data.form.token = app.globalData.token
      if (this.data.onShowFlage){
        this.scanCode().then(() => {
          this.data.flag = false
          this.getData()
          this.rankData()
        })
      }
    }
  },
  rankData(){
    api.requestServerData('/api/nursing_workers/nursing_rank', 'get',{
      uid: app.globalData.uid,
      token: app.globalData.token
    }, this.data.flag).then((res) => {
      let data = res.data
      if(res.data.status == 1){
        this.setData({
          rankList: data.data
        })
      }else{
        toolTip.noPhotoTip(data.msg)
      }
    })
  },
  // 扫码
  scanCode(){
    return new Promise((resolve,reject) => {
      let hospital = wx.getStorageSync('hospital')
      let department = wx.getStorageSync('department')
      if (hospital) {
        this.data.form.hospital = hospital
        this.data.form.department = department
      }
      resolve()
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
        url: '/pages/index/index',
      })
    }
    this.setData({
      loginFlag: false,
    })
  },
  // 获取数据
  getData() {
    api.requestServerData('/api/nursing_workers/nursing_workers_lists', 'get', this.data.form, this.data.flag).then((res) => {
      let data = res.data.data
      let pn = this.data.form.p - 1
      if (res.data.status == 1){
        this.data.num = data.length
        this.data.lookCareList[pn] = []
        if (this.data.lookFlag){
          this.filtrate()
          this.data.lookFlag = true
        }
        if (this.data.loadflag){
          this.setData({
            lookCareList: [],
            ["lookCareList[" + pn + "]"]: data
          })
        }else{
          this.setData({
            ["lookCareList[" + pn + "]"]: data
          })
        }
        this.noData.noDataTrue()
      }else{
        if (this.data.form.p == 1){
          this.setData({
            lookCareList: [],
            loadingFlag: true
          })
          this.noData.noData()
        }else{
          this.noData.noDataTrue()
          this.setData({
            loadingFlag: false,
          })
          this.load.change();
        }
      }
      this.data.loadDataFlag = true
      this.data.onShowFlage = true
      if (this.data.loadflag) {
        this.data.loadflag = !this.data.loadflag
        this.setData({
          lookCare: this.data.lookCare,
          lookCareNav: this.data.lookCareNav
        })
        app.postpone()
      }
      if (this.data.num > 3){
        this.setData({
          loadingFlag: false,
        })
      }
    })
  },
  // 导航
  screen(e) {
    let index = e.currentTarget.dataset.item
    if (this.data.indextData != index || this.data.indextData == index && (!this.data.dialogShow || !this.data.positionType)){
      if (this.data.indextData == index && !this.data.positionType){

      }else{
        if (!this.data.positionType || this.data.dialogShow) {
          this.unshade()
          this.setData({
            lsh_order: true
          })
          setTimeout(() => {
            this.popupAnimation(index)
          }, 300)
        } else {
          this.popupAnimation(index)
        }
      }
      this.data.indextData = index
    }
  },
  popupAnimation(index) {
    let type = true
    let dialogShow = false
    // 一对一 || 一对多
    if (index == 6 || index == 7) {
      dialogShow = false
      index == 6 ? this.data.form.nursing_workers_relation = 1 : this.data.form.nursing_workers_relation = 2
      this.data.form.p = 1
      this.data.lookCareList = []
      this.data.lookFlag = true
      this.getData()
    } else if (index == 5 || index == 3) {
      dialogShow = false
      type = false
      this.data.dataType = index
      this.shade()
    } else {
      dialogShow = true
      this.shade()
    }
    this.data.lookCareIndex = index
    this.setData({
      positionType: type,
      dataType: this.data.dataType,
      dialogShow: dialogShow,
      screenIndex: index,
      lsh_order: false
    })
  },
  // 年龄
  choiceEag: function (e) {
    let index = e.currentTarget.dataset.index
    let item = e.currentTarget.dataset.item
    let age =0
    if (index  == 0){
      age = ''
    }else{
      age = index
    }
    if (this.data.lookCareIndex >= 4){
      let len = this.data.lookCareIndex - 4 
      if (len == 0){
        this.data.rankList.map( item => {
          if (item.nr_id == index){
            this.data.lookCare[len].nav = item.nr_name
          }
        })
      }else{
        this.data.lookCare[len].nav = this.data.rankList[index]
      }
      this.setData({
        ['lookCare[' + len +'].nav']: this.data.lookCare[len].nav,
        ['lookCare[' + len +'].flag']: false
      })
    }else{
      if (this.data.lookCareIndex == 0){
        this.data.lookCareNav[0].nav = this.data.age[index]
      } else if (this.data.lookCareIndex == 1){
        this.data.lookCareNav[1].nav = this.data.sex[index]
      } else if (this.data.lookCareIndex == 2){
        this.data.lookCareNav[2].nav = this.data.workExperience[index]
      }
      this.setData({
        ['lookCareNav[' + this.data.lookCareIndex + '].nav']: this.data.lookCareNav[this.data.lookCareIndex].nav,
        ['lookCareNav[' + this.data.lookCareIndex + '].flag']: false
      })
    }
    this.setData({
      ['form.'+ item]: age,
      loadingFlag: true,
      lsh_order: false
    })
    this.noData.noDataTrue()
    this.data.flag = true
    this.data.lookFlag = true
    this.data.lookCareList = []
    this.data.form.p = 1
    this.unshade()
    this.getData()
  },
  // 地区  ||  科室
  onCalendarChange(e) {
    if (e.detail.cityListId == undefined) {
      e.detail.cityListName = ''
      e.detail.areaListName = ''
      e.detail.cityListId = ''
      e.detail.areaListId = ''
    }
    if (this.data.dataType == 5) {
      this.setData({
        ['form.nursing_list_province']: e.detail.provinceNameId,
        ['form.nursing_list_city']: e.detail.cityListId,
        ['form.nursing_list_town']: e.detail.areaListId,
        ['lookCare[1].nav']: e.detail.provinceName + e.detail.cityListName + e.detail.areaListName,
        ['lookCare[1].flag']: false,
        loadingFlag: true
      })
    } else {
      this.setData({
        ['form.hospital']: e.detail.provinceNameId,
        ['form.department']: e.detail.cityListId,
        ['lookCareNav[3].nav']: e.detail.provinceName + e.detail.cityListName,
        ['lookCareNav[3].flag']: false,
        loadingFlag: true
      })
    }
    this.data.lookFlag = true
    this.data.lookCareList = []
    this.data.form.p = 1
    this.noData.noDataTrue()
    this.getData()
  },
  // 预约
  subscribe: function(e) {
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (phone == '' || btnFlag == '') {
      this.login()
      return false
    }
    let i = e.currentTarget.dataset.index
    let j = e.currentTarget.dataset.number
    let data = this.data.lookCareList[i][j]
    // if (((data.nursing_workers_relation == 1 && data.nursing_count < 1) || (data.nursing_workers_relation == 2 && data.nursing_count < 3))) {
    if (data.is_self != 1) {
      // app.globalData.id = data.nursing_workers_id
      wx.navigateTo({
        url: '../details/details?start=' + data.nursing_workers_type + '&id=' + data.nursing_workers_id
      })
    } else {
      toolTip.noPhotoTip('护工不能约自己')
    }
    // } else {
    //   toolTip.noPhotoTip('暂时无法预约哟')
    // }
  },
  // 筛选
  filtrate(){
    return new Promise((resolve, reject) => {
      this.setData({
        lookCareList: []
      })
    })
  },
  // 详情
  bindlLookCare: function(e) {
    let data = e.currentTarget.dataset
    wx.setStorageSync('lookCare_i', data.index)
    wx.setStorageSync('lookCare_j', data.number)
    wx.navigateTo({
      url: '../view/view?id='+ e.currentTarget.dataset.id
    })
  },
  // 收藏
  bindCollect: function(e) {
    let i = e.currentTarget.dataset.index
    let j = e.currentTarget.dataset.number
    let id = e.currentTarget.dataset.id
    let title = ''
    let idx = 0
    if (this.data.lookCareList[i][j].collection_count == 1){
      title = '取消收藏'
      idx = 0
    }else{
      title = '收藏成功'
      idx = 1
    }
    this.collectState(id).then((res) => {
      if(res.data.status == 1){
        this.setData({
          ['lookCareList[' + i + '][' + j + '].collection_count']: idx
        })
      }
      toolTip.noPhotoTip(title)
    })
  },
  // 收藏接口
  collectState(id){
    return new Promise((resolve,reject) => {
      api.requestServerData('/api/member/collection','get',{
        id: id,
        token: app.globalData.token,
        uid: app.globalData.uid,
        type: 1
      }).then((res) => {
        resolve(res)
      })
    })
  },
  // 动画 出现
  shade() {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    this.animation = animation
    animation.translateY(0).step()
    setTimeout(() => {
      this.setData({
        animationData: this.animation.export()
      })
    },100)
  },
  // 动画 消失
  unshade(num) {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    this.animation = animation
    animation.translateY(500).step()
    this.setData({
      animationData: this.animation.export()
    })
    if (this.data.dataType == 5 || this.data.dataType == 3){
      this.data.positionType = true
    }
    setTimeout(() => {
      this.setData({
        dialogShow: false,
        positionType: this.data.positionType
      })
    },300)
  },
  // 上拉加载
  onReady() {
    this.load = this.selectComponent("#load")
  },
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
      this.data.flag = false
      this.data.form.p += 1
      this.getData()
    }
  }, 
  // 页面滚动监听
  onPageScroll(e) {
    if (e.scrollTop > 5) {
      if (this.data.positionFlag) {
        return false
      }
      this.setData({
        positionFlag: true
      })
    } else {
      this.setData({
        positionFlag: false
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.data.form.p = 1
    this.data.loadflag = true
    let value1 = wx.getStorageSync('lookCare')
    let value2 = wx.getStorageSync('lookCareNav')
    this.data.lookCareNav = value2
    this.data.lookCare = value1
    this.data.lookCareList = []
    for (var key in this.data.form){
      if (key != 'uid' && key != 'p' && key != 'token' && key != 'keyword'){
        this.data.form[key] = ''
      }
    }
    this.setData({ 
      dialogShow: false,
      positionType: true,
      form: this.data.form,
      screenIndex: 49
    })
    this.noData.noDataTrue()
    this.scanCode().then(() => {
      this.getData()
    })
  },
  preventTouchMove(){},
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/lookCare/lookCare',
      success: res => {
        app.shareTip()
      }
    }
  }
})