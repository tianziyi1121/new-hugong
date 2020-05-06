// pages/indent/view/view.js
const app = getApp();
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    starUrl: '../../../static/collect_block.png',
    halfUrl: '../../../static/icon_star_on_half@2x.png',
    greyUrl: '../../../static/collect.png',
    state: [0,1,2,3,4],
    // 当前数据 
    currentList: [],
    // 提交参数
    form :{
      uid: null,
      token: null,
      orderId: null,
      c_is_showname: 1,    // 匿名
      c_tags_id: [],     // 服务评价
      c_content: '',        // textarea
      c_star_rank: null      // 星级
    }, 
    // 参数
    list: {
      uid: null,
      token: null,
      orderId: null
    },
    url: null
  },
  onLoad: function (options) {
    this.data.list.orderId = options.id
    this.data.form.orderId = options.id
    this.data.list.uid = app.globalData.uid
    this.data.form.uid = app.globalData.uid
    this.data.list.token = app.globalData.token
    this.data.form.token = app.globalData.token
    this.getData()
  },
  // 获取数据
  getData() {
    api.requestServerData('/api/member/order_comments','get',this.data.list).then((res) => {
      this.setData({
        currentList: res.data.data.tags_list,
        url: res.data.data.nursing_info.nursing_workers_headpic
      })
    })
  },
  // 点击left
  bindLeft(e) {
    let key = e.currentTarget.dataset.index
    if(key==0.5 && this.data.key == 0.5){
        key = 0
    }
    this.setData({
      ['form.c_star_rank']:key
    })
  },
  // 点击right
  bindRight(e) {
    let key = e.currentTarget.dataset.index
    this.setData({
      ['form.c_star_rank']: key
    })
  },
  // 匿名
  checkboxChange(e) {
    let id
    if (e.detail.value.length < 1) {
      id = 0
    }else{
      id = 1
    }
    this.setData({
      ['form.c_is_showname']: id
    })
  },
  // 态度
  bindstate(e) {
    let index = e.currentTarget.dataset.index
    if (this.data.currentList[index].tags_sort == 0){
      this.data.currentList[index].tags_sort = 1
    }else {
      this.data.currentList[index].tags_sort = 0
    }
    this.setData({
      currentList: this.data.currentList
    })
  },
  // textarea
  bindTextarea(e) {
    this.setData({
      ['form.c_content']: e.detail.value
    })
  },
  // 提交
  bindsubmint() {
    let data = this.data.form
    this.data.currentList.map(item => {
      if (item.tags_sort == 1){
        data.c_tags_id = item.tags_id + ',' + data.c_tags_id
      }
    })
    if (!data.c_content){
      toolTip.noPhotoTip('体验内容不能为空')
      return false
    }
    for(var key in data){
      if(!data[key]){
        toolTip.noPhotoTip('数据不能为空')
        return false
      }
    }
    data.c_tags_id = data.c_tags_id.substring(0, data.c_tags_id.length - 1)
    api.requestServerData('/api/member/add_order_comments', 'get', this.data.form).then((res) => {
      if (res.data.status == 1) {
        toolTip.noPhotoTip('评价成功')
        setTimeout(() => {
          wx.switchTab({
            url: '../indent'
          })
        },1000)
      }else{
        toolTip.noPhotoTip(res.data.msg)
      }
    })
  },
  // json2Form(json) {
  //   var str = [];
  //   for(var p in json){
  //     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  //   }
  //   return str.join("&");
	// },
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/indent/view/view',
      success: res => {
        app.shareTip()
      }
    }
  }
})