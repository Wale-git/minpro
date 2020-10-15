// pages/me/me.js
import api from '../../common/api/index.js'
let gbData = getApp().globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad: function (options) {
    wx.hideShareMenu()
  },
  toMini(e) {
    let param = e.target.dataset.param
    wx.navigateToMiniProgram({
      // appId: 'wx061e4b9f73885f51',
      // path: 'pages/index/index?page=' + param,
      // envVersion: 'release', //develop开发版  trial体验版  release正式版
      appId: 'wxe5ebd0a4885e8a88',
      path: 'pages/index/index?page=' + param,
      envVersion: 'release', //develop开发版  trial体验版  release正式版
      success(res) {
        // 打开成功
      },
      fail(res) {
        // 跳转失败
      }
    })
  },
  jumpToIndex() {//直接跳转点餐页面
    getApp().globalData.orderType = 2
    getApp().backToPage('pages/store/store', { type: getApp().globalData.orderType })
  },
  jumpToMyOrder() {
    let showAuth = gbData.showAuth
    if (showAuth) {
      getApp().alert1({
        title: '微信授权',
        text: 'Tims点餐需要获取您的用户信息，请点击确定允许微信授权。',
        alertButton: '确定',
        callback: () => {
          return
        }
      })
    } else {
      getApp().backToPage('pages/orders/orders')
    }
  },
  /**
   * 请求用户授权接口回调，可获取用户名，用户头像等
   * getUserInfo
   */
  domUserInfo(e) {
    let data = e && e.detail || {}
    let _this = this
    if (data && data.encryptedData) { // 获取用户成功
      gbData.nickName = data && data.userInfo.nickName
      gbData.gender = data && data.userInfo.gender
      gbData.showAuth = false
      _this.setData({
        showAlert1: false
      })
      _this.wxLogin(code => {
        _this.mineUserInfo(code, data.encryptedData, data.iv)
      })
    } else { // 拒绝获取  
      console.log(JSON.stringify(data), 'domUserInfo fail')
    }
  },
  /**
   * 微信官方login
   */
  wxLogin(cb) {
    wx.login({
      success(res) {
        if (res.code) {
          cb && cb(res.code)
        }
      },
      fail(res) {
        cb && cb(res)
      }
    })
  },

  /**
   * 后台服务的用户数据
   */
  mineUserInfo(code, encryptedData, iv) {
    let param = {
      code: code,
      encryptedData: encryptedData,
      iv: iv
    }
    api.getUserInfo(param, res => {
      if (res && res.data.errorCode == 0) {
        // gbData.cardNo = res.data.cardNo || ''
        let cardNo = res.data.body && res.data.body.cardNo || ''
        gbData.phoneNo = res.data.body && res.data.body.mobile || ''
        wx.setStorageSync('cardNo', cardNo)
      }
    })
  }
})