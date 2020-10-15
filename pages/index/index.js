//index.js
import api from '../../common/api/index.js'
const app = getApp()
const gbData = app.globalData
Page({
  data: {
    showAuth: true,
    nickName: '',
    greetings: '早安',
    count: 0,
    formIdString: '',
    showReg: false,
    innnerWidth: wx.getSystemInfoSync().windowWidth
  },

  onLoad: function () {
    app.getLocation()
    this.getSetting()
  },

  onShow: function () {
    this.setGreetings()
    let nickName = gbData.nickName
    if (nickName) {
      this.setData({
        nickName: nickName
      });
    }
    if (!wx.getStorageSync('cardNo')){
      this.getSetting()
    }
  },

  /**
   * 问候语
   */
  setGreetings () {
    let hours = new Date().getHours()
    let mins = new Date().getMinutes()

    if (this.time_range('0:00','10:30')) {
      this.setData({
        greetings: '早安'
      })
    } else if (this.time_range('10:31', '14:00')) {
      this.setData({
        greetings: '午安'
      })
    } else if (this.time_range('14:01', '17:00')){
      this.setData({
        greetings: '下午好'
      })
    } else if (this.time_range('17:01', '23:59')) {
      this.setData({
        greetings: '晚安'
      })
    }
  },
  
  startOrder(e) {
    let type = e.target.dataset.type
    getApp().globalData.orderType = type * 1
    app.backToPage('pages/store/store', {type: type})
  },
  // 去个人中心
  jumpToMine() {
    wx.navigateTo({
      url: '/pages/me/me'
    })
  },
  //判断时间段
  time_range (beginTime, endTime) {
    let strb = beginTime.split(":")
    
    if (strb.length != 2) {
      return false;
    }

    let stre = endTime.split(":")
    if (stre.length != 2) {
      return false;
    }

    let b = new Date()
    let e = new Date()
    let n = new Date()

    b.setHours(strb[0])
    b.setMinutes(strb[1])
    e.setHours(stre[0])
    e.setMinutes(stre[1])

    if (n.getTime() - b.getTime() >= 0 && n.getTime() - e.getTime() <= 0) {
      return true
    } else {
      return false
    }
  },
  /**
   * 获取用户对小程序的授权状态
   */
  getSetting () {
    let _this = this
    wx.getSetting({
      success(res) {
        if (res && res.authSetting && res.authSetting['scope.userInfo']) {
          // 已有授权, 不展示授权请求蒙层
          gbData.showAuth = false
          _this.setData({
            showAuth: false
          })
          _this.wxLogin( code => {
            _this.getUInfo(code)
          })
        }
      },
      fail(res) {
        // 没有就默认蒙层  手动触发获取用户
      }
    })
  },

  /**
   * 微信官方  获取userInfo
   */
  getUInfo (code) {
    let _this = this
    // _this.mineUserInfo(code, null, null)
    wx.getUserInfo({
      success(res) {
        gbData.nickName = res && res.userInfo.nickName
        gbData.gender = res && res.userInfo.gender
        _this.setData({
          nickName: gbData.nickName
        })
        _this.mineUserInfo(code, res.encryptedData, res.iv)
      },
      fail(res) {
        console.log(res, 'getUserInfo  fail')
      }
    })
  },

  /**
   * 请求用户授权接口回调，可获取用户名，用户头像等
   * getUserInfo
   */
  domUserInfo (e) {
    let data = e && e.detail || {}
    let _this = this
    if (data && data.encryptedData) { // 获取用户成功
      gbData.nickName = data && data.userInfo.nickName
      gbData.gender = data && data.userInfo.gender
      gbData.showAuth = false
      _this.setData({
        showAuth: false,
        showAlert1: false,
        nickName: gbData.nickName
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
  wxLogin (cb) {
    wx.login({
      success(res) {
        if (res.code) {
          cb && cb (res.code)
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
        let cardNo = res.data.body && res.data.body.cardNo || ''
        gbData.phoneNo = res.data.body && res.data.body.mobile || ''
        console.log('cardNo:' + cardNo);
        wx.setStorageSync('cardNo', cardNo)
      }
    })
  },

  formSubmit: function (e) {
    let _this = this

    let showAuth = _this.data.showAuth
    this.data.formIdString = e.detail.formId + "," + this.data.formIdString
    const type = 2
    getApp().globalData.formIdString = this.data.formIdString
    getApp().globalData.orderType = type * 1
    console.log(this.data.formIdString)
    app.backToPage('pages/store/store', { type: type })
    // 注册会员
    // if (wx.getStorageSync('cardNo')){
    //   app.backToPage('pages/store/store', { type: type })
    // }else{
    //   _this.setData({
    //     showReg: true
    //   })
    // }
  },

  cancel: function (e) {
    this.setData({
      showReg: false
    })
  },

  register: function (e) {
    let param = e.target.dataset.param
    wx.navigateToMiniProgram({
      appId: 'wx061e4b9f73885f51',
      path: 'pages/index/index?page=' + param,
      envVersion: 'release', //develop开发版  trial体验版  release正式版
      // appId: 'wxe5ebd0a4885e8a88',
      // path: 'pages/index/index?page=' + param,
      // envVersion: 'release', //develop开发版  trial体验版  release正式版
      success(res) {
        // 打开成功
      },
      fail(res) {
        // 跳转失败
      }
    })
  },
})
