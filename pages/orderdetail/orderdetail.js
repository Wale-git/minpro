// pages/orderdetail/orderdetail.js
import api from '../../common/api/index.js'
import menuHelp from '../../common/utils/menu-help.js'
let app = getApp()
let gbData = app.globalData
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderDetail: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    if (options && options.orderId) {
      this.orderDetail(options.orderId)
    }
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

  },

  orderDetail(orderId) {
    api.orderStatus({orderId: orderId}, res => {
      if (res && res.data.errorCode == 0) {
        let myOrder = res.data.order
        myOrder.items.forEach(item => {
          if (item.propertyShowAbbr) {
            let propertyShowAbbr = []
            if (Array.isArray(item.propertyShowAbbr)) {
              propertyShowAbbr = item.propertyShowAbbr
            } else {
              propertyShowAbbr = item.propertyShowAbbr.split(',')
            }
            item.propertyShowAbbr = propertyShowAbbr
          }
        })

        this.setData({
          orderDetail: myOrder
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
   * 跳转电子发票
   */
  goInvoice(){
    let orderDetail = this.data.orderDetail
    api.getInvoiceUrl({
      orderId: orderDetail.id, storeCode: orderDetail.store.storeCode,
      businessDay: orderDetail.orderTimeStr.substring(0, 10), transId: ''}, res => {
      if (res && res.resultCode === '01') {//成功
        app.backToPage('pages/invoice/invoice', { linkedUrl: res.invoiceUrl})
      } else {
        getApp().toast(res.resultMsg)
      }
    })
  },

  close () {
    getApp().backToPage('pages/orders/orders')
  }
})