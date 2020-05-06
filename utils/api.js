module.exports.requestServerData = function (url, method, data,flag) {
  return new Promise(function (resolve, reject) {
    if (flag){
      wx.showLoading({
        title: '拼命加载中~~~',
      })
    }
    let header = {}
    if (method == 'get'){
      header= {
        'content-type': 'application/json'
      }
    }else{
      header = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    wx.request({
      url: "https://www.rqxfj.com/index.php" + url,
      // url: 'http://192.168.0.105/yuyue/index.php' + url,
      data: data,
      header: header,
      method: method,
      success: function (res) {
        resolve(res)
        if (flag){
          setTimeout(() => {
            wx.hideLoading()
          }, 500)
        }
      },
      fail: function (res) {
        reject(res)
        setTimeout(() => {
          wx.hideLoading()
        }, 500)
      }
    })
  })
}