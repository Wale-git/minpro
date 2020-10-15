// components/menu/multiple/multiple.js
import menuHelp from '../../../common/utils/menu-help.js'
let gbData = getApp().globalData
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    multiple: {
      type: Object,
      observer: function (val, old) {
        let _this = this
        if (val && val.systemId) {
          this.data.orgMultiple = val
          if (val.popSystemId) { // 套餐下的多规格产品标志
            this.setData({
              hiddenFlag: true,
              toView: 'top-img'
            })
          } else {
            this.setData({
              hiddenFlag: false,
              toView: 'top-img'
            })
          }
          _this.getProperty(val)
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isProperty: true, // 只有属性
    propertyClassList: [], // 属性list
    specList: [], // 上部渲染用的规格list
    specArr: [], // 属性， 下部渲染用
    speciList: [], // 既有属性  又有规格 
    convertRule: [], // 规格  下部渲染用
    propertyPrice: 0, // 多规格基础价格  主要是杯型价格
    count: 1,
    hiddenFlag: false,
    toView: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.setData({
        hiddenFlag: false
      })
      this.triggerEvent('close')
    },

    /**
     * 获取属性   规格
     */
    getProperty(multiple) {
      this.setData({
        roundIndex: multiple.roundIndex || '',
        propertyClassList: multiple.propertyClassList || [],
        specArr: multiple.specArr || [],
        speciList: multiple.specList || [],
        count: 1
      })
      this.data.isProperty = multiple.propertyClassList && multiple.propertyClassList.length > 0

      this.convertRule()
    },

    /**
     * 获取 菜品规格 的渲染数据
     */
    convertRule(flag) {
      let convertRule = []
      let convertRuleProperty = {}
      if (!this.data.isProperty) { // 既有规格又有属性
        this.data.specArr.forEach(spe => { // 匹配出当前的convertRule组合
          spe.data.forEach(sp => {
            // sp.isShow = true // 先默认所有规格都是展示状态
            if (sp.isDefault === 'Y') { // 组合出当前的选中组合
              convertRule.push(sp.code)
            }
          })
        })
        let arrConvertRule = this.data.speciList.find((item) => { // 找出满足条件的第一项
          return item.convertRule === convertRule.join(',')
        })
        if (arrConvertRule) { // 说明有值，convertRule找到了对应的数据
          convertRuleProperty = arrConvertRule
          this.data.targetSystemid = arrConvertRule.targetSystemid
          this.data.propertyPrice = arrConvertRule.price
        } else { // 没有找到对应的数据
          let arrNotConvertRule = this.data.speciList.find((item) => { // 循环找出item所有组合中杯型选项跟选中的杯型一致的第一条数据
            return item.convertRule.indexOf(convertRule[0]) !== -1
          })
          convertRuleProperty = arrNotConvertRule
          this.data.targetSystemid = arrNotConvertRule.targetSystemid
          this.data.propertyPrice = arrNotConvertRule.price
          this.data.specArr.forEach(spe => { // 循环遍历规格项
            if (spe.specClass !== '2') { // 如果不是温度 return
              return
            }
            spe.data.forEach(sp => { // 循环遍历
              if (arrNotConvertRule.convertRule.indexOf(sp.code) !== -1) { // 找出跟刚才匹配出来的组合温度相等的温度
                sp.isDefault = 'Y' // 将其选中
              } else {
                sp.isDefault = 'N' // 其他温度不选中
                sp.isShow = false // 并且隐藏
              }
            })
          })
        }
      }
      this.setData({
        convertRule: convertRuleProperty
      })

      // if (flag) {// flag --> true 修改杯型  不更改其他属性选中状态
      //   this.getTotalPropertyPrice()
      //   return
      // } 
      this.totalProductsDetail()
    },


    /**
     * 属性 规格  头部展示处理
     */
    totalProductsDetail() {
      let arr = []
      if (!this.data.isProperty) {
        this.data.specArr.forEach(spe => {
          let item = spe.data.filter((v) => {
            return v.isDefault === 'Y'
          })
          arr.push({
            name: spe.specClassName,
            value: item[0].name
          })
        })
        let convertRule = this.data.convertRule
        if (convertRule.propertyClassList && convertRule.propertyClassList.length > 0) {
          convertRule.propertyClassList.forEach(con => {
            let item = con.propertyValueList.filter((v) => {
              return v.isdefault === 'Y'
            })
            arr.push({
              name: con.propertyClassName,
              value: item[0].propertyValueName
            })
          })
        }
      } else {
        this.data.propertyClassList.forEach(pro => {
          let item = pro.propertyValueList.filter((v) => {
            return v.isdefault === 'Y'
          })
          arr.push({
            name: pro.propertyClassName,
            value: item[0].propertyValueName
          })
        })
      }
      // 每三个分割数组
      var result = []
      for (var i = 0; i < arr.length; i += 4) {
        result.push(arr.slice(i, i + 4))
      }

      this.setData({
        specList: result
      })
      // return result
      this.getTotalPropertyPrice()
    },

    /**
     * chooseProper  只有属性
     */
    chooseProper (e) {
      let dataset = e.currentTarget.dataset
      const { index, idx } = dataset // index 外层   idx 内层
      let propertyValueList = this.data.propertyClassList[index].propertyValueList
      propertyValueList.forEach((item, id) => {
        if (id === idx) {
          item.isdefault = 'Y'
        } else {
          item.isdefault = 'N'
        }
      })

      let data = {}
      data['propertyClassList[' + index + '].propertyValueList'] = propertyValueList
      this.setData(data)

      this.convertRule()
    },

    /**
     * 选属性
     */
    chooseProperty (e) {
      let dataset = e.currentTarget.dataset
      const { index, idx, proper, id, propertyClass } = dataset // index 外层   idx 内层
      let propertyValueList = this.data.convertRule.propertyClassList[index].propertyValueList
      propertyValueList.forEach((item, i) => {
        if (item.id === id) {
          item.isdefault = 'Y'
        } else {
          item.isdefault = 'N'
        }
      })
      let data = {}
      data['convertRule.propertyClassList[' + index + '].propertyValueList'] = propertyValueList
      this.setData(data)

      /**
       * 切换杯型  其属性不更改
       */
      // // 同杯型  的属性也更改   
      this.data.speciList && this.data.speciList.forEach(spe => {
        spe.propertyClassList && spe.propertyClassList.forEach((classList, idx) => {
          if (classList.propertyClass == propertyClass) {
            classList.propertyValueList.forEach((val) => {
              if (val.propertyValue == proper) {
                val.isdefault = 'Y'
              } else {
                val.isdefault = 'N'
              }
            })
          }
        })
      })

      // this.convertRule()
      this.totalProductsDetail()
    },

    /***
     * 选规格
     */
    chooseSpec (e) {
      let dataset = e.currentTarget.dataset
      const { index, idx } = dataset // index 外层   idx 内层
      let specList = this.data.specArr[index].data
      let convertRule = []

      specList.forEach((item, id) => {
        if (id === idx) {
          item.isDefault = 'Y'
          // convertRule.push(item.code)
        } else {
          item.isDefault = 'N'
        }
      })


      this.data.specArr.forEach(spe => { // 匹配出当前的convertRule组合
        spe.data.forEach(sp => {
          if (sp.isDefault === 'Y') { // 组合出当前的选中组合
            convertRule.push(sp.code)
          }
        })
      })
      let arrConvertRule = this.data.speciList.find((item) => { // 找出满足条件的第一项
        return item.convertRule === convertRule.join(',')
      })
      // if (convertRule && convertRule.length > 0) this.data.convertRule = convertRule
      if (arrConvertRule && arrConvertRule.originalSystemid) {
        this.data.propertyPrice = arrConvertRule.price
        this.data.targetSystemid = arrConvertRule.targetSystemid
        this.setData({
          convertRule: arrConvertRule
        })
      }


      let data = {}
      data['specArr[' + index + '].data'] = specList
      this.setData(data)

      if (this.data.specArr[index].specClassName == "温度") { //  温度调用原来的逻辑
        this.convertRule()
      } else { // 修改杯型  不更改其他属性选中状态
        // this.convertRule(true)
        this.totalProductsDetail()
      }
    },

    /**
     * 价格计算
     */
    getTotalPropertyPrice() {
      let number = 0
      let totalMoney = 0
      let propertyClassList = this.data.convertRule.propertyClassList || []
      let propertyClassList1 = this.data.propertyClassList || []
      if (propertyClassList && propertyClassList.length > 0) { // 有规格和属性的价格
        propertyClassList.forEach((pro, index) => {
          pro.propertyValueList.forEach((v, i) => {
            if (v.isdefault === 'Y') {
              number += v.price * this.data.count
            }
          })
        })
      } else { // 只有属性的价格
        if (propertyClassList1 && propertyClassList1.length > 0) {
          propertyClassList1.forEach((pro, index) => {
            pro.propertyValueList.forEach((v, i) => {
              if (v.isdefault === 'Y') {
                number += v.price * this.data.count
              }
            })
          })
        }
      }
      if (this.data.isProperty) { // 只有属性的价格
        totalMoney = number + this.data.multiple.price * this.data.count
      } else { // 有规格和属性的价格
        totalMoney = number + this.data.propertyPrice * this.data.count
      }
      this.setData({
        totalPropertyPrice: totalMoney
      })
    },

    /**
     * 加入购物车
     */
    addToCart (comboFlag) {
      let shop = this.properties.multiple
      let orderItems = []
      let choosedSpeList = []
      // shop.price = this.data.totalPropertyPrice
      let params = {}
      if (comboFlag.currentTarget) {
        params = menuHelp.multipleFmt(shop, this.data.count)
      }
      // let params = menuHelp.multipleFmt(shop, this.data.count)
      if (this.data.isProperty) { //  只有属性
        let propertyValue = []
        let propertyShowAbbr = []
        this.data.propertyClassList.forEach((pro, index) => {
          pro.propertyValueList.forEach((v, i) => {
            if (v.isdefault === 'Y') {
              propertyValue.push(v.propertyValue)
              propertyShowAbbr.push(v.propertyClassName + ':   ' + v.propertyValueName)
            }
          })
        })
        params.systemId = shop.systemId
        params.propertyValue = propertyValue.join(',')
        params.propertyShowAbbr = propertyShowAbbr.join(',')
      } else { // 有属性有规格
        let propertyValue = []
        let propertyShowAbbr = []
        this.data.specArr.forEach(spe => {
          spe.data.forEach(sp => {
            if (sp.isDefault === 'Y') {
              propertyShowAbbr.push(spe.specClassName + ': ' + sp.name)
              choosedSpeList.push(sp.code)
            }
          })
        })
        let convertRule = this.data.convertRule || []
        if (convertRule.propertyClassList && convertRule.propertyClassList.length > 0) {
          convertRule.propertyClassList.forEach((pro, index) => {
            pro.propertyValueList.forEach((v, i) => {
              if (v.isdefault === 'Y') {
                propertyValue.push(v.propertyValue)
                propertyShowAbbr.push(v.propertyClassName + ': ' + v.propertyValueName)
              }
            })
          })
        }
        params.systemId = this.data.targetSystemid
        params.propertyValue = propertyValue.join(',')
        params.propertyShowAbbr = propertyShowAbbr.join(',') || ''
      }
      if (comboFlag && !comboFlag.currentTarget) {
        return {
          ruleid: shop.systemId,
          systemId: params.systemId,
          propertyValue: params.propertyValue,
          roundIndex: shop.roundIndex,
          choosedSpeList: choosedSpeList,
         }
      }
      orderItems.push(params)
      menuHelp.confirmDishs(orderItems, false, res => {
        gbData.choosedSpecList = this.data.specList
        this.triggerEvent('close')
      })
    },

    /**
     * 获取已选择的规格,属性  eg: 标冷,两份糖,一份奶
     */
    getSpeci (cb) {
      let nameStr = []
      let specArr = this.data.specArr
      specArr && specArr.forEach(spe => {
        spe.data.forEach( item => {
          if (item.isDefault == 'Y' || item.isdefault == 'Y') {
            if (item.name == '标准') {
              nameStr += item.name.substr(0, 1)
            } else {
              nameStr += item.name
            }
          }
        })
      })

      let propertyClassList = this.data.convertRule.propertyClassList || this.data.propertyClassList
      let propertyArr = []
      propertyClassList && propertyClassList.forEach( classList => {
        classList.propertyValueList.forEach( property => {
          if (property.isdefault == 'Y' || property.isDefault == 'Y') {
            if (property.sort*1 !== 1) {
              propertyArr.push(property.propertyValueName)
            } else if (this.data.propertyClassList && this.data.propertyClassList.length > 0) {
              propertyArr.push(property.propertyValueName)
            }
          }
        })
      })
      let res = {
        roundIndex: this.data.roundIndex,
        speStr: nameStr,
        propertyStr: propertyArr.toString(),
        popSystemId: this.data.orgMultiple.popSystemId
      }
      cb && cb(res)
    },

    /**
     * 加产品
     */
    addItem() {
      if (this.data.count < this.properties.multiple.maxQty) {
        this.setData({
          count: ++this.data.count
        })
      } else {
        getApp().alert({
          noTitle: true,
          text: '购物车中最多只能添加' + this.properties.multiple.maxQty + '个相同产品哦~',
          alertButton: '确认',
          callback: () => {
            return
          }
        })
      }
      this.getTotalPropertyPrice()
    },

    /**
     * 减产品
     */
    minusItem() {
      if (this.data.count > 1) {
        this.setData({
          count: --this.data.count
        })
      } else {
        return
      }
      this.getTotalPropertyPrice()
    },

    /**
     * 确认  套餐里的多规格产品
     */
    confirm() {
      this.getSpeci( res => {
        res.totalMoney = this.data.totalPropertyPrice
        res.params = this.addToCart(true)
        gbData.comboMul = res
        // this.setData({
        //   hiddenFlag: false
        // })
        this.triggerEvent('showMulCombo')
      })
    }
  },
})
