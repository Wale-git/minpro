// pages/store/store.js
import api from '../../common/api/index.js'
let app = getApp()
let gbData = app.globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showChoose: false,
    keyword: '',
    storeList: [],
    storecode: '',
    showStoreList: true,
    loadFlag: false,
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    gbData.chosenCity = ''
    let ac = wx.getStorageSync('ALL_CITIES') || []
    _this.setData({
      allcities: ac
    })
    if (gbData.gspCity) {
      _this.setData({
        cityName: app.globalData.gspCity.cityName,
        gspCity: app.globalData.gspCity,
        longitude: app.globalData.longitude,
        latitude: app.globalData.latitude
      })
      _this.searchAllStoresByCityCode()
    } else {
      if(!gbData.longitude){
        _this.getCurrentCity()
      }
      _this.getGprs(true)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this;
    console.log('store-openid:' + wx.getStorageSync('openId'))
    let openId = wx.getStorageSync('openId')
    if (!openId){
      gbData.showAuth = true
    }else{
      gbData.showAuth = false
    }
    var chosenCity = gbData.chosenCity;
    if (gbData.chosenCity) {
      this.setData({
        cityName: chosenCity.cityname
      })
    }
    if (this.data.loadFlag && !this.data.keyword){//关闭小程序，重新定位
      console.log('onShow-->store')
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude - 0.001776;
          var longitude = res.longitude + 0.004685;
          var trueLoc = {};
          if (typeof wgs !== 'undefined' && typeof wgs.transformFromWGSToGCJ === 'function') {
            //坐标转换
            trueLoc = wgs.transformFromWGSToGCJ(longitude, latitude);
          }
          gbData.latitude = trueLoc.lat || latitude;
          gbData.longitude = trueLoc.lng || longitude;
          wx.setStorage({
            key: 'location',
            data: {
              time: Date.now(),
              latitude: gbData.latitude,
              longitude: gbData.longitude
            }
          })
          _this.searchAllStoresByCityCode()
        },
        fail: function (res) {
        }
      });    
    }
    this.setData({ loadFlag: true })
  },
  chooseCity(e) {
    let allCities = this.data.allcities
    gbData.chosenCity = {
      citycode: allCities[e.detail.value].citycode,
      cityname: allCities[e.detail.value].name
    }
    this.setData({
      cityName: allCities[e.detail.value].name
    })
  },
  // 返回到首页
  returnHome() {
    getApp().backToPage('pages/index/index')
  },
  // 选择门店
  chooseStore(e) {
    let store = e.currentTarget.dataset.store
    gbData.chooseStore = store
    // gbData.startTime = store
    // 隐藏预约单功能
    // this.setData({
    //   showChoose: true,
    //   store: store
    // })
    this.validStore(store)
  },
  // 关闭门店选择
  closeChoose() {
    this.setData({showChoose: false})
  },

  /**
   * inputStr
   */
  inputStr(e) {
    this.setData({
      keyword: e.detail.value
    })
    this.getStoreByKey()
  },

  /**
  * 定位城市
  */
  getGprs(flag) {
    var _this = this
    if (!gbData.gspCity || flag) {
      getApp().getLocation(function () {
        _this.setData({
          longitude: gbData.longitude,
          latitude: gbData.latitude
        })
        _this.getCurrentCity()
      })
    } else {
      this.setData({
        longitude: gbData.longitude,
        latitude: gbData.latitude
      });
    }
  },
  /**
  * 定位
  */
  getCurrentCity() {
    var _this = this
    var allCities = wx.getStorageSync('ALL_CITIES')
    getApp().getGpsCity(allCities, function () {
      let ac = wx.getStorageSync('ALL_CITIES') || []
      _this.setData({
        cityName: app.globalData.gspCity.cityName,
        allcities: ac
      })
      _this.searchAllStoresByCityCode()
    })
  },

  /**
   * 获取所有餐厅
   */
  searchAllStoresByCityCode() {
    let param = {
      cityCode: (gbData.chosenCity && gbData.chosenCity.citycode) ? gbData.chosenCity.citycode : gbData.gspCity.cityCode,
      formQQ: true, 
      keyword: this.data.keyword, 
      mylat: gbData.latitude || '', 
      mylng: gbData.longitude || ''
    }
    let _this = this
    getApp().showLoading()
    api.searchAllStoresByCityCode(param, res => {
      let stores = res.data.stores
      if (stores && stores.length > 0) {
        console.log('searchAllStoresByCityCode:' + JSON.stringify(param))
        this.setData({
          storeList: stores,
          showStoreList: true
        })
        wx.setStorageSync('allStores', stores)
      } else {
        _this.getOrderedStoreList()
      }
      getApp().hideLoading()
    })
  },

  /**
   * validStore
   */
  validStore(store) {
    let param = {
      newAddress: 'false',
      storecode: store.storecode,
      mylat: gbData.latitude || '',
      mylng: gbData.longitude || ''
    }
    let _this = this
    api.validStore(param, res => {
      let data = res.data
      if (data.errorCode == 0) {
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
          getApp().backToPage('pages/menu/menu', { storecode: store.storecode })
        }
      } else if (data.errorCode == 12013) {
        let starttime = store.starttime;
        let endtime = store.endtime;
        getApp().toast("该餐厅的营业时间为" + starttime + "-" + endtime)
      } else if (data.errorCode == 12015) {//12015 餐厅未营业   12016 餐厅繁忙中
        getApp().toast("餐厅未营业")
      } else if (data.errorCode == 12016) {
        getApp().toast("餐厅繁忙中")
      } else {
        getApp().toast(res.errorMsg || '该餐厅尚未营业')
      }
    })
  },

  /**
   * 获取历史点餐餐厅
   * 
   */
  getOrderedStoreList () {
    let param = {
      fromQQ: true,
      mylat: gbData.latitude || '',
      mylng: gbData.longitude || ''
    }
    getApp().showLoading()
    api.getOrderedStoreList(param, res => {
      let stores = res.data.stores
      console.log('getOrderedStoreList:' + stores)
      if (stores && stores.length > 0) {
        this.setData({
          storeList: stores,
          showStoreList: true
        })
      } else {
        this.setData({
          storeList: [],
          showStoreList: false
        })
      }
      getApp().hideLoading()
    })
  },

  /**
   * 通过关键字获取餐厅
   */
  getStoreByKey() {
    let param = {
      cityCode: (gbData.chosenCity && gbData.chosenCity.citycode) ? gbData.chosenCity.citycode : gbData.gspCity.cityCode,
      formQQ: true,
      keyword: this.data.keyword,
      mylat: gbData.latitude || '',
      mylng: gbData.longitude || ''
    }
    getApp().showLoading()
    api.searchAllStoresByCityCodeAndKeyword(param, res => {
      let stores = res.data.stores
      if (stores && stores.length > 0) {
        this.setData({
          storeList: stores,
          showStoreList: true
        })
        wx.setStorageSync('allStores', stores)
      } else {
        this.setData({
          storeList: [],
          showStoreList: false
        })
        wx.setStorageSync('allStores', [])
      }
      getApp().hideLoading()
    })
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
  },
})