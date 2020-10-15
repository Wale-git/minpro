// pages/me/me.js
import api from '../../common/api/index.js'
import menuHelp from '../../common/utils/menu-help.js'
let app = getApp()
let gbData = app.globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderStatus: 0,
    orderStatusDesc: '订单确认中',
    param: {},
    preTimestamp: '',
    isConvenienceStore: false,
    cardNo: ''
  },

  onLoad: function () {
    wx.hideShareMenu()
    let roundNum = 0
    this.getPosOrder(roundNum)
  },

  onShow: function () {
    let store = gbData.store
    let isConvenienceStore = false
    if(store && store.isConvenienceStore === '1'){//判断是否是便利店
      isConvenienceStore = true
    }
    this.setData({
      preTimestamp: gbData.preTimestamp || '',
      isConvenienceStore: isConvenienceStore,
      cardNo: wx.getStorageSync('cardNo') || ''
    })
  },
  
  switchStatus() {
    // return
    // let status = this.data.orderStatus
    if (status === 0) {
      this.setData({
        orderStatus: 1,
        orderStatusDesc: '下单成功！'
      })
    } else if (status === 1) {
      this.setData({
        orderStatus: 2,
        orderStatusDesc: '下单失败！'
      })
    } else if (status === 2) {
      this.setData({
        orderStatus: 0,
        orderStatusDesc: '订单确认中'
      })
    }
  },

  orderDetail() {
    let orderId = gbData.order.id || ''
    menuHelp.emptyCart(() => {
      getApp().backToPage('pages/orderdetail/orderdetail', {orderId: orderId})
    })
  },

  /**
   * 轮循  查订单 
   */
  getPosOrder(roundNum) {
    let interval = setTimeout(() => {
      roundNum += 1
      if (roundNum === 40) {
        clearTimeout(interval)
      }
      let param = {
        orderId: gbData.order.id || ''
      }

      let _this = this
      api.orderStatus(param, res => {
        const { errorCode, errorMsg } = res.data
        gbData.preTimestamp = ''
        if (errorCode == 0) {
          let data = res.data.order || {}
          console.log('data.status.ocStatus=' + data.status.ocStatus + ",roundNum=" + roundNum)
          if (data.status && data.status.ocStatus === 3 && data.posNo === null) {
            // 订单下pos机异常终止轮询 跳转失败页面
            clearTimeout(interval)
            this.setData({
              orderStatus: 2,
              orderStatusDesc: '下单失败！'
            })
          } else if (data.posNo !== null || (data.bookingDate !== null && data.payTransactionNo && data.payTransactionNo.length > 0)) {
            // 订单下pos机成功 跳转成功页面
            clearTimeout(interval)
            this.setData({
              orderStatus: 1,
              orderStatusDesc: '下单成功！',
              sucDetail: data
            })
          }else{
            if (roundNum === 40){
              if (data.posNo === null) {
                // 发起主动退款操作
                this.setData({
                  orderStatus: 2,
                  orderStatusDesc: '下单失败！'
                })
                _this.quitOrder(param)
              }
            }else{
              this.getPosOrder(roundNum)
            }
          }
        }
      })
    }, 3000)
  },
  /**
   * quitOrder
   */
  quitOrder (param) {
    api.quitOrder(param, res => {})
  },
  /**
   * backToPage
   */
  backToPage (e) {
    let index = e.currentTarget.dataset.idx
    menuHelp.emptyCart(() => {
      gbData.clearCart = true
      let storecode = gbData.chooseStore && gbData.chooseStore.storecode || ''
      if (index == 1) { // 菜单
        app.backToPage('pages/menu/menu', { storecode: storecode })
      } else {
        app.backToPage('pages/index/index')
      }
    })
  },

  /**
   * register
   */
  register () {
    wx.navigateToMiniProgram({
      appId: 'wx061e4b9f73885f51',
      path: 'pages/index/index',
      success(res) {
        // 打开成功
      }
    })
  }
})