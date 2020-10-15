// components/menu/shoppingcart/shoppingcart.js
import menuHelp from '../../../common/utils/menu-help.js'
import { saveFormIds } from '../../../common/api/index.js'
let app = getApp()
let gbData = getApp().globalData
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cartData: {
      type: Object,
      observer: function (val, old) {
        if (val && val.id) {
          this.getCartData(val)
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    orderItems: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.triggerEvent('close')
    },

    /**
     * 获取购物车数据
     */
    getCartData(order) {
      let orderItems = order.items.filter(item => {
        if (item.propertyShowAbbr) {
          let propertyShowAbbr = []
          if (Array.isArray(item.propertyShowAbbr)) {
            propertyShowAbbr = item.propertyShowAbbr
          } else {
            propertyShowAbbr = item.propertyShowAbbr.split(',')
          }
          item.propertyShowAbbr = propertyShowAbbr
        }
        return true
      })

      if (!orderItems || orderItems.length <= 0) {
        this.triggerEvent('close')
      }

      this.setData({
        orderItems: orderItems,
        total: order.total
      })
    },

    /**
     * addItem
     */
    changeNum (e) {
      let dataset = e.currentTarget.dataset
      const {item, flag} = dataset

      if (item.promotionType == 2) return 

      item.productCategory === '2' ? item.modify = true : item.modify = false
      let orderItems = item
      let quantity_old = item.quantity
      let isModify = orderItems.productCategory === '2' // 判断是否是固定套餐
      if (isModify) {
        flag ? orderItems.quantity = Number(orderItems.quantity) + 1 : orderItems.quantity = Number(orderItems.quantity) - 1
        orderItems.condimentItems.forEach(element => {
          element.quantity = orderItems.quantity
        })
      } else {
        flag ? orderItems.quantity = 1 : orderItems.quantity = -1
      }
      if (orderItems.propertyShowAbbr && orderItems.propertyShowAbbr.length > 0) {
        let proStr = Array(orderItems.propertyShowAbbr)
        orderItems.propertyShowAbbr = proStr.toString()
      }
      let dish = []
      dish.push(orderItems)
      let _this = this
      getApp().showLoading()
      menuHelp.confirmDishs(dish, false, res => {
        const { errorCode, errorMsg, order } = res.data
        if (errorCode == 0){
          _this.getCartData(res.data.order)
        } else {
          getApp().alert({
            noTitle: true,
            text: '购物车中最多只能添加' + quantity_old + '个相同产品哦~',
            alertButton: '确认',
            callback: () => {
              return
            }
          })
        }
        getApp().hideLoading()
      })
    },

    /**
     * 结算
     */
    // goSettle () {
    //   app.backToPage('pages/settlement/settlement')
    // },

    /**
     * 提交formId  用于小程序消息推送
     */
    goSettle (e) {
      let param = {
        orderId: gbData.orderId,
        formId: e.detail.formId
      }
      console.log(e.detail.formId, 'formId-js')
      saveFormIds(param, () => {
        app.backToPage('pages/settlement/settlement')
      })
    }
  }
})
