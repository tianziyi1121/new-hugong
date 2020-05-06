const app = getApp()
const api = require('../../utils/api.js')
const toolTip = require('../../utils/toolTip.js')
const common = require('../../utils/common.js')
const  dateTimePicker = require('../../utils/dateTimePicker.js');
Page({
  data: {
    title: {},
    list: {},
    starUrl: '../../static/collect_block.png',
    halfUrl: '../../static/icon_star_on_half@2x.png',
    greyUrl: '../../static/collect.png',
    state: [0,1,2,3,4],
    end: '',
    start: '',
    sky: 1,
    editData: '',
    editFlag: false,
    // 左侧
    leftScrollTop: 0,
    // 商品栏
    toView: 'a0',
    scrollTop: 0,
    activeIndex: 0,
    listData: [],
    height: '',
    // 商品总价
    totalGoods: '',
    // 总价
    total: 0.00,
    // 购物车数据
    selectedList: [],
    // 购物车数量显示
    num: 0,
    // 弹窗动画
    domeMode: true,
    // 参数
    endstate: 1,
    stateend: 1,
    // 付款判断
    endData: null,
    totalData_ls: '0.00',
    // 时分秒 年月日
    date: '2018-10-01',
    time: '12:00',
    dateTimeArray: null,
    dateTime: null,
    endT: null,
    startT: null,
    startYear: null,
    dataId: ''
  },
  onLoad: function (options) {
    wx.removeStorageSync('timer')
    // let id = app.globalData.id
    this.data.dataId = options.id
    this.data.startData = options.start
    this.currentListData(options.id)
    if(options.start == 2) {
      this.getHour()
    }
    this.setData({
      startFlag: options.start
    })
  },
  getHour () {
    // 获取到当前的年  按小时收费
    let timestamp = Date.parse(new Date());
    let date = new Date(timestamp);
    let thieYear = date.getFullYear();
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(thieYear, thieYear);
    var obj1 = dateTimePicker.dateTimePicker(thieYear, thieYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();
    let pn = obj1.dateTimeArray
    let pb = obj1.dateTime
    var getSeconds = new Date().getSeconds();
    this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
      startT: pn[0][pb[0]] + '-' + pn[1][pb[1]] + '-' + pn[2][pb[2]] + ' ' + pn[3][pb[3]] + ':' + pn[4][pb[4]],
      stateend: parseInt(new Date().getTime() - getSeconds * 1000),
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime,
    })
  },
  currentListData(id) {
    let flag = false
    this.getData(id).then((res) => {
      let data = res.data.data
      if (res.data.status == 1) {
        data.nursing_info.nursing_star_percent = (data.nursing_info.nursing_star_percent * 5).toFixed(1)
        if (data.address !== null && data.address !== '') {
          // data.address.tel = common.phone(data.address.tel)
          flag = true
        }
        this.bindHeight()
        let total = '0.00'
        if (this.data.startFlag == 2) {
          total = data.nursing_info.nursing_workers_money
          this.data.total = data.nursing_info.nursing_workers_money
        }
        this.setData({
          listData: data.cate_info,
          title: data.member_info,
          list: data.nursing_info,
          editData: data.address,
          editDataFlag: flag,
          totalData_ls: total,
          total: this.data.total
        })
        this.data.currentTime = data.time_list
        app.globalData.timeList = data.time_list
        this.getList()
      } else {
        toolTip.noPhotoTip('数据获取失败')
      }
    })
  },
  onShow(){
    var data = wx.getStorageSync('editDataList')
    if (this.data.editFlag && data.id != undefined) {
      data.tel = common.phone(data.tel)
      this.setData({
        editData: data
      })
      wx.removeStorageSync('editDataList')
      this.data.editFlag = false
    }
    let lshPayLf = wx.getStorageSync('lsh_pay_lf')
    let value = null
    let status = wx.getStorageSync('ls_optionsStatus')
    if (this.data.startFlag == 1) {
      if (status == 1) {
        value = wx.getStorageSync('timer')
        this.setData({
          start: value[0].data.split('-')[1] + '月' + value[0].data.split('-')[2] + '日',
          stateend: value[0].getTime,
          startTime: value[0].data,
          end: value[1].data.split('-')[1] + '月' + value[1].data.split('-')[2] + '日',
          endTime: value[1].data,
          endstate: value[1].getTime,
          sky: value[1].chaDay,
          totalData_ls: (value[1].chaDay * this.data.list.nursing_workers_money).toFixed(2)
        })
        wx.removeStorageSync('ls_optionsStatus')
        this.totalMoney()
      } else {
        this.data.endData = this.getNowFormatDate()
        this.setData({
          end: this.getNowFormatDate(),
          start: this.getNowFormatDate(),
          sky: 0
        })
      }
    }
    if (lshPayLf == 1){
      this.currentListData(this.data.dataId)
      wx.removeStorageSync('lsh_pay_lf')
    }
  },

  // 获取数据
  getData(id) {
    return new Promise((resolve, reject) => {
      api.requestServerData('/api/member/confirm_yuyue', 'get', {
        id: id,
        uid: app.globalData.uid,
        token: app.globalData.token
      }, true).then((res) => {
        resolve(res)
      })
    })
  },
  // 时间
  bindTime() {
    wx.navigateTo({
      url: '../timer/timer'
    })
  },
  // 获取当前时间
  getNowFormatDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if(month >= 1 && month <= 9) {
      month = "0" + month;
    }
    this.setData({
      endTime: month + '/' + strDate,
      startTime: month + '/' + strDate,
      sky: 0
    })
    var currentdate = month + '月' + strDate + '日';
    return currentdate;
  },
  // 点击scroll-view 监听滚动 完成右到左的联动
  scroll(e) {
    let index = 0
    var dis = e.detail.scrollTop
    for (let i = 0; i < this.data.scrollArr.length; i++) {
      if (i < this.data.scrollArr.length - 1) {
        if (dis == 0){
          this.setData({
            activeIndex: 0,
          })
          break
        }else if (dis > this.data.scrollArr[i] && dis < this.data.scrollArr[i + 1]) {
          let flag = true
          for (var j = i; j < this.data.listData.length; j++){
            if (flag && this.data.listData[j].product.length > 0){
              flag = false
              i = j
            }
          }
          if (wx.getStorageSync('ll_activeIndex')) {
            index = wx.getStorageSync('ll_activeIndex')
            wx.removeStorageSync('ll_activeIndex')
          } else {
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
    this.data.activeIndex > 0 ? this.data.leftScrollTop = 48 * this.data.activeIndex : this.data.leftScrollTop = 0
    this.setData({
      leftScrollTop: this.data.leftScrollTop
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
      scrollArr.push(scrollArr[i] + 92 * this.data.listData[i].product.length + 22)
      if (indexFlag && this.data.listData[i].product.length > 0){
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
  // 获取当前手机的高度
  bindHeight(){
    var that = this;  
    common.windowHeight().then(rese => {
      let promise1 = new Promise(function (resolve) {
        var query = wx.createSelectorQuery();
        var app = query.select('#editHeight').boundingClientRect(rect => {
          resolve(rect.height)
        }).exec();
      });
      let promise2 = new Promise(function (resolve) {
        var query = wx.createSelectorQuery();
        var app = query.select(".shopping-footer").boundingClientRect(rect => {
          resolve(rect.height)
        }).exec();
      });
      let promiseAll = Promise.all([promise1, promise2]);
      promiseAll.then(function (res) {
        that.setData({
          height: rese - ((res[0] + res[1]) * 2)
        })
      });
    })
  },
  // 点击侧边栏
  selectMenu: function (e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      activeIndex: index,
      toView: 'a' + index,
    })
    wx.setStorageSync('ll_activeIndex', index)
  },
  // 去付款
  bindPay(id, timer) {
    if (this.data.sky == 0){
      toolTip.noPhotoTip('请选择预约时间')
      return false;
    }
    wx.removeStorageSync('timer')
    wx.navigateTo({
      url: 'view/view?id=' + id + '&timer=' + timer + '&total=' + this.data.total + '&orderType=1'
    })
  },
  // 列表添加商品加号
  catchAdd(e){
    let i = e.currentTarget.dataset.index
    let j = e.currentTarget.dataset.number
    let id = this.data.listData[i].product[j].pro_id
    let items = this.data.listData[i].product[j]
    this.data.listData[i].product[j].num += 1
    this.setData({
      ['listData[' + i + '].product[' + j + '].num']: this.data.listData[i].product[j].num
    })
    this.totalMoney()
  },
  // 列表添加商品减号
  catchMin(e) {
    let i = e.currentTarget.dataset.index
    let j = e.currentTarget.dataset.number
    let id = this.data.listData[i].product[j].id
    let items = this.data.listData[i].product[j]
    this.data.listData[i].product[j].num -= 1
    this.setData({
      ['listData[' + i + '].product[' + j + '].num']: this.data.listData[i].product[j].num
    })
    this.totalMoney()
  },
  // 总价
  totalMoney(){
    this.data.selectedList = []
    if (this.data.listData[0].product != []){
      for (var a = 0; a < this.data.listData.length; a++) {
        for (var b = 0; b < this.data.listData[a].product.length; b++) {
          if (this.data.listData[a].product[b].num > 0) {
            this.data.selectedList.push(this.data.listData[a].product[b])
          }
        }
      }
    }
    let money = 0
    this.data.selectedList.map(item => {
      money = money + item.num * item.pro_price
    })
    this.setData({
      total: (money + (this.data.list.nursing_workers_money * this.data.sky)).toFixed(2),
      totalGoods: money.toFixed(2),
      num: this.data.selectedList == [] ? 0 : this.data.selectedList.length,
      selectedList: this.data.selectedList
    })
  },
  // 弹窗动画
  bindShopping() {
    this.setData({
      domeMode: false
    })
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear',
    })
    this.animation = animation
    setTimeout( () => {
      this.fadeIn()
    },100)
  },
  // 出现动画
  fadeIn() {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  // 消失动画
  hideModal() {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    this.fadeDown()
    setTimeout(() => {
      this.setData({
        domeMode: true
      })
    },200)
  },
  fadeDown() {
    this.animation.translateY(800).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  // 去支付
  bindPayment(e) {
    let ids = '', num = '', dataJson = this.data.editData
    if(e.currentTarget.dataset.id == 1){
      this.hideModal()
    }
    if (this.data.selectedList.length != 0){
      this.data.selectedList.map(item => {
        ids += item.pro_id +','
        num += item.num + ','
      })
    }else{
      ids += ''
      num += ''
    }
    if (dataJson === null || dataJson === '') {
      toolTip.noPhotoTip('请添加收货地址')
      return false
    }
    this.data.startFlag == 2 ? this.data.endstate = this.data.stateend + (this.data.sky * 3600000) : ''
    if (this.data.endstate <= this.data.stateend) {
      toolTip.noPhotoTip('请选择预约时间')
      return false
    }
    let timeFlag = false
    if (this.data.startData === 2) {
      console.log(11111111111111)
      this.data.currentTime.map(item => {
        if ((item.service_begin_time <= this.data.stateend / 1000 && this.data.stateend / 1000 <= item.service_end_time) || (item.service_begin_time <= this.data.endstate / 1000 && this.data.endstate / 1000 <= item.service_end_time) || (item.service_begin_time >= (this.data.stateend / 1000) && (this.data.endstate / 1000) >= item.service_end_time)) {
          timeFlag = true
          return false
        }
      })
    }
    
    if (timeFlag) {
      toolTip.noPhotoTip('该时间段预约人数已满')
      return false
    }
    api.requestServerData('/api/orders/sub_order', 'get', {
      ids: ids,
      num: num,
      nursing_workers_id: this.data.list.nursing_workers_id,
      service_begin_time: this.data.stateend/1000,
      service_end_time: this.data.endstate/1000,
      uid: app.globalData.uid,
      token: app.globalData.token,
      orderType: 1,
      type: 1,
      orderRemarks: '',
      orderSrc: 'wechat',
      trade_type: 'JSAPI',
      county_id: dataJson.county_id,
      city_id: dataJson.city_id,
      province_id: dataJson.province_id,
      userAddress: dataJson.address,
      userName: dataJson.name,
      userPhone: dataJson.tel,
    }, true).then((res) => {
      if(res.data.status == 1){
        let data = res.data.data
        this.bindPay(data.order_id, data.createTime)
        wx.setStorageSync('lsh_pay_lf', 1)
      }else{
        toolTip.noPhotoTip(res.data.msg)
      }
    })
  },
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/subscribe/subscribe'
    }
  },
  // 注销
  onHide() {
    wx.removeStorageSync('ls_activeIndex')
  },
  // 时间
  changeDateTime1(e) {
    this.setData({ dateTime1: e.detail.value });
  },
  bindAdd () {
    this.data.sky += 1
    this.setData({
      sky: this.data.sky,
      totalData_ls: (this.data.list.nursing_workers_money * this.data.sky).toFixed(2)
    })
    this.totalMoney()
  },
  bindMin () {
    if (this.data.sky > 1) {
      this.data.sky -= 1
      this.setData({
        sky: this.data.sky,
        totalData_ls: (this.data.list.nursing_workers_money * this.data.sky).toFixed(2)
      })
      this.totalMoney()
      return false
    }
    toolTip.noPhotoTip('亲，不能低于一小时')
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    let pn = dateArr[0][arr[0]] + '-' + dateArr[1][arr[1]] + '-' + dateArr[2][arr[2]] + ' ' + dateArr[3][arr[3]] + ':' + dateArr[4][arr[4]]
    let data = Date.parse(new Date(pn))
    if (parseInt(new Date().getTime() / 1000) * 1000 > data) {
      toolTip.noPhotoTip('所选时间不能小于当前时间')
      return false
    }
    if(e.currentTarget.dataset.sun == 1) {
      this.setData({
        startT: pn
      });
      this.data.stateend = data
    }
  },
  bindEdit(e) {
    let data = e.currentTarget.dataset, url = '../user/site/site?id=' + data.id + '&start=' + 1;
    if (data.index == 2) {
      url = '../user/site/view/view?start=' + 1
    }
    this.data.editFlag = true
    wx.navigateTo({
      url: url,
    })
  }
})