// components/menu/single/single.js
import menuHelp from '../../../common/utils/menu-help.js'

let app = getApp()
let gbData = app.globalData

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    singleDish: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    count: 1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** 关闭单品 */
    close() {
      this.setData({
        count: 1
      })
      this.triggerEvent('close')
    },

    /**
     * 加单品
     */
    addItem () {
      let dish = menuHelp.singleFmt(this.properties.singleDish)
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
          cc += item.quantity
        }
      })
      if (cc + this.data.count < this.properties.singleDish.maxQty) {
        this.setData({
          count: ++this.data.count
        })
      } else {
        getApp().alert({
          noTitle: true,
          text: '购物车中最多只能添加' + this.properties.singleDish.maxQty +'个相同产品哦~',
          alertButton: '确认',
          callback: () => {
            return
          }
        })
      }
    },

    /**
     * 减单品
     */
    minusItem () {
      if (this.data.count > 1) {
        this.setData({
          count: --this.data.count
        })
      } else {
        return
      }
    },

    /**
     * 加入购物车
     */
    addToCart () {
      let _this = this
      if (this.data.maxFlag){
        _this.triggerEvent('close')
        _this.setData({
          count: 1
        })
        return
      }
      let dish = menuHelp.singleFmt(this.properties.singleDish)
      dish.quantity = this.data.count
      dish = Array(dish)
      menuHelp.confirmDishs(dish, false, res => {
        _this.triggerEvent('close')
        _this.setData({
          count: 1
        })
      })
    }
  }
})
