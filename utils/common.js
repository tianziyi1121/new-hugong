const api = require("api.js")
// 获取屏幕高度
module.exports.windowHeight = function(){
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: function (res) {
        let height = (res.windowHeight * (750 / res.windowWidth))
        resolve(height)
      }
    })
  })
} 
// 获取银行卡信息
module.exports.bankData = function (uid,token) {
  return new Promise((resolve,reject) => {
    api.requestServerData("/api/Member/bank_edit", "post", {
      token: token,
      uid: uid
    }, false).then((res) => {
      let type = null
      if (res.data.status == 1) {
        type = 1
        wx.setStorageSync('lsh_bankData', res.data.data)
      } else if (res.data.status == 2) {
        // 没绑卡
        type = 2
        wx.removeStorageSync('lsh_bankData')
      }
      resolve(type)
    })
  })
}
// 个人信息
module.exports.userData = function (uid, token) {
  return new Promise((resolve, reject) => {
    api.requestServerData('/api/member/index', 'get', {
      uid: uid,
      token: token
    }, false).then((res) => {
      let data = res.data   
      resolve(data)
    })
  })
}

// 加载医院
module.exports.hospitalList = function (uid, token, p, pid) {
  return new Promise((resolve, reject) => {
    api.requestServerData("/api/other_cate/get_cate_list", "get", {
      uid: uid,
      pid: pid,
      token: token,
      p: p
    }, false).then((res) => {
      let data = res.data
      resolve(data)
    })
  })
},

// 图片处理
module.exports.imageStyle = function (data) {
  let html = data
    // .replace(/<p([\s\w"=\/\.:;]+)((?:(style="[^"]+")))/ig, '<p')
    // .replace(/<p>/ig, '<p style="font-size: 15Px; line-height: 25Px;">')
    .replace(/<img([\s\w"-=\/\.:;]+)((?:(height="[^"]+")))/ig, '<img$1')
    .replace(/<img([\s\w"-=\/\.:;]+)((?:(width="[^"]+")))/ig, '<img$1')
    .replace(/<img([\s\w"-=\/\.:;]+)((?:(style="[^"]+")))/ig, '<img$1')
    .replace(/<img([\s\w"-=\/\.:;]+)((?:(alt="[^"]+")))/ig, '<img$1')
    .replace(/<img([\s\w"-=\/\.:;]+)/ig, '<img$1');
  html = html.replace(/<img/gi, "<img style='width:auto!important;height:auto!important; max-width:100%; margin: 10px 0 0 0 0;'");
  return html
}
// 电话号码处理
module.exports.phone= function (tel) {
   let data = tel.replace(tel.substring(3, 7), "****")
   return data
 }