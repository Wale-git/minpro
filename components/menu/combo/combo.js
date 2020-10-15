// components/menu/combo/combo.js
import menuHelp from '../../../common/utils/menu-help.js'
import { getMealDeal } from '../../../common/api/index.js'
let gbData = getApp().globalData
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    combo: {
      type: Object,
      observer: function (val, old) {
        if (val && val.systemId) {
          // if (this.data.chooseItemData) {
          //   this.setData(this.data.chooseItemData)
          //   this.data.chooseItemData = ''
          // }
          this.initData(val)
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    combo: {},
    combomini:{},
    count: 1,
    totalMoney: 0,
    itemCount: 0,
    choosedComboMul: [],
    toView: '',
    autoHeight: 298,
    isComboMul: false,
    comboQty: 0,
    comboMulItemList:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.data.choosedComboMul = []
      gbData.choosedComboMul = []
      this.triggerEvent('close')
    },

    /**
     * 套餐产品处理
     */
    initData(combo) {
      combo.condimentRoundList.forEach((cond, index) => {
        let itemIsdefaultPrice = 0
        let itemIsdefault = cond.condimentItemList.find(res => {
          return res.isdefault === 'Y'
        })
        if (!itemIsdefault) {
          cond.condimentItemList.forEach((v, i) => {
            if (i === 0) {
              v.isdefault = 'Y'
            } else {
              v.isdefault = 'N'
            }
          })
        }
        cond.condimentItemList.forEach((v, i) => {
          if (i === 0) {
            itemIsdefaultPrice = v.price
          }
        })
        cond.condimentItemList.forEach((v, i) => {
          if (v.isdefault === 'Y') {
            return
          }
          if (v.price > itemIsdefaultPrice) {
            v.plusPrice = v.price - itemIsdefaultPrice
          }
        })
      })
      let autoHeight = 298
      let isComboMul = false
      let comboQty = 0
      let combomini = {}
      if (combo.condimentRoundList && combo.condimentRoundList.length > 3){
        autoHeight += (combo.condimentRoundList.length - 3) * 60
      }
      if (combo.comboMul && combo.comboMul.popSystemId) {
        combo = this.comMulInit(combo)
      }
      if (combo.comboQty && combo.comboQty > 0) {
        isComboMul = true
        comboQty = combo.comboQty
        autoHeight = 120
        combomini = combo
        combomini.condimentRoundList.forEach((cond, index) => {
          if (index === 0) {
            cond.condimentItemList.forEach((v, i) => {
              v.quantity = 0
            })
          }
        })
      }
      this.setData({
        combo: combo,
        combomini: combomini,
        toView: 'top-img-1',
        autoHeight: autoHeight,
        comboQty: comboQty,
        isComboMul: isComboMul,
        itemCount: 0,
        comboMulItemList: []
      })
      this.getPrice()
    },

    /**
     * 设置套餐内  多规格属性名称和价格
     */
    comMulInit(combo) {
      let comboMulPrice, comboMulSpeStr, comboMulSysId, comboMulProStr, comboMulProVal, popSystemId, roundIndex
      if (combo.comboMul) {
        comboMulPrice = combo.comboMul.totalMoney
        comboMulSpeStr = combo.comboMul.speStr
        comboMulProStr = combo.comboMul.propertyStr
        comboMulSysId = combo.comboMul.params.systemId
        comboMulProVal = combo.comboMul.params.propertyValue
        roundIndex = combo.comboMul.params.roundIndex
        
        popSystemId = combo.comboMul.popSystemId
        let idx = null
        let thisChoosedComboMul = this.data.choosedComboMul
        thisChoosedComboMul && thisChoosedComboMul.forEach((mul, index) => {
          if (popSystemId == mul.popSystemId) {
            idx = index
          }
        })
        if (idx || idx === 0) {
          this.data.choosedComboMul.splice(idx, 1, combo.comboMul)
        } else {
          this.data.choosedComboMul.push(combo.comboMul)
        }
      }

      combo.condimentRoundList.forEach((cond, index) => {
        let basePrice = 0
        cond.condimentItemList.forEach((v, i) => {
          if (i == 0) {
            basePrice = v.priceTrue
          }

          if (popSystemId == v.systemId && index == roundIndex) {
            let str = ''
            if (comboMulSpeStr && comboMulSpeStr.length > 0) {
              v.menuCn = v.menuCn.replace(/\([^\)]*\)/g, '(' + comboMulSpeStr + ')') // 替换小括号内内容
              str = comboMulProStr ? '(' + comboMulSpeStr + ',' + comboMulProStr + ')' : ''
            } else {
              str = comboMulProStr ? '(' + comboMulProStr + ')' : ''
            }
            if (str) {
              if (v.menuCn.indexOf('(') > -1) {
                v.topMenuCn = v.menuCn.replace(/\([^\)]*\)/g, str)
              } else { // 只有属性
                v.topMenuCn = v.menuCn + str
              }
            } else {
              v.topMenuCn = v.menuCn
            }
            v.price = comboMulPrice ? comboMulPrice : v.price
            if (v.price >= basePrice) {
              v.plusPrice = v.price - basePrice
            }
          }
          //拼接套餐内子项的systemid和属性comboMulProVal，以及轮次
          if (comboMulSysId && roundIndex == index) {
            let arr = gbData.choosedComboMul || []
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].roundIndex === index) {
                gbData.choosedComboMul.splice(i, 1)
                break
              }
            }
            gbData.choosedComboMul.push({
              roundIndex: roundIndex,
              postPopSystemId: v.systemId,
              comboMulSysId: comboMulSysId,
              comboMulProVal: comboMulProVal
            })
          }
        })
      })

      return combo
    },

    /**
     * 加套餐
     */
    addItem(e) {
      let dataset = e.currentTarget.dataset
      const { index, item } = dataset // index 外层   idx 内层
      let combomini = this.data.combomini
      let itemCount = this.data.itemCount
      let comboQty = this.data.comboQty
      let comboMulItemList = this.data.comboMulItemList
      combomini.condimentRoundList.forEach((cond, index) => {
        if (index === 0){
          cond.condimentItemList.forEach((v, i) => {
            if (v.systemId === item.systemId && itemCount < comboQty) {
              v.quantity += 1
              itemCount += 1
              let condiItem = {
                'ruleid': item.systemId,
                'systemId': item.systemId,
                'nameCN': item.nameCN,
                'nameEN': item.nameEN,
                'classId': item.classId,
                'itemType': 11,
                'mealFlag': false,
                'price': item.price,
                'quantity': 1,
                'modify': true,
                'itemgroup': 1
              }
              comboMulItemList.push(condiItem)
              return
            }
          })
        }
      })
      if (itemCount <= comboQty) {
        this.setData({
          combomini: combomini,
          itemCount: itemCount,
          comboMulItemList: comboMulItemList
        })
      } else {
        return
      }
    },

    /**
     * 减套餐
     */
    minusItem(e) {
      let dataset = e.currentTarget.dataset
      const { index, item } = dataset // index 外层   idx 内层
      let combomini = this.data.combomini
      let itemCount = this.data.itemCount
      let comboMulItemList = this.data.comboMulItemList
      combomini.condimentRoundList.forEach((cond, index) => {
        if (index === 0) {
          cond.condimentItemList.forEach((v, i) => {
            if (v.systemId === item.systemId && v.quantity > 0) {
              v.quantity -= 1
              itemCount -= 1
            }
          })
        }
      })
      if (comboMulItemList && comboMulItemList.length > 0) {
        for (let i = 0; i < comboMulItemList.length; i++) {
          if (comboMulItemList[i].systemId === item.systemId) {
            comboMulItemList.splice(i, 1)
            break
          }
        }
      }
      if (itemCount >= 0 && itemCount <= this.data.comboQty) {
        this.setData({
          combomini: combomini,
          itemCount: itemCount,
          comboMulItemList: comboMulItemList
        })
      } else {
        return
      }
    },

    /**
     * 选择套餐内产品
     */
    chooseItem (e) {
      let dataset = e.currentTarget.dataset
      const {index, idx} = dataset // index 外层   idx 内层
      let condimentItemList = this.properties.combo.condimentRoundList[index].condimentItemList
      let isPop = false
      let popSystemId = ''
      let convertRule =''
      condimentItemList.forEach((item, id) => {
        if (id === idx) {
          item.isdefault = 'Y'
          isPop = item.pop
          popSystemId = item.systemId
          convertRule = item.convertRule
        } else {
          item.isdefault = 'N'
        }
      })
      let data = {}
      data['combo.condimentRoundList[' + index + '].condimentItemList'] = condimentItemList
      
      this.data.chooseItemData = data

      if (isPop) {
        this.getDeal(popSystemId, this.properties.combo.systemId, convertRule, index)
      } else {
        this.setData(data)
        this.getPrice()
      }
    },

    /**
     * 计算价格
     */
    getPrice () {
      let combo = this.data.combo
      let totalMoney = combo.priceTrue * this.data.count
      combo.condimentRoundList && combo.condimentRoundList.forEach(round => {
        round.condimentItemList && round.condimentItemList.forEach(item => {
          if (item.isdefault == 'Y' && item.plusPrice) {
            totalMoney += item.plusPrice * this.data.count
          }
        })
      })
      this.setData({
        totalMoney: totalMoney
      })
    },

    /**
     * addToCart
     */
    addToCart () {
      let count = 1
      let dish = menuHelp.comboFmt(this.properties.combo)
      let choosedComboMul = gbData.choosedComboMul
      console.log(JSON.stringify(choosedComboMul))
      dish.condimentItems.forEach((item, index) => {
        if (item.pop){ //判断套餐子项是否可变，若可变则重新set参数
          choosedComboMul.forEach((e, i) => {
            if (e.comboMulSysId && e.roundIndex == index) {
              item.systemId = e.comboMulSysId
              item.propertyValue = e.comboMulProVal
            }
          })
        }
        item.quantity = count
      })
      if (this.data.isComboMul) {
        if (this.data.itemCount < this.data.comboQty){
          getApp().toast('您添加的菜品不满' + this.data.comboQty + '个哦~')
          return
        }else{
          dish.condimentItems = this.data.comboMulItemList
        }
      }

      dish.quantity = count
      let dishArr = []
      dishArr.push(dish)
      menuHelp.confirmDishs(dishArr, false, res => {
        this.data.choosedComboMul = []
        this.data.postPopSystemId = ''
        gbData.choosedComboMul = []
        this.triggerEvent('close')
      })
    },

    /**
     * get meal
     */
    getDeal(popSystemId, combSystemId, convertRule, index) {
      getMealDeal({ systemId: popSystemId, combSystemId: combSystemId }, res => {
        const { errorCode, iMenuVo} = res.data
        if (errorCode == 0) {
          iMenuVo.popSystemId = popSystemId
          this.data.iMenuVo = iMenuVo
          gbData.multiple = this.setSpes(iMenuVo, convertRule, index)
          gbData.choosedCombo = this.data.combo
          this.triggerEvent('showMul')
        }
        this.data.postPopSystemId = popSystemId
      })
    },

    /**
     * 设置 规格默认选中状态
     */
    setSpes(iMenuVo, convertRule, index) {
      let convertRuleList = []
      let propertyValueList = []
      if (this.data.combo.comboMul) {
        let choosedComboMul = this.data.choosedComboMul
        choosedComboMul && choosedComboMul.forEach(shoosen => {
          if (shoosen.popSystemId == iMenuVo.popSystemId) {
            convertRuleList = shoosen.params.choosedSpeList
            propertyValueList = shoosen.params.propertyValue && shoosen.params.propertyValue.split(',')
          }
        })
        if (!convertRuleList || convertRuleList.length < 1) {
          if (convertRule) {
            convertRuleList = convertRule.split(',')
          }
        }
      } else if (convertRule) {
        convertRuleList = convertRule.split(',')
      }
      iMenuVo.specArr && iMenuVo.specArr.forEach( spe => { // 选中已选择规格
        spe.data.forEach( item => {
          if (convertRuleList && convertRuleList.length > 0) {
            convertRuleList.forEach(cover => {
              if (item.code == cover) {
                item.isDefault = 'Y'
              }
            })
          }
        })
      })

      if (propertyValueList && propertyValueList.length > 0) {
        propertyValueList.forEach( (choosenPro, index) => {
          iMenuVo.specList && iMenuVo.specList.forEach(spe => {//带规格属性的    设置已选择属性
            if (spe.targetSystemid == iMenuVo.popSystemId) {
              spe.propertyClassList && spe.propertyClassList.forEach((pro, idx) => {
                if (idx == index) {
                  pro.propertyValueList && pro.propertyValueList.forEach(val => {
                    if (val.propertyValue == choosenPro) {
                      val.isdefault = 'Y'
                    } else {
                      val.isdefault = 'N'
                    }
                  })
                }
              })
            }
          })

          iMenuVo.propertyClassList && iMenuVo.propertyClassList.forEach(prop => { // 只有属性的   设置已选择属性
            prop.propertyValueList && prop.propertyValueList.forEach(value => {
              if (value.propertyValue == choosenPro) {
                value.isdefault = 'Y'
              } else {
                value.isdefault = 'N'
              }
            })
          })
        })
      }
      iMenuVo.roundIndex = index
      return iMenuVo
    }
  }
})
