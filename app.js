const mtjwxsdk = require('./common/utils/mtj-wx-sdk.js');
import indexApi from './common/api/index.js'

//app.js
App({
  onLaunch: function () {
    // this.getSystemInfoSync()
    // this.getLocation()
  },

  onShow: function (options) {
 
  },

  globalData: {
    originalMenuVo: [], // 原始菜单数据
    choosedComboMul: [],
    sc: { //购物车数据
      localDishs: { // 缓存本地未交互购物车数据
        singleFoods: [], // 单品
        condiments: [], // 套餐
      }
    },
    order: {}, // 订单
    latitude: null,  // 维度
    longitude: null,  // 经度
    cityInfo: {},   // 当前定位城市信息
    store: {}, // 当前餐厅,
    cartTotalPrice: 0,
    orderType: 2, // 2 外带   3.堂食
    preTimestamp: '', // 预约点餐时间戳
    showAuth: true,
    deliveryInfo: {}, //外送信息
    templateIds: [] //消息模板id列表
  },

  /**
   * 后退到某个页面
   * @pageRouter 页面路由
   * @extraData 目标路由额外参数，直接赋值到目标Page的data属性中
   */
  backToPage: function (pageRouter, extraData) {
    let pages = getCurrentPages()
    let existFlag = false
    for (let i = 0; i < pages.length; i++) {
      let page = pages[i]
      if (pageRouter) {
        if (page.route === pageRouter) {
          existFlag = true
          if (extraData) {
            page.setData(extraData)
          }
          wx.navigateBack({
            delta: pages.length - i - 1
          })
          break
        }
      }
    }
    if (!existFlag) {
      let str = ''
      if (extraData) {
        let key = Object.keys(extraData)
        let values = extraData[key[0]]
        str = `?${key[0]}=${values}`
      }
      if (pageRouter === 'pages/index/index') {
        wx.reLaunch({
          url: `/pages/index/index${str}`,
        })
      } else {
        wx.navigateTo({
          url: `/${pageRouter}${str}`,
        })
      }
    }
  },

  /**
   * 获取像素
   */
  getSystemInfoSync () {
    const { windowWidth } = wx.getSystemInfoSync()
    this.globalData.scale = 750 / windowWidth
  },

  /**
   * 获取当前页面
   */
  getCurPage() {
    let pages = getCurrentPages()
    return pages[pages.length - 1]
  },

  /**
   * 显示Loading
   */
  showLoading() {
    let curPage = this.getCurPage();
    curPage && curPage.setData({
      loadingVisiable: true
    })
  },
  
  /**
   * 隐藏Loading
   */
  hideLoading() {
    let curPage = this.getCurPage();
    curPage && curPage.setData({
      loadingVisiable: false
    })
  },

  /**
   * 显示Toast通知
   * @param text 内容
   * @param timeout 超时时间（单位：毫秒，默认3000毫秒），过一段时间后关闭
   */
  toast(text, timeout) {
    timeout = timeout || 3000
    let curPage = this.getCurPage();
    curPage && curPage.setData({
      toastText: text || '未知异常',
      toastStartTag: true,
      toastEndTag: false
    })
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout)
    }
    this.toastTimeout = setTimeout(() => {
      curPage && curPage.setData({
        toastEndTag: true
      })
    }, timeout)
  },
  /**
   * 显示Alert提示框
   * @param text alert 内容
   * @param callback 回调
   * @param title alert标题，默认：友情提示
   * @param buttonName alert按钮，默认：确定
   * @param cancelCloseEvent 是否取消右上角x点击事件（格式：boolean）
   */
  alert(options) {
    let curPage = this.getCurPage();
    curPage && curPage.setData({
      showAlert: true,
      noTitle: options.noTitle || false,
      alertText: options.text || '系统异常，请稍后点餐',
      alertText2: options.text2 || '',
      alertTitle: options.title || '友情提醒',
      alertButton: options.buttonName || '确定'
    })
    if (curPage) {
      curPage.confirmAlert = function () {
        curPage.setData({
          showAlert: false
        }, () => {
          options.callback && options.callback()
        })
      }
      curPage.copyText = function (e) {
        wx.setClipboardData({
          data: e.currentTarget.dataset.text,
          success: function (res) {
            wx.getClipboardData({
              success: function (res) {
                wx.showToast({
                  title: '复制成功'
                })
              }
            })
          }
        })
      }
      curPage.closeAlert = function () {
        curPage.setData({
          showAlert: false
        }, () => {
          options.cancelCloseEvent && options.cancelCloseEvent()
        })
      }
    }
  },
  alert1(options) {
    let curPage = this.getCurPage();
    curPage && curPage.setData({
      showAlert1: true,
      noTitle: false,
      alertText: options.text || '系统异常，请稍后点餐',
      alertTitle: options.title || '友情提醒',
      alertButton: options.buttonName || '确定'
    })
    if (curPage) {
      curPage.confirmAlert = function () {
        curPage.setData({
          showAlert1: false
        }, () => {
          options.callback && options.callback()
        })
      }
      curPage.closeAlert = function () {
        curPage.setData({
          showAlert1: false
        }, () => {
          if (!options.cancelCloseEvent && options.callback) {
            options.callback()
          }
        })
      }
    }
  },
  alert2(options) {
    let curPage = this.getCurPage();
    curPage && curPage.setData({
      showAlert2: true,
      noTitle: options.noTitle || false,
      alertText: options.text || '系统异常，请稍后点餐',
      alertTitle: options.title || '友情提醒',
      alertButton: options.buttonName || '确定'
    })
    if (curPage) {
      curPage.closeAlert = function () {
        curPage.setData({
          showAlert2: false
        }, () => {
          options.cancelCloseEvent && options.cancelCloseEvent()
        })
      }
    }
  },
  /**
   * 显示confirm确认框
   * @param options confirm参数，格式：Object
   *        options.noTitle 显示标题 (默认：显示)
   *        options.text 内容
   *        options.title 标题（默认：提示）
   *        options.confirmName 确认按钮名称（默认：确定）
   *        options.cancelName 取消按钮名称（默认：取消）
   *        options.confirmRight 确认按钮是否放在右边，默认在左边（格式：boolean）
   *        options.confirm 确认回调（格式：function）
   *        options.cancel 取消回调（格式：function）
   */
  confirm(options) {
    let curPage = this.getCurPage();
    curPage && curPage.setData({
      showConfirm: true,
      noTitle: options.noTitle || false,
      confirmText: options.text || '系统异常，请稍后点餐',
      confirmText2: options.text2 || '',
      confirmTitle: options.title || '提示',
      confirmButton: options.confirmName || '确定',
      cancelButton: options.cancelName || '取消',
      changeConfirm: options.confirmRight || false
    })

    if (curPage) {
      curPage.closeConfirmCancel = function () {
        curPage.setData({
          showConfirm: false
        }, () => {
          options.cancel && options.cancel()
        })
      }
      curPage.closeConfirmOK = function () {
        curPage.setData({
          showConfirm: false
        }, () => {
          options.confirm && options.confirm()
        })
      }
    }
  },

  /**
   * 获取定位坐标
   */
  getLocation: function (cb, fcb, forceLoc, cache) {
    var _this = this;
    if (!forceLoc && _this.globalData.canceled) {
      fcb && fcb();
      return;
    }
    if (cache) {
      let location = wx.getStorageSync('location')
      let cacheTime = 1000 * 60 * 5
      if (location && Date.now() - location.time < cacheTime) {
        _this.globalData.latitude = location.latitude
        _this.globalData.longitude = location.longitude
        cb && cb();
        return
      }
    }

    var allCities = wx.getStorageSync('ALL_CITIES')
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude - 0.001776 ;
        var longitude = res.longitude + 0.004685;
        var trueLoc = {};
        if (typeof wgs !== 'undefined' && typeof wgs.transformFromWGSToGCJ === 'function') {
          //坐标转换
          trueLoc = wgs.transformFromWGSToGCJ(longitude, latitude);
        }
        _this.globalData.latitude = trueLoc.lat || latitude;
        _this.globalData.longitude = trueLoc.lng || longitude;
        _this.getGpsCity(allCities)
        wx.setStorage({
          key: 'location',
          data: {
            time: Date.now(),
            latitude: _this.globalData.latitude,
            longitude: _this.globalData.longitude
          }
        })
        cb && cb();
      },
      fail: function (res) {
        _this.getGpsCity(allCities)
        fcb && fcb();
      }
    });
  },
  /**
  * 获取gps定位城市
  */
  getGpsCity: function (hasallCities, cb, fcb) {
    var _this = this
    let param = {
      x: _this.globalData.longitude,
      y: _this.globalData.latitude,
      // x: 121.455708,
      // y: 31.249574,
      meters: 100,
      relocate: 'Y',
      hasallCities: hasallCities ? true : false
    }
    indexApi.gpscity(param, function (res) {
      if (res.data.errorCode =='0') {
        let cityInfos = res.data.cityInfo
        let currentCity = {}
        if (cityInfos){
          let cur = JSON.parse(cityInfos).data
          if (cur){
            currentCity = cur
            currentCity.cityName = currentCity.cityName + '市'
          }
        }
        //第一次所有城市和热门城市都有就存储起来，后续不再进行查询
        let allCities;
        if (res.data.allCities && res.data.allCities.length) {
          allCities = res.data.allCities
        } else {
          allCities = wx.getStorageSync('ALL_CITIES') || []
        }
        if (res.data.allCities && res.data.allCities.length) {
          wx.setStorage({
            key: 'ALL_CITIES',
            data: res.data.allCities,
          })
          _this.globalData.allCities = res.data.allCities
        }
        if (allCities.length > 0) {
          let isExist = false
          allCities.forEach((eachCity) => {
            if (currentCity && eachCity.name === currentCity.cityName) {
              isExist = true
              //城市名字相等
              currentCity.citycode = eachCity.citycode
              currentCity.cityName = eachCity.name
            }
          })
          if (!isExist){//如果当前定位城市不在城市列表中，则默认第一个
            currentCity.citycode = allCities[0].citycode
            currentCity.cityName = allCities[0].name
          }
        }
        _this.globalData.gspCity = {
          cityName: currentCity.cityName,
          cityCode: currentCity.citycode,
          pois: currentCity.pois
        }
        cb && cb();
      } else {
        fcb && fcb();
      }
    })
  },
})
