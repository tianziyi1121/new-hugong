const app = getApp()
const api = require("../../../utils/api.js")
const toolTip = require('../../../utils/toolTip.js')
Page({
  data: {
    // 轮播图
    indicatorDots: true,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    homeImage: [
      '../../../static/5555.png',
      '../../../static/5555.png',
      '../../../static/5555.png'
    ],
    // title 
    details: {},
    // 收藏
    url: '../../../static/collect.png',
    surl: '../../../static/collect_block.png',
    collect_box: true,
    // 弹窗
    domeMode: true,
    // 产品id
    id: null,
    loginFlag: false,
    shappFlag: false
  }, 
  onLoad: function(options) {
    this.data.id = options.id
    this.getData(this.data.id)
  }, 
  onShow (){
    if (this.data.shappFlag) {
      this.getData(this.data.id)
      this.data.shappFlag = false
    }
  },
  // login
  login(){
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (phone && btnFlag) {
      this.data.loginFlag = false
    } else {
      this.data.loginFlag = true
    }
    this.setData({
      loginFlag: this.data.loginFlag
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
  getData(id) {
    api.requestServerData('/api/product/product_cont',"get",{
      product_id: id,
      uid: app.globalData.uid,
      token: app.globalData.token
    },true).then((res) => {
      if(res.data.status == 1){
        res.data.data.pro_content = res.data.data.pro_content.replace(/<(?!\/?p|\/?IMG)[^<>]*>/ig, '')
          .replace(/<p([\s\w"=\/\.:;]+)((?:(style="[^"]+")))/ig, '<p')
          .replace(/<p>/ig, '<p class="f12" style="line-height: 26px;color: #666;">');
        const regex = new RegExp('<img', 'gi');
        res.data.data.pro_content = res.data.data.pro_content.replace(regex, `<img style="max-width: 345px;"`);
        this.setData({
          details: res.data.data
        })
        if (res.data.data.is_collection == 0) {
          this.data.collect_box = true
        } else {
          this.data.collect_box = false
        }
      }
    })
  },
  // 动画出现
  phone: function(e) {
    this.setData({
      domeMode: false
    })
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    this.animation = animation
    setTimeout(() => {
      this.animation.translateY(0).step()
      this.setData({
        animationData: this.animation.export()
      })
    },100)
  },
  // 购物车 
  shoppingCart: function() {
    this.data.shappFlag = true
    wx.navigateTo({
      url: '../../shopping/shopping'
    })
  },
  // 加入购物车
  addShoppingCart: function() {
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (phone == '' || btnFlag == ''){
      this.login()
      return false
    } 
    api.requestServerData('/api/carts/add_carts','post',{
      id: this.data.id,
      type: 1,
      uid: app.globalData.uid,
      token: app.globalData.token,
      num: 1,
      product_price: this.data.details.pro_price
    },false).then((res) => {
      if(res.data.status == 1) {
        this.setData({
          ['details.carts_count']: this.data.details.carts_count + 1
        })
        toolTip.noPhotoTip('物品已加入购物车')
      } else {
        toolTip.noPhotoTip(res.data.msg)
      }
    })
    this.setData({
      ['details.num']: this.data.details.num + 1 
    })
  },
  // 立即购买
  buyNow: function(e) {
    // let id = e.currentTarget.dataset.index
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')

    if (phone == '' || btnFlag == '') {
      this.login()
      return false
    }
    wx.navigateTo({
      url: '../../order/order?ids='+ this.data.id +'&type=1&num=1'
    })
  },
  // 收藏
  collect: function() {
    if (app.globalData.uid == '') {
      this.login()
      return false
    }
    let title = ''
    let type = ''
    let collect = ''
    if (this.data.collect_box){
      title = '商品已收藏'
      collect = 1
    }else{
      title = '已取消收藏'
      collect = 0
    }
    let list = {
      id: this.data.details.id,
      type: 2,
      uid: app.globalData.uid,
      token: app.globalData.token
    }
    api.requestServerData('/api/member/collection', 'post', list,true).then((res) => {
      if (res.data.status == 1){
        this.setData({
          ['details.is_collection']: collect
        })
        this.data.collect_box = !this.data.collect_box
        toolTip.noPhotoTip(title)
      }
    }).catch((res) => {
      toolTip.noPhotoTip('亲，网络不通畅')
    })
  },
  // 弹窗
  bindCancel() {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    this.animation = animation
    this.animation.translateY(340).step()
    this.setData({
      animationData: this.animation.export()
    })
    setTimeout(() => {
      this.setData({
        domeMode: true
      })
    }, 200)
  },
  //  确认
  bindAffirm() {
    this.bindCancel()
    setTimeout(()  => {
      wx.makePhoneCall({
        phoneNumber: this.data.details.pro_tel
      })
    },200)
  },
  // 监听返回事件
  onUnload() {
    if (!this.data.domeMode){
      this.setData({
        domeMode: true
      })
    }
  },
  imageListData(e) {
    let data = e.currentTarget.dataset;
    if (this.data.details.pro_allpic.length == 0) return;
    wx.previewImage({
      current: this.data.details.pro_allpic[data.index],
      urls: this.data.details.pro_allpic
    });
  },
  // 分享
  onShareAppMessage() {
    return {
      title: app.share.name,
      path: 'pages/product/view/view?id=' + this.data.id, 
      success: res => {
        app.shareTip()
      }
    }
  }
})