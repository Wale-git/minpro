// pages/menu/menu.js
import menuHelp from '../../common/utils/menu-help.js'
import { saveFormIds } from '../../common/api/index.js'
import api from '../../common/api/index.js'

let app = getApp()
let gbData = app.globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuData: {},
    dishId: 0,
    classifyId: 'target-0',
    topList: [],
    showSingle: false,
    showCombo: false,
    showMultiple: false,
    showShoppingcart: false,
    singleDish: {},
    combo: {},
    multiple: {},
    cartTotal: 0,
    position: null,
    storeName: '',
    calcHeight: 66,
    showSwiper: true,
    showBanner: true,
    hasCreat: false,
    showBlack: false,
    autoplay: true,
    isUseCoupon: false,
    showReg: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options && options.storecode) {
      gbData.storecod = options.storecode
      this.initData(options.storecode)
    }else{
      wx.showModal({
        content: "未查找到门店，请稍后重试！",
        showCancel: false,
        confirmText: "确定"
      })
    }
    console.log('menu-openid:' + wx.getStorageSync('openId'))
    let openId = wx.getStorageSync('openId')
    if (!openId){
      getApp().alert1({
        title: '微信授权',
        text: 'Tims点餐需要获取您的用户信息，请点击确定允许微信授权。',
        alertButton: '确定',
        callback: () => {
          return
        }
      })
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (gbData.clearCart) {
      gbData.clearCart =false
      this.getCartTotal()
      this.closeShoppingcart()
      this.setData({
        cartData: {},
      })
      if (this.data.hasCreat) {
        this.data.hasCreat = false
      } else {
        this.initData(gbData.storecod)
      }
    }
    if (gbData.freshCart) {
      gbData.freshCart = false
      this.setData({
        cartData: gbData.order || []
      })
    }
  },

  /**
   * 获取菜单数据
   */
  initData(storecode) {
    this.data.hasCreat = true
    let param = { 
      orderType: gbData.orderType || 2, // 2 外带 ， 3 堂食
      storeCode: storecode,
      st: gbData.preTimestamp || '',
      nickName: gbData.nickName,
      // cardNo: wx.getStorageSync('cardNo') || '300100000000001966',
      cardNo: wx.getStorageSync('cardNo') || '',
      portalSource: 2 // 1h5   2 小程序
    }
    getApp().showLoading()
    menuHelp.getMenu(param, data => {
      let bannerList = gbData.bannerList
      let showSwiper = false
      bannerList.forEach(item => {
        if (item.bannerType == 1) {
          showSwiper = true
        }
      })
      this.setData({
        menuData: data,
        storeName: gbData.store.storename,
        bannerList: bannerList,
        showBanner: showSwiper,
        calcHeight: showSwiper ? this.data.calcHeight : 90
      })
      getApp().hideLoading()
      this.calcTopList()
    })
  },

  /**
   * 初始化右侧高度List
   */
  calcTopList () {
    const query = wx.createSelectorQuery().in(this)
    query.selectAll('.section').boundingClientRect(rect => {
      if (rect && rect.length > 0) {
        let topList = []
        let top = 0
        rect.forEach((item,i) => {
          topList.push({
            id: 'target-' + i,
            top: top
          })
          top += item.height
        })
        this.data.topList = topList
      }
    }).exec()
  },

  /**
   * 分类跳转
   */
  classifyEvent (e) {
    let index = e.currentTarget.dataset.index
    let showSwiper = true
    let calcHeight = 66
    if (index > 0) {
      showSwiper = false
      calcHeight = 90
    }
    this.setData({
      dishId: index,
      classifyId: 'target-' + index,
      showSwiper: showSwiper,
      calcHeight: this.data.showBanner ? calcHeight : 90
    })
  },
  /**
   * 右侧分类滚动监听
   */
  scrollRight (e) {
    const scrollTop = e.detail.scrollTop
    let topList = this.data.topList
    let classifyId = 0
    for (let i = topList.length - 1; i > -1; i--) {
      if (scrollTop >= topList[i].top - 1) {
        classifyId = topList[i].id
        break
      }
    }
    let showSwiper = true
    let calcHeight = 66
    if (scrollTop > 66) {
      showSwiper = false
      calcHeight = 90
    }
    this.setData({
      classifyId: classifyId,
      showSwiper: showSwiper,
      calcHeight: this.data.showBanner ? calcHeight : 90
    })
  },

  /**
   * 加号事件
   */
  addItems (e) {
    let it = e.currentTarget.dataset.index
    let dish = e.currentTarget.dataset.dish
    let index = menuHelp.judgment(dish)

    console.log('menu-openid:' + wx.getStorageSync('openId'))
    let openId = wx.getStorageSync('openId')
    if (!openId){
      getApp().alert1({
        title: '微信授权',
        text: 'Tims点餐需要获取您的用户信息，请点击确定允许微信授权。',
        alertButton: '确定',
        callback: () => {
          return
        }
      })
    } else {
      let cardNo = wx.getStorageSync('cardNo');
      if(!cardNo && this.data.showReg){
        getApp().alert2({
          text: '免费注册成为Tims会员，会员专享折扣，“枫叶”商城更多好礼等待着您~ ',
          buttonName: '一键注册',
          callback: () => {
          },
          cancelCloseEvent: () => {
            this.setData({
              showReg : false
            })
          }
        });
      }else{
        if (index == 2) { // 多规格
          this.setData({
            showMultiple: true,
            multiple: dish
          }, () => {
            this.black(this.data.showMultiple)
          })
        } else if (index == 1) { // 套餐
          this.setData({
            showCombo: true,
            combo: dish
          }, () => {
            this.black(this.data.showCombo)
          })
        } else {// 单品
          menuHelp.singleToCart(dish, res => {
            let singleFoods = gbData.sc.localDishs.singleFoods
            let orderItem = gbData.order.items
            let cc = 0
            if (orderItem) {
              orderItem.forEach(item => {
                if (dish.systemId === item.systemId) {
                  cc = item.quantity
                }
              })
            }
            singleFoods.forEach(item => {
              if (dish.systemId === item.systemId) {
                if (item.quantity > item.maxQty || (cc + item.quantity) > item.maxQty) {
                  getApp().alert({
                    noTitle: true,
                    text: '购物车中最多只能添加' + item.maxQty + '个相同产品哦~',
                    alertButton: '确认',
                    callback: () => {
                      item.quantity --
                      return
                    }
                  })
                } else {
                  this.getCartTotal()
                  this.addBean(e)
                }
              } 
            })
          })
        }
      }
      
    }
  },

  imgEvt(e) {
    gbData.choosedComboMul = []
    let dish = e.currentTarget.dataset.dish
    let index = menuHelp.judgment(dish)
    if (index == 2) { // 多规格
      this.setData({
        showMultiple: true,
        multiple: dish
      }, () => {
        this.black(this.data.showMultiple)
      })
    } else if (index == 1) { // 套餐
      this.setData({
        showCombo: true,
        combo: dish
      }, () => {
        this.black(this.data.showCombo)
      })
    } else {// 单品
      this.setData({
        singleDish: dish,
        showSingle: true
      }, () => {
        this.black(this.data.showSingle)
      })
    }
  },

  /**
   * 关闭单品
   */
  closeSingle () {
    this.setData({
      showSingle: false
    }, () => {
      this.black(this.data.showSingle)
    })
    this.getCartTotal()
  },

  /**
   * 关闭套餐弹屏
   */
  closeCombo () {
    this.setData({
      showCombo: false
    }, () => {
      this.black(this.data.showCombo)
    })
    this.getCartTotal()
  },

  /**
   * 关闭多规格
   */
  closeMultiple () {
    this.setData({
      showMultiple: false
    }, () => {
      this.black(this.data.showMultiple)
    })
    this.getCartTotal()
  },

  /**
   * 关闭购物车
   */
  closeShoppingcart () {
    this.setData({
      showShoppingcart: false
    }, () => {
      this.black(this.data.showShoppingcart)
    })
    this.getCartTotal()
  },

  /**
   * 
   */
  black (flag) {
    if (!flag) {
      this.setData({
        showBlack: false
      })
    } else {
      setTimeout(() => {
        this.setData({
          showBlack: true
        })
      }, 1000)
    }
  },

  /**
   * 购物车点击事件
   */
  shoppingcartEve (e) {
    let param = {
      orderId: gbData.orderId,
      formId: e.detail.formId
    }
    console.log(e.detail.formId, 'formId-confirm')
    saveFormIds(param, () => {
      let singleFoods = gbData.sc.localDishs.singleFoods
      if (singleFoods && singleFoods.length > 0) {// 提交单品
        menuHelp.confirmDishs(singleFoods, '',  res => {
          menuHelp.emptySingle()
          let cartTotalPrice = gbData.cartTotalPrice
          if (cartTotalPrice > 0){
            this.setData({
              showShoppingcart: true,
              cartData: gbData.order || []
            }, () => {
              this.black(this.data.showShoppingcart)
            })
          }
        })
      } else {
        this.setData({
          showShoppingcart: true,
          cartData: gbData.order || []
        }, () => {
          this.black(this.data.showShoppingcart)
        })
      }
    })
  },

  /**
   * 获取购物车总金额
   */
  getCartTotal() {
    let money = 0
    let dishs = gbData.sc && gbData.sc.localDishs && gbData.sc.localDishs.singleFoods || []
    let isUseCoupon = false
    dishs.forEach( item => {
      money += item.price * item.quantity
      if (item.promotionType == '1'){
        isUseCoupon = true
      }
    })
    let cartMoney = gbData.cartTotalPrice || 0
    this.setData({
      cartTotal: money + cartMoney,
      isUseCoupon: isUseCoupon
    })
  },

  /**
   * goMycenter
   */
  goMycenter () {
    app.backToPage('pages/me/me')
  },

  /**
   * 切换店
   */
  changeStore () {
    app.confirm({
      noTitle: true,
      text: '如果重选餐厅，将会清空购物车',
      text2: '是否继续?',
      confirm: () => {
        let param = {
          orderType: 3,
          storeCode: ''
        }
        menuHelp.emptyCart(() => {
          app.backToPage('pages/store/store')
        })
      }
    }) 
  },

  /**
   * 撒红豆豆
   */
  addBean(e) {
    this.setData({ position: e.touches[0] })
  },

  /**
   * showMul  套餐添加多规格
   */
  showMul () {
    this.setData({
      showMultiple: true,
      multiple: gbData.multiple
    }, () => {
      this.black(this.data.showMultiple)
    })
  },

  /**
   * 套餐里选好多规格产品
   */
  showMulCombo () {
    let combo = gbData.choosedCombo
    combo.comboMul = gbData.comboMul || {}
    this.setData({
      // showCombo: true,
      showMultiple: false,
      combo: combo
    }, () => {
      this.black(this.data.showMultiple)
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
  domPhone(e) {
    let data = e && e.detail || {}
    let _this = this
    if (data && data.encryptedData) { // 获取手机号
      _this.setData({
        showAlert2: false
      })
      _this.wxLogin(code => {
        _this.minePhone(code, data.encryptedData, data.iv)
      })
    } else { // 拒绝获取  
      console.log(JSON.stringify(data), 'domminePhone fail')
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
        this.initData(gbData.storecod)
      }
    })
  },

   /**
   * 后台服务的用户数据
   */
  minePhone(code, encryptedData, iv) {
    let _this = this
    let param = {
      code: code,
      encryptedData: encryptedData,
      iv: iv
    }
    api.getUserInfo(param, res => {
      if (res && res.data.errorCode == 0) {
        let opts = res.data.body && res.data.body.weChatAppInfo || {}
        gbData.phoneNo = JSON.parse(opts).phoneNumber
        // 一键注册
        let params = {
          name: gbData.nickName,
          gender: gbData.gender,
          mobile: gbData.phoneNo,
          appType: 1 //1 微信  2支付宝
        }
        api.registerWithCardType(params, res => {
          _this.setData({showReg : false})
          if(res.data.respCode == '0'){
            gbData.cardNo = res.data.ticket || ''
            wx.setStorageSync('cardNo', gbData.cardNo)
            getApp().toast("您已经是tims会员，立即点餐可以享受会员权益哦～");
            this.initData(gbData.storecod)
          } else{
            getApp().toast(res.data.errorMsg);
          }
        })
      }
    })
  },
})