const app = getApp()
const api = require('../../../../utils/api.js')
const toolTip = require('../../../../utils/toolTip.js')
Page({
  data: {
    form: {
      status: 0,
      address: '',
      province_id: '',
      city_id: '',
      county_id: '',
      tel: null,
      name: '',
      id: '',
      province: '',
      city: '',
      county: ''
    },
    videoUp: false,
    shadow: '',
    content: '',
    position: '',
    start: '',
    addressArea: true
  },
  onLoad: function (options) {
    if (options.id === undefined) {
      this.data.form.id = ''
    }else{
      this.data.form.id = options.id
      this.getData(options.id)
    }
    this.data.start = options.start
  },

  getData (id) {
    api.requestServerData('/api/member/edit_address', 'get', {
      uid: app.globalData.uid,
      token: app.globalData.token,
      id: id
    }, true).then(res => {
      let data = res.data.data
      if(res.data.status == 1) {
        this.setData({
          form: data
        })
      }else{
        toolTip.noPhotoTip(res.data.msg)
      }
    })
  },

  bindSwitch (e) { 
    if (e.detail.value) {
      this.data.form.status = 1
    } else {
      this.data.form.status = 0
    }
  },
  bindName (e) {
    let data = e.detail.value
    let name = e.currentTarget.dataset.name
    if (name === 'name' && data.length > 25) {
      toolTip.noPhotoTip('收货人不能超过25个字')
      return false
    }
    this.setData({
      ['form.' + name]: data
    })
  },
  bindEdit () {
    this.setData({
      videoUp: true,
      addressArea: false,
      shadow: 1,
      content: 1
    })
  },
  onCalendarChange (e) {
    this.setData({
      ['form.province_id']: e.detail.provinceNameId,
      ['form.city_id']: e.detail.cityListId,
      ['form.county_id']: e.detail.areaListId,
      position: e.detail.provinceName + e.detail.cityListName + e.detail.areaListName,
      addressArea: true
    })
    this.data.form.province = e.detail.provinceName
    this.data.form.city = e.detail.city
    this.data.form.county = e.detail.county
  },
  unshade () {
    this.setData({
      shadow: 2,
      content: 2,
    })
    setTimeout(() => {
      this.setData({
        videoUp: false,
        addressArea: true
      })
    }, 400)
  },
  bindSaave () {
    let data = this.data.form
    if(!data.name) {
      toolTip.noPhotoTip('请填写收货人')
      return false
    }
    if(!data.tel) {
      toolTip.noPhotoTip('请填写电话号码')
      return false
    }
    if (!data.province_id) {
      toolTip.noPhotoTip('请选择所在地区')
      return false
    }
    if (!data.province_id) {
      toolTip.noPhotoTip('请填写详细地址')
      return false
    }
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(data.tel))) {
      toolTip.noPhotoTip('请填写正确的电话号码')
      return false;
    }
    api.requestServerData('/api/member/update_address', 'get', {
      uid: app.globalData.uid,
      token: app.globalData.token,
      name: data.name,
      tel: data.tel,
      address: data.address,
      province_id: data.province_id,
      city_id: data.city_id,
      county_id: data.county_id,
      status: data.status,
      id: data.id
    }, true).then(res => {
      if (res.data.status == 1) {
        if (this.data.start == 1) {
          this.data.form.id = res.data.data
          wx.setStorageSync('editDataList', this.data.form)
        }
        wx.navigateBack({
          delta: 1
        })
      } else {
        toolTip.noPhotoTip(res.data.msg)
      }
    })
  }
})