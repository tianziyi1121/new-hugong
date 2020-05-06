const app = getApp()
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    currentList: [],
    total: 0,
    orderRemarks: ''
  },
  onLoad: function (options) {
    let total = options.total
    let data = wx.getStorageSync('lsh_currentList')
    this.setData({
      currentList: data,
      total: total
    })
  },
  // 提交订单
  bindOrder() {
    let cate_ids = ''
    let num = ''
    wx.removeStorageSync('lsh_currentList')
    this.data.currentList.map(item => {
      cate_ids = item.cate_id + ',' + cate_ids
      num = item.num + ','+ num
    })
    if (!this.data.orderRemarks){
      toolTip.noPhotoTip('备注不能为空')
      return false
    }
    api.requestServerData('/api/orders/sub_order', 'get', {
      cate_ids: cate_ids.substring(0, cate_ids.length - 1),
      num: num.substring(0, num.length - 1),
      orderType: 1,
      type: 1,
      uid: app.globalData.uid,
      token: app.globalData.token,
      orderSrc: 'wechat',
      trade_type: 'JSAPI',
      orderRemarks: this.data.orderRemarks
    }, true).then((res) => {
      let data = res.data.data
      if(res.data.status == 1){
        wx.navigateTo({
          url: '../../subscribe/view/view?id=' + data.order_id + '&timer=' + data.createTime + "&total=" + this.data.total,
        })
      }else{
        toolTip.noPhotoTip(res.data.msg)
      }
    })
    wx.removeStorageSync('Lsh_ListdATA')
    wx.removeStorageSync('Lsh_liData')
    wx.removeStorageSync('food_I')
    wx.removeStorageSync('food_j')
  },
  // textEare
  bindText(e) {
    this.data.orderRemarks = e.detail.value
  }
})