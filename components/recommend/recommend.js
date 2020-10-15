// components/recommend/recommend.js
import menuHelp from '../../common/utils/menu-help.js'
import { saveFormIds } from '../../common/api/index.js'
let gbData = getApp().globalData
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rpvList: {
      type: Array,
      observer: function (val, old) {
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    addedMoney: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.triggerEvent('close')
    },

    /**
     * 提交推荐商品
     */
    confirm(e) {
      let orderItems = []
      let param = {
        orderId: gbData.orderId,
        formId: e.detail.formId
      }
      console.log(e.detail.formId, 'formId-recomm')
      this.properties.rpvList.forEach(item => {
        if (item.isdefault) {
          let condiArr = []
          if (item.condimentRoundList){
            item.condimentRoundList.forEach(round => {
              round.condimentItemList.forEach(item1 => {
                let condiItem = {
                  'ruleid': item1.systemId,
                  'systemId': item1.systemId,
                  'nameCN': item1.nameCN,
                  'nameEN': item1.nameEN,
                  'classId': item1.classId,
                  'itemType': 11,
                  'mealFlag': false,
                  'price': item1.price,
                  'quantity': item1.quantity * 1,
                  'propertyValue': item1.propertyValue,
                  'modify': true,
                  'itemgroup': 1
                }
                if (item1.isdefault == 'Y') condiArr.push(condiItem)
              })
            })
          }
          
          orderItems.push({
            'productCategory': item.productCategory,
            'ruleid': item.systemId,
            'productId': item.systemId,
            'systemId': item.systemId,
            'sizeId': null,
            'sizeAttr': null,
            'baseId': null,
            'baseAttr': '',
            'nameCn': item.productName,
            'nameEn': item.productName,
            'classId': item.classId,
            'itemType': 0,
            'mealFlag': false,
            'specialMenu': false,
            'price': item.price,
            'quantity': 1,
            'modify': false,
            'condimentItems': condiArr
          })
        }
      })
      saveFormIds(param, () => { 
        if (orderItems.length > 0) {
          menuHelp.confirmDishs(orderItems, false, () => {
            this.triggerEvent('close')
          })
        } else {
          this.triggerEvent('close')
        }
      })
    },

    /**
     * 选择产品
     */
    chooseItem(e) {
      let dish = e.currentTarget.dataset.dish
      let index = e.currentTarget.dataset.index
      let data = {}
      data['rpvList[' + index + '].isdefault'] = !dish.isdefault
      this.setData(data)
      this.getRpvPrice()
    },

    /**
     * 计算价格
     */
    getRpvPrice () {
      let rpvList = this.properties.rpvList || []
      let totalMoney = 0
      rpvList && rpvList.forEach(rpv => {
        if (rpv.isdefault) totalMoney += rpv.price
      })
      this.setData({
        addedMoney: totalMoney
      })
    }
  }
})
