const app = getApp();
const api = require('../../utils/api.js')
const toolTip = require('../../utils/toolTip.js')
Page({
  data: {
    url: '../../static/10.jpg',
    currentList: [],
    // 弹窗数据
    id: null,
    state: null,  //1、删除 2、确认收货
    index: null,
    number: null,
    title: null,
    // 下拉刷新
    topFlag: false,
    // 上拉加载
    loadingFlag: true,
    // 分页
    p: 1,
    // 请求一次接口得到的数量
    num: null,
    // 一页的数量
    pn: 10,
    delected: 1,
    flag: true,
    role_id: null,
    showFlag: true,
    loginType: 1,
  },
  onLoad() {
    wx.removeStorageSync('lookCare_collect')
    wx.removeStorageSync('lookCare_i')
    wx.removeStorageSync('lookCare_j')
    wx.removeStorageSync('Lsh_ListdATA')
    wx.removeStorageSync('Lsh_liData')
    wx.removeStorageSync('food_I')
    wx.removeStorageSync('food_j')
    this.data.showFlag = false
    this.getData()
    
  },
  onShow(){
    this.setData({
      role_id: app.globalData.uid
    })
    if (this.data.showFlag){
      this.data.flag = false
      this.getData()
    }
    this.noData = this.selectComponent("#noData")
    this.data.p = 1
    this.data.currentList = []
  },
  // 列表
  getData() {
    api.requestServerData('/api/member/my_orders','get',{
      uid: app.globalData.uid,
      token: app.globalData.token,
      p: this.data.p
    },this.data.flag).then((res) => {
      let tostFlag = false
      let data = res.data.data
      if(res.data.status == 1) {
        let nursing_id = data.nursing_id
        // let arr = []
        // 判断是否有数据
        // if (data.list.length > 0){
        //   // 判断身份
        //   if (nursing_id != 0) {
        //     data.list.map((item) => {
        //       if (item.nursing_id == 0 || (item.nursing_id == nursing_id && item.nursing_id != 0 && item.orderStatus != 0) || (item.nursing_id != nursing_id && item.nursing_id != 0)) {
        //         arr.push(item)
        //       }
        //     })
        //   } else {
        //     arr = data.list
        //   }
        // }
        // let array = []
        // // 充值订单
        // arr.map( item => {
        //   if (item.orderType == 2 && item.dataFlag == 1 && item.orderStatus == 0 && item.isClosed == 0){
        //     // 不做处理
        //   }else{
        //     array.push(item)
        //   }
        // })
        this.data.num = data.list.length
        if (this.data.num > 4 && this.data.num < 10) {
          this.setData({
            loadingFlag: true
          })
        }
        let pn = this.data.p - 1
        this.data.currentList[pn] = []
        if (this.data.topFlag) {
          this.setData({
            currentList: [],
            ['currentList[' + pn + ']']: data.list,
            nursing_id: nursing_id
          })
        }else{
          this.setData({
            ['currentList[' + pn + ']']: data.list,
            nursing_id: nursing_id
          })
        }
        this.data.num == 0 && this.data.p == 1 ? this.noData.noData() : this.noData.noDataTrue()
      }else{
        if(this.data.p == 1){
          this.setData({
            currentList: [],
            loadingFlag: true,
          })
          this.noData.noData()
        }else{
          this.load.change();
        }
        this.data.num=0
      }
      if (this.data.topFlag) {
        app.postpone()
        this.data.topFlag = false
      }
      if (this.data.num > 3) {
        this.setData({
          loadingFlag: false,
        })
      }
      this.data.showFlag = true
    })
  },
  // 申请退款 
  bindApply: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: 'apply/apply?id='+ id
    })
  },
  // 评价
  bindEvaluate(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: 'view/view?id=' + id
    })
  },
  // 删除
  bindDelete(e) {
    this.data.id = e.currentTarget.dataset.id
    this.data.index = e.currentTarget.dataset.index
    this.data.number = e.currentTarget.dataset.number
    this.data.state = e.currentTarget.dataset.state
    let title=null
    if (this.data.state == 1){
      title = "是否确认删除？"
    }else{
      title = "是否确认收货？"
    }
    this.setData({
      title: title
    })
    this.show.relation()
  },
  // 弹窗确认
  bindAffirm() {
    if(this.data.state == 1){
      this.deleteData()
    }else{
      this.confirmReceipt()
    }
  },
  // 弹窗取消
  bindCancel() {
    toolTip.noPhotoTip('操作已取消')
  },
  // 删除
  deleteData(){
    api.requestServerData('/api/member/order_del', 'get', {
      uid: app.globalData.uid,
      token: app.globalData.token,
      id: this.data.id
    }).then((res) => {
      if(res.data.status == 1) {
        toolTip.noPhotoTip('删除成功')
       this.data.currentList[this.data.index].splice(this.data.number,1)
        if (this.data.currentList.length == 0){
          this.noData.noData()
          this.data.loadingFlag = true
        } else if (this.data.currentList.length <= 3) {
          this.data.loadingFlag = true
        } else {
          this.data.loadingFlag = false
        }
        this.setData({
          currentList: this.data.currentList,
          loadingFlag: this.data.loadingFlag
        })
        // this.load.onChange()
      }else{
        toolTip.noPhotoTip(res.data.msg)
      }
    })
  },
  // 确认收货
  confirmReceipt() {
    api.requestServerData('/api/member/receving_goods', 'get', {
      uid: app.globalData.uid,
      token: app.globalData.token,
      id: this.data.id
    }).then((res) => {
      if(res.data.status == 1){
        toolTip.noPhotoTip('订单已确认收货')
        this.setData({
          ["currentList[" + this.data.index + "][" + this.data.number + "].orderStatus"]: 4
        })
      }else{
        toolTip.noPhotoTip(res.data.msg)
      }
    })
  },
  // 待付款
  bindmoney(e) {
    let data = e.currentTarget.dataset
    wx.navigateTo({
      url: "../subscribe/view/view?id=" + data.id + "&total=" + data.money + '&timer=' + data.timer + '&orderType=' + data.ordertype
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.data.topFlag = true
    this.data.p = 1
    this.setData({
      loadingFlag: true
    })
    this.data.flag = true
    this.getData();
  },
  // 上拉加载
  onReady() {
    this.load = this.selectComponent("#load")
    this.show = this.selectComponent("#show")
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
    this.data.flag = false
    if (flag) {
      this.data.p += 1
      this.getData()
    }
  },
  // 物品详情
  indentList(e) {
    let id = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.type//1、护工；2、物品
    let num = e.currentTarget.dataset.num
    let url = '../lookCare/view/view?id=' + id
    if (type != 1) {
      if (num != 3) {
        url = '../food/details/details?id=' + id + '&type=1'
      } else {
        url = '../product/view/view?id=' + id
      }
    }
    wx.navigateTo({
      url: url
    })
  },
  preventTouchMove() {},
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/indent/indent',
      success: res => {
        app.shareTip()
      }
    }
  },
})