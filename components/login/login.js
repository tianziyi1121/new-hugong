Component({
  properties: {},
  data: {
    title: '登录',
    cancel: '暂不登录',
    affirm: '立即登录'
  },
  attached() { 
    let phone = wx.getStorageSync('phone')
    let btnFlag = wx.getStorageSync('btnFlag')
    if (phone == '' && btnFlag !== ''){
      this.setData({
        title: '授权手机号码',
        cancel: '取消',
        affirm: '确认'
      })
    }
  },
  methods: {
    bindLogin (e){
      let type = e.currentTarget.dataset.type
      this.triggerEvent('bindLogin', {
        type: type
      });
    }
  }
})