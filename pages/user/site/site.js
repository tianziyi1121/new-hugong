const app = getApp()
const api = require('../../../utils/api.js')
const toolTip = require('../../../utils/toolTip.js')
const common = require('../../../utils/common.js')
Page({
  data: {
    currentList: [],
    flag: false,
    title: '删除地址',
    start: null,
    end: null,
    id: '',
    index: null,
    editId: '',
    startIndex: '',
    positionFlag: 1
  },
  onLoad (options) {
    this.noData = this.selectComponent("#noData")
    this.show = this.selectComponent("#show")
    this.setData({
      editId: options.id
    })
    this.data.startIndex = options.start
    // this.getData()
  },
  onShow () {
    this.getData()
  },
  onUnload () {
    if ((this.data.startIndex === 1 && this.data.editId !== '' && this.data.positionFlag === 1) || this.data.positionFlag == 2 || !this.data.startIndex) {
      return false;
    }
    this.data.currentList.map(item => {
      if (this.data.editId == item.id) {
        wx.setStorageSync('editDataList', item)
      }
    })
  },
  getData () {
    api.requestServerData('/api/member/my_address_list', 'get',{
      uid: app.globalData.uid,
      token: app.globalData.token 
    }, true).then(res => {
      let data = res.data.data
      if(res.data.status == 1){
        this.noData.noDataTrue()
        data.map(item => {
          item.tel = common.phone(item.tel)
        })
        this.setData({
          currentList: data
        })
      }else{
        this.noData.noData()
        this.setData({
          flag: true
        })
      }
    })
  },
  mytouchstart: function (e) {  //记录触屏开始时间
    this.data.start = e.timeStamp
  },
  mytouchend: function (e) {  //记录触屏结束时间
    this.data.end = e.timeStamp
  },
  bindClick(e) {
    if (this.data.end - this.data.start > 300 || this.data.startIndex != 1) {
      return false
    }
    this.data.positionFlag = 2
    let index = e.currentTarget.dataset.index
    wx.setStorageSync('editDataList', this.data.currentList[index])
    wx.navigateBack({
      delta: 1
    })
  },
  deleteitem (e) {
    this.data.id = e.currentTarget.dataset.id
    this.data.index = e.currentTarget.dataset.index
    this.show.relation()
  },
  // 弹窗取消
  bindCancel() {
    toolTip.noPhotoTip('操作已取消')
  },
  // 弹窗确认
  bindAffirm() {
    api.requestServerData('/api/Member/address_delete', 'get', {
      uid: app.globalData.uid,
      token: app.globalData.token,
      id: this.data.id
    }, true).then(res => {
      if (res.data.status == 1) {
        this.data.currentList.splice(this.data.index, 1)
        this.setData({
          currentList: this.data.currentList
        })
      }
      toolTip.noPhotoTip(res.data.msg)
      this.data.currentList.length === 0 ? this.noData.noData() : ''
    })
  },
  bindsite () {
    if (this.data.currentList.length >= 5) {
      toolTip.noPhotoTip('最多只能添加5条地址')
      return false
    }
    wx.navigateTo({
      url: 'view/view',
    })
  },
  bindEdit (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: 'view/view?id='+ id
    })
  }
})