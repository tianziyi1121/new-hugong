const app = getApp()
const api = require("../../utils/api.js")
const toolTip = require('../../utils/toolTip.js')
const common = require('../../utils/common.js')
Page({
  data: {
    currentList: [],
    // 总价
    total: '',
    totalId: [],
    typeFlag: null,
    id: '',
    type: '',
    orderRemarks: '',
    valueFlag: true,
    topHeight: null,
    editData: '',
    editFlag: false
  },
  onLoad: function(options) {
    options.value == 1 ? this.data.valueFlag = false : ''
    if (options.type == 1){
      this.data.typeFlag = false
      this.data.id = options.ids
    }else{
      this.data.typeFlag = true
    }
    this.data.type = options.type
    this.setData({
      valueFlag: this.data.valueFlag,
      typeFlag: this.data.typeFlag
    })
    this.getData(options.num, options.ids, options.type)
  },
  onShow () {
    var data = wx.getStorageSync('editDataList')
    if (this.data.editFlag && data.id != undefined) {
      this.setData({
        editData: data
      })
      wx.removeStorageSync('editDataList')
      this.data.editFlag = false
    }
  },
  // 获取数据
  getData(num,ids,type) {
    api.requestServerData('/api/orders/order_confirm', "get", {
      num: num,
      ids: ids,
      type: type,
      uid: app.globalData.uid,
      token: app.globalData.token
    }, true).then((res) => {
      if(res.data.status == 1) {
        if (res.data.data.list.length > 0){
          let data = res.data.data.list
          data.map(item => {
            item.pro_num = Number(item.pro_num)
          })
          // res.data.data.address.tel = common.phone(res.data.data.address.tel)
          this.setData({
            currentList: data,
            editData: res.data.data.address
          })
          this.totalMoney()
        }else{
          toolTip.noPhotoTip('亲、暂无数据')
        }
      }
    })
  },
  // min
  orderMin: function(e) {
    var index = e.currentTarget.dataset.index
    if (!this.data.typeFlag && this.data.currentList[index].pro_num > 1){
      this.data.currentList[index].pro_num -= 1
    } else if (this.data.typeFlag && this.data.currentList[index].carts_num > 1){
      this.data.currentList[index].carts_num -= 1
    } else {
      toolTip.noPhotoTip('亲、最少购买1件哦')
    }
    this.totalMoney()
  },
  // add
  orderAdd: function(e) {
    var index = e.currentTarget.dataset.index
    if (!this.data.typeFlag) {
      this.data.currentList[index].pro_num += 1
    } else {
      this.data.currentList[index].carts_num += 1
    }
    this.data.currentList[index].carts_num += 1
    this.totalMoney()
  },
  // 总价
  totalMoney: function(e) {
    var money = 0
    var arr = []
    this.data.currentList.map(item => {
      if (!this.data.typeFlag){
        money += item.pro_num * item.pro_price
      }else{
        money += item.carts_num * item.carts_product_price
      }
      arr.push(item.id)
    })
    this.setData({
      total: money.toFixed(2),
      currentList: this.data.currentList,
      totalId: arr
    })
  },
  // 地址
  orderBind(e) {
    let data = e.detail.value
    if (data.length >=90) {
      toolTip.noPhotoTip('亲，备注不得超过90字')
    }
    this.data.orderRemarks = e.detail.value
  },
  // 提交订单
  bindOrder() {
    let ids = '', num = '', id = '', dataJson = this.data.editData;
    if (!this.data.typeFlag){
      id = this.data.id,
      num = this.data.currentList[0].pro_num
      ids = ''
    }else{
      this.data.currentList.map(item => {
        ids += item.carts_id + ","
        num += item.carts_num + ","
      })
      id = ''
    }

    let list = {
      type: this.data.type,
      uid: app.globalData.uid,
      token: app.globalData.token,
      num: num,
      orderType: 1,
      orderSrc: "wechat",
      ids: ids,
      id: id,
      orderRemarks: this.data.orderRemarks,
      county_id: dataJson.county_id,
      city_id: dataJson.city_id,
      province_id: dataJson.province_id,
      userAddress: dataJson.address,
      userName: dataJson.name,
      userPhone: dataJson.tel,
    }
    api.requestServerData('/api/orders/sub_order', 'get', list,false).then((res) => {
      if(res.data.status == 1){
        wx.navigateTo({
          url: '../subscribe/view/view?total=' + this.data.total + '&id=' + res.data.data.order_id + '&timer=' + res.data.data.createTime +'&orderType=1'
        })
      }else{
        toolTip.noPhotoTip('提交失败')
      }
    })
  },
  bindEdit (e) {
    let data = e.currentTarget.dataset, url = '../user/site/site?id=' + data.id + '&start=' + 1;
    if (data.index == 2) {
      url = '../user/site/view/view?start=' + 1
    }
    this.data.editFlag = true
    wx.navigateTo({
      url: url,
    })
  }
  // // 分享
  // onShareAppMessage() {
  //   return {
  //     title: app.share.name,
  //     path: 'pages/order/order',
  //     success: res => {
  //       app.shareTip()
  //     }
  //   }
  // }
})