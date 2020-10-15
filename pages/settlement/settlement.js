import api from '../../common/api/index.js'
import menuHelp from '../../common/utils/menu-help.js'
let gbData = getApp().globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showOrderDetail: false,
    showPromotion: true,
    showCoupon: true,
    showCashCoupon: false,
    showRecommend: false,
    showDelivery: true,
    showDeliveryFlg: false,
    addDelivery: true,
    showWs: false,
    cartTotalPrice: 0,
    showRpv: false,
    showRpvList: [], // 推荐商品
    deliveryInfo:{},
    isActive: 2,
    showMore: false,
    showHb: true,
    showHbTip: false,
    hbFlag: 0,
    num: 0,
    cashCouponList: [], //代金券列表
    commCouponList: [], //普通优惠券列表
    isSelfDelivery: false,
    autoplay: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.save()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      bannerList: gbData.bannerList || []
    })
    this._wxPaySuccess()
  },

  onUnload: function () {
    this.wxPaySuccessInterval && clearInterval(this.wxPaySuccessInterval)
  },

  // 点击右上角“X”
  cancel() {
    getApp().backToPage("pages/menu/menu")
  },
  // 隐藏环保提示
  cancelTip() {
    this.setData({
      showHbTip: false
    })
  },
  // 订单列表，展开收起
  switchOrderDetail() {
    let showMore = false
    if (this.data.showOrderDetail && this.data.num > 3){
      showMore = true
    }
    this.setData({
      showOrderDetail: !this.data.showOrderDetail,
      showMore: showMore
    })
  },
  // 切换订单类型
  switchOrderType(e) {
    gbData.order.orderType = e.currentTarget.dataset.type
    let showWs = false
    if (gbData.order.orderType === 1){
      showWs = true
    }
    this.setData({
      showWs: showWs,
      isActive: e.currentTarget.dataset.type
    })
  },
  // 选择环保需不需要
  hbSelect(e) { //9026 需要   9027 不需要
    let flg = 0;
    if (this.data.hbFlag === 9027){
      flg = 9026
    }else{
      flg = 9027
      this.setData({
        showHbTip: false
      })
    }
    this.setData({
      hbFlag: flg
    })
  },
  // 点击“本单可享受的优惠”，展开收起优惠项
  clickPromotion() {
    this.setData({
      showPromotion: !this.data.showPromotion
    })
  },
  // 点击“可用优惠券”，展开收起优惠券项
  clickCoupon() {
    this.setData({
      showCoupon: !this.data.showCoupon
    })
  },
  // 点击“可用代金券”，展开收起优惠券项
  clickCashCoupon() {
    this.setData({
      showCashCoupon: !this.data.showCashCoupon
    })
  },
  // 监听“推荐商品”关闭
  recommendClose() {
    this.setData({
      showRecommend: false
    })
    gbData.freshCart = true
    this.initData()
  },
  // 点击“外送信息”，展开收起
  clickDelivery() {
    this.setData({
      showDelivery: !this.data.showDelivery
    })
  },
  // 监听“外送信息”关闭
  deliveryClose() {
    let deliveryInfo = gbData.deliveryInfo
    let addDelivery = true
    if (deliveryInfo.userName) {
      addDelivery = false
    }
    this.setData({
      showDeliveryFlg: false,
      addDelivery: addDelivery,
      deliveryInfo: deliveryInfo
    })
  },
  addDelivery() {
    this.setData({
      showDeliveryFlg: true
    })
  },
  editDelivery(){
    this.setData({
      showDeliveryFlg: true
    })
  },
  // 支付
  pay() {
    if (this.data.hbFlag === 0 || this.data.hbFlag === 9026){
      this.setData({
        showHbTip: true
      })
      return
    }
    this.getPaymentUrl()
  },

  /**
   * 初始化数据
   */
  initData() {
    let num = 0
    let cartList = gbData.order.items || []
    let promtions = []
    let pros = []
    cartList.forEach(item => {
      if (item.propertyShowAbbr) {
        let propertyShowAbbr = []
        if (Array.isArray(item.propertyShowAbbr)) {
          propertyShowAbbr = item.propertyShowAbbr
        } else {
          propertyShowAbbr = item.propertyShowAbbr.split(',')
        }
        item.propertyShowAbbr = propertyShowAbbr
      }

      if (item.promotionType == 0) ++num

      if (item.promotionType == 2 && !item.couponCode) {
        promtions.push(item)
      }
    })

    //循环遍历promtions的个数，展示
    promtions.forEach(item => {
      if (item.quantity >= 1) {
        for (let i = 0; i < item.quantity; i++) {
          pros.push(item)
        }
      }
    }) 

    this.setData({
      cartList: cartList,
      promtions: pros,
      showPromotion: pros.length > 0,
      isActive: gbData.order && gbData.order.orderType ? gbData.order.orderType : 3,
      cartTotalPrice: gbData.cartTotalPrice,
      showMore: num > 3,
      num: num,
      hbFlag: gbData.order.hbFlag ? gbData.order.hbFlag : 0,
    })
  },

  /**
   * 保存订单
   */
  save() {
    let param = {
      status: 1,
      deviceId: gbData.openId || ''
    }
    let _this = this
    getApp().showLoading()
    api.save(param, res => {
      _this.initData()
      let { errorCode, errorMsg, rpvList, icouponResult} = res.data
      if (errorCode == 0) {
        let showRpvList = []
        if (rpvList && rpvList.length > 0) {
          rpvList.forEach(rpv => {
            rpv.isdefault = false
            showRpvList.push(rpv)
          })
          _this.setData({
            showRpvList: showRpvList,
            showRecommend: true,
          })
        }
        let store = gbData.store || []
        let isSelfDelivery = false
        if (store && store.isSelfDelivery === '1'){
          isSelfDelivery = true
        }
        
        let couponList = icouponResult && icouponResult.list || []
        let cashCouponList = icouponResult && icouponResult.cashCouponList || []
        if (icouponResult) {
          if (couponList && couponList.length > 0) {
            gbData.commCouponList = couponList
          }
          if (cashCouponList && cashCouponList.length > 0) {
            gbData.cashCouponList = cashCouponList
          }
          _this.setData({
            isSelfDelivery: isSelfDelivery,
            cashCouponList: cashCouponList,
            commCouponList: couponList,
            showCoupon: couponList.length > 0
          })
        }else{
          _this.setData({
            isSelfDelivery: isSelfDelivery,
            cashCouponList: [],
            commCouponList: [],
            showCoupon: false
          })
        }
      }
      getApp().hideLoading()
    })
  },

  /**
   * 获取使用券参数
   */
  getCouponParam () {
    let param = {}
    let myCouponList = this.data.couponList
    if (myCouponList && myCouponList.length > 0) {
      myCouponList.forEach(coupon => {
        if (coupon.isUsed) {
          param = {
            typeNo: coupon.typeNo,
            code: coupon.couponNo,
            isCoupon: 1 // 优惠券使用标识
          }
        }
      })
    } else {
      param = {}
    }
    return param
  },

  _wxPaySuccess() {
    if (this.wxPaySuccessCallback) {
      this.wxPaySuccessInterval = setInterval(() => {
        this.wxPaySuccessCallback()
      }, 50)
    }
  },

  /**
   * 支付
   */
  getPaymentUrl () {
    let _this = this
    if (gbData.templateIds.length > 0){
      try {
        wx.requestSubscribeMessage({
          tmplIds: gbData.templateIds,
          complete(res) {
            _this.getPayUrl()
          },
        })
      } catch (error) {
        _this.getPayUrl()
      }
    } else {
      _this.getPayUrl()
    }
    
  },
  getPayUrl(){
    let _this = this
    let param = {
      invoiceTitle: '',
      phone: '',
      iremark: '',
      needInvoice: false,
      memberPoint: '',
      contactPerson: '',
      orderType: this.data.isActive,
      payType: 4,
      deviceId: gbData.openId || '',
    }
    getApp().showLoading()
    api.getPaymentUrl(param, response => {
      let errorCode = response.data.errorCode
      let errorMsg = response.data.errorMsg
      if (errorCode === 0) {
        if (gbData.cartTotalPrice == 0) {
          getApp().hideLoading()
          getApp().backToPage('pages/finish/finish')
        } else {
          let data = response.data
          let payUrl = data.payUrl.replace(/↵/g, '')
          let reStr = JSON.parse(payUrl)
          let paySign = reStr.sign
          let signType = reStr.signType
          let timeStamp = ''
          let nonceStr = ''
          let packagev = ''

          let store = gbData.store || []
          if (store && store.enclosing){//判断第三方支付
            timeStamp = reStr.timestamp
            nonceStr = reStr.nonce_str
            packagev = reStr.package
          } else {
            timeStamp = reStr.timeStamp
            nonceStr = reStr.nonceStr
            packagev = reStr.packageStr
          }
          // getApp().backToPage('pages/finish/finish')
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonceStr,
            package: packagev,
            signType: signType,
            paySign: paySign,
            success: res => {
              this.wxPaySuccessCallback = () => {
                getApp().hideLoading()
                wx.reLaunch({
                  url: '/pages/finish/finish',
                })
              }
            },
            fail: res => {
              getApp().hideLoading()
            }
          })
        }
      } else {
        getApp().hideLoading()
        getApp().toast(errorMsg)
      }
    })

  },
  /**
   * 选中卡券
   */
  useCoupon (e) {
    let item = e.currentTarget.dataset.coupon
    let type = e.currentTarget.dataset.type
    // let index = e.currentTarget.dataset.index
    let unUseFlg = true
    let myCouponList = this.data.commCouponList
    let cashCouponList = this.data.cashCouponList
    myCouponList && myCouponList.forEach((coupon, idx) => {
      if (item.couponNo == coupon.couponNo && type == "comm") {
        if (coupon.isUsed){
          unUseFlg = false
        }
      }
    })
    cashCouponList && cashCouponList.forEach((coupon, idx) => {
      if (item.couponNo == coupon.couponNo && type == "cash") {
        if (coupon.isUsed) {
          unUseFlg = false
        }
      }
    })

    let params = {
      typeNo: item.typeNo,
      code: item.couponNo,
      goodsId: item.goodsId,
      isCoupon: 1 // 优惠券使用标识 
    }
    getApp().showLoading()
    if(unUseFlg) {
      api.usePromotion(params, res => {
        const { errorCode, errorMsg } = res.data
        getApp().hideLoading()
        if (errorCode == 0) {
          gbData.order = res.data.order || []
          gbData.order.orderType = this.data.isActive
          gbData.cartTotalPrice = res.data.order && res.data.order.total || []
          this.initData()
          gbData.freshCart = true
          this.useCouponSetVal(item, true, type)
          getApp().toast('优惠券使用成功')
        } else {
          this.useCouponSetVal(item, false, type)
          getApp().toast(errorMsg)
        }
      })
    } else {
      let dish = []
      gbData.order.items.forEach(orderItem => {
        if (orderItem.typeNo == item.couponNo) {
          orderItem.quantity = -1
          dish.push(orderItem)
        }
      })
      menuHelp.confirmDishs(dish, false, res => {
        getApp().hideLoading()
        if (res.data.errorCode == 0) {
          gbData.order = res.data.order || []
          gbData.order.orderType = this.data.isActive
          gbData.cartTotalPrice = res.data.order && res.data.order.total || []
          this.initData()
          gbData.freshCart = true
          this.useCouponSetVal(item, false, type)
          getApp().toast('优惠券已取消使用')
        } else {
          this.useCouponSetVal(item, false, type)
          getApp().toast(res.data.errorMsg)
        }
      })
    }   
  },
  useCouponSetVal(item, flg, type){
    let myCouponList = this.data.commCouponList
    let cashCouponList = this.data.cashCouponList
    myCouponList && myCouponList.forEach((coupon, idx) => {
      if (item.couponNo == coupon.couponNo && type == "comm") {
        if (flg) {
          coupon.isUsed = "1"
        } else {
          coupon.isUsed = null
        }
      } else if (type == "comm") {
        coupon.isUsed = null
      }
    })

    cashCouponList && cashCouponList.forEach((coupon, idx) => {
      if (item.couponNo == coupon.couponNo && type == "cash") {
        if (flg) {
          coupon.isUsed = "1"
        } else {
          coupon.isUsed = null
        }
      }
    })

    this.setData({
      commCouponList: myCouponList,
      cashCouponList: cashCouponList
    })
    gbData.commCouponList = myCouponList
    gbData.cashCouponList = cashCouponList
  }
})