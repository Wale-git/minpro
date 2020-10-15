let config = require('../../config')
const urlList = ['lbsOrderingNew', 'preInitData', 'menuInit']
module.exports = {
  ajax: function (url, type, param, cb, noBusy, initialFlag, complete) {
    type = type || 'POST'
    const app = getApp()
    const pages = getCurrentPages()
    const curPage = pages[pages.length - 1]
    if (curPage && !noBusy) {
    }
    let sessionInfo = null
    param = param ? param : {}
    param.requestChannel = 'wxmini'
    let openId = wx.getStorageSync('openId')
    let unionId = wx.getStorageSync('unionId')
    // param.openId = 'otjnX5f9Qs43nFah3eONORg6RL_g'
    // param.unionId = 'oITRn6ETjl3EZm1pR3EyvIX6TMCE'
    param.openId = openId || ''
    param.unionId = unionId || ''
    for (var k in param) {
      if (param[k] === null || param[k] === undefined) {
        delete param[k]
      }
    }
    let header = {}
    header['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
    if (app.globalData.cookie) {
      header['cookie'] = app.globalData.cookie
    }
    let startTime = 0
    if(urlList.indexOf(url) > -1){
      startTime = Date.now()
    }
    // getApp().showLoading()
    wx.request({
      // url: config.mwosDomain + url + '?wechat_ver=' + config.version,
      url: config.mwosDomain + url,
      data: param,
      method: type, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: header,
      success: function (res) {
        if (!res || !res.header) {
          wx.showModal({
            content: "您的网络开小差了，请稍后重试！",
            showCancel: false,
            confirmText: "确定"
          })
          return
        }
        if (startTime>0){
          let urlTime = Date.now() - startTime
          app.globalData.loadUrlTime[url] = urlTime
        }
        // 把Cookie存放在全局属性中
        let setCookie = res.header['set-cookie'] || res.header['Set-Cookie']
        if (setCookie) {
          let cookieList = setCookie.match(/((JSESSIONID)|(memcacheKey)|(cookieId))=.*?;/g)
          let cookie = app.globalData.cookie || ''
          cookie += cookieList ? cookieList.join(' ') : ''
          app.globalData.cookie = cookie
        }
        if (res.data && res.data.body && res.data.body.weChatAppInfo) {
          let opts = res.data.body.weChatAppInfo
          let weChatAppInfo = JSON.parse(opts)
          let templateIds = res.data.body.templateIds
          if (templateIds){
            app.globalData.templateIds = templateIds.split(',')
          }
          if (weChatAppInfo && (weChatAppInfo.openId && weChatAppInfo.unionId) || (weChatAppInfo.openid && weChatAppInfo.unionid)) {
            let openId = weChatAppInfo.openId || weChatAppInfo.openid
            wx.setStorageSync('openId', openId)
            let unionId = weChatAppInfo.unionId || weChatAppInfo.unionid
            wx.setStorageSync('unionId', unionId)
          }
        }

        if (res.data.errorCode == 10005 || res.data.errorCode == 14005 || res.data.errorCode == 12003 || res.data.errorCode == 14004) {
          wx.showToast({
            title: '请求超时！',
            duration: 1000
          })
          app.backToPage('pages/index/index')
          return
        }
        typeof cb == 'function' && cb(res)
      },
      fail: function (res) {
        console.log(res, '接口报错')
        wx.showModal({
          content: "您的网络开小差了，请稍后重试！",
          showCancel: false,
          confirmText: "确定"
        })
      },
      complete: function () {
        if (typeof complete === "function") {
          complete()
        }
      }
    })
  }
}
