// pages/orders/orders.js
import api from '../../common/api/index.js'
import menuHelp from '../../common/utils/menu-help.js'
let app = getApp()
let gbData = app.globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
  },

  clickOrder(e) {
    let orderId = e.currentTarget.dataset.orderid
    getApp().backToPage('pages/orderdetail/orderdetail', { orderId: orderId})
  },

  onLoad: function() {
    wx.hideShareMenu()
    this.getOrderList()
  },

  /**
   * 获取订单列表
   */
  getOrderList () {
    getApp().showLoading()
    api.orderlist({}, res => {
      const { errorCode, errorMsg} = res.data
      if (errorCode === 0) {
        const {orderList} = res.data
        this.setData({
          orderList: orderList
        })
      }
      getApp().hideLoading()
    })
  },

  /**
   * 取消订单
   */
  cancleOrder(e) {
    let orderId = e.currentTarget.dataset.orderid
    app.confirm({
      noTitle: true,
      text: '要取消订单吗？',
      confirmName: '确认',
      cancelName: '返回',
      confirm: () => {
        api.cancleOrder({ orderId: orderId }, res => {
          if (res.data.errorCode == 0) {
            getApp().toast('取消成功')
            this.setData({
              orderList: res.data.orderList
            })
          } else {
            getApp().toast('取消失败')
          }
        })  
      }
    })
  },

  /**
* backToPage
*/
  backToPage(e) {
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
   * 订单  签到
   */
  placeOrder (e) {
    let orderId = e.currentTarget.dataset.orderid
    app.confirm({
      noTitle: true,
      text: '确认到点了吗？',
      text2: '我们将马上为您配餐',
      confirmName: '确认',
      cancelName: '返回',
      confirm: () => {
        api.placeOrder({ orderId: orderId }, res => {
          if (res.data.errorCode == 0) {
            getApp().toast('签到成功')
            this.setData({
              orderList: res.data.orderList
            })
          } else {
            getApp().toast('签到失败')
          }
        })
      }
    })
  },
  /**
     * 跳转电子发票
     */
  goInvoice(e) {
    let orderDetail = e.currentTarget.dataset.orderdetail
    api.getInvoiceUrl({
      orderId: orderDetail.id, storeCode: orderDetail.store.storecode,
      businessDay: orderDetail.orderTimeStr.substring(0, 10)
    }, res => {
      if (res.data && res.data.resultCode == '01') {//成功
        let invoiceUrl = res.data.invoiceUrl
        //判断是否打印过发票
        if (invoiceUrl.indexOf('timhortons') > 0){
          app.backToPage('pages/invoice/invoice', { linkedUrl: encodeURIComponent(res.data.invoiceUrl) })
        }else{
          getApp().alert({
            noTitle: true,
            text: '电子发票已开具成功，请点击复制链接:',
            text2: res.data.invoiceUrl,
            alertButton: '确认',
            callback: () => {
              return
            }
          })
        }
      } else {
        getApp().toast(res.data.resultMsg)
      }
    })
  }

})