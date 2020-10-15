import api from '../api/index.js'
let app = getApp()
let globalData = getApp().globalData
module.exports = {
  /**
   * 获取菜单数据 create.do
   */
  getMenu (param, cb) {
    api.create(param, res => {
      let body = res && res.data
      let errorCode = body && body.errorCode
      if (errorCode == 0) {
        globalData.orderId = body && body.order && body.order.id || ''
        globalData.openId = body && body.order && body.order.openId || ''
        globalData.store = body && body.order && body.order.store || {}
        globalData.bannerList = body && body.menuResponseVo && body.menuResponseVo.bannerVos || []
        globalData.sc = { //购物车数据
          localDishs: { // 缓存本地未交互购物车数据
            singleFoods: [], // 单品
            condiments: [], // 套餐
          }
        }
        globalData.cartTotalPrice = 0
        globalData.order = {}
        let menuResponseVo = body && body.menuResponseVo && body.menuResponseVo.data || []
        this.secondDeal(menuResponseVo, (classifyList) => {
          cb && cb(classifyList)
        })
      }
    })
  },

  /**
   * getMenuByStore
   */
  getMenuByStore () {
    api.getMenuByStore(param, res => {
      let body = res && res.data
      let errorCode = body && body.errorCode
      if (errorCode == 0) {
        globalData.orderId = body && body.order && body.order.id || ''
        globalData.openId = body && body.order && body.order.openId || ''
        globalData.store = body && body.order && body.order.store || {}
        globalData.bannerList = body && body.menuResponseVo && body.menuResponseVo.bannerVos || []
        let menuResponseVo = body && body.menuResponseVo && body.menuResponseVo.data || []
        this.secondDeal(menuResponseVo, (classifyList) => {
          cb && cb(classifyList)
        })
      }
    })
  },

  /**
   * 菜单数据  数据过滤，菜品类型判断等
   */
  firstDeal(menuResponseVo) {
    if (menuResponseVo && menuResponseVo.length > 0) {
      menuResponseVo.forEach(clazz => {
        clazz.curNum = 0 // 新建字段，默认选择的类别的产品数量为0
        // 过滤菜单产品
        clazz.menuVoList = clazz.menuVoList.filter(menuVo => {
          return menuVo.menuFlag !== 'V'
        })
        clazz.menuVoList.forEach((menuVo, index) => {
          menuVo.classId = clazz.classExtId
          menuVo.curNum = 0
          if (menuVo.disabledFlag === '1') {
            // 将下架商品直接移除
            clazz.menuVoList.splice(index, 1)
          }
          if (menuVo.menuFlag === 'P') {
            // 单品
            if (
              menuVo.condimentRoundList &&
              menuVo.condimentRoundList.length > 0
            ) {
              // 套餐
              var priceShow = 0
              // 计算价格应该先判断将所有disabledFlag=1的值不返回给页面数据；然后判断剩下来的数据中有没有为Y，有的话就选中，没得话循环给第一个为Y
              menuVo.condimentRoundList.forEach(cond => {
                cond.condimentItemList.forEach((con, index) => {
                  con.priceTrue = con.price
                  if (con.disabledFlag === '1') {
                    // 移除下架子项
                    // cond.condimentItemList.splice(index, 1)
                    con.hideItem = true
                  }
                  if (con.isdefault === 'Y') {
                    priceShow = priceShow + con.price
                  }
                })
              })
              menuVo.menuType = 'M'
              menuVo.priceTrue = menuVo.price + priceShow
            } else if (
              (menuVo.specList && menuVo.specList.length > 0) ||
              (menuVo.propertyClassList && menuVo.propertyClassList.length > 0)
            ) {
              // 规格
              menuVo.menuType = 'S'
              menuVo.priceTrue = menuVo.userPrePrice > 0 ? menuVo.userPrePrice : menuVo.price
              // 过滤数据，增加字段
              if (menuVo.specList && menuVo.specList.length > 0) {
                let arr = []
                let isDef = false
                //先循环规格，判断有没有默认选项
                for (var pro of menuVo.specList) {
                  if (pro.isDefault) {
                    isDef = true
                    break
                  }
                }
                for (var pro of menuVo.specList) {
                  if (isDef){
                    if (pro.price === menuVo.price && pro.isDefault) {
                      arr = pro.convertRule.split(',')
                      break
                    }
                  } else {
                    if (pro.price === menuVo.price) {
                      arr = pro.convertRule.split(',')
                      break
                    }
                  }
                }
                
                menuVo.specArr.forEach((pro, index) => {
                  pro.data.forEach((v, i) => {
                    v.isShow = true
                    if (arr.indexOf(v.code) !== -1) {
                      v.isDefault = 'Y'
                    } else {
                      v.isDefault = 'N'
                    }
                  })
                })
                // 过滤属性数据 当有默认项的时候不处理，没有默认项的时候默认第一项
                menuVo.specList.forEach((item, index) => {
                  if (item.propertyClassList && item.propertyClassList.length > 0) {
                    item.propertyClassList.forEach((pro, proIndex) => {
                      let proLength = 0
                      if (pro && pro.propertyValueList) {
                        proLength = pro.propertyValueList.filter((value, valueIndex) => {
                          return value.isdefault === 'Y'
                        }
                        ).length
                      }
                      if (proLength > 0) {
                        return
                      } else {
                        if (pro && pro.propertyValueList) { 
                          pro.propertyValueList.forEach((value, valueIndex) => {
                            if (valueIndex === 0) {
                              value.isdefault = 'Y'
                            }
                          })
                        }
                      }
                    })
                  }
                })
              }
            } else {
              menuVo.menuType = 'P'
              menuVo.priceTrue = menuVo.price
            }
          }
        })
      })
    }
    return menuResponseVo
  },

  /**
   * 菜单渲染数据 简化
   */
  secondDeal(menuVo, cb) {
    let classifyList = [] // 分类 -> 菜品
    let menuResponseVo = this.firstDeal(menuVo)

    globalData.originalMenuVo = menuResponseVo // 存一份原始菜单数据
    menuResponseVo.forEach(items => { // 精简菜单数据
      let newItems = {
        classExtId: items.classExtId,
        nameCn: items.nameCn,
        imageCnUrl: items.imageCnUrl
      }
      let dishsList = [] // 菜品
      items && items.menuVoList.forEach(dish => {
        let newDish = {
          productCategory: dish.productCategory,
          classId: items.classExtId,
          systemId: dish.systemId,
          sizeId: dish.sizeId,
          baseId: dish.baseId,
          nameCn: dish.nameCn,
          nameEn: dish.nameEn,
          price: dish.price,
          priceTrue: dish.priceTrue,
          size: dish.size,
          base: dish.base,
          imageUrl: dish.imageUrl,
          menuFlag: dish.menuFlag,
          maxQty: dish.maxQty,
          minQty: dish.minQty,
          comboQty: dish.comboQty,
          descCn: dish.descCn,
          specList: dish.specList || [],
          condimentRoundList: dish.condimentRoundList || [],
          productCategory: dish.productCategory,
          discount: dish.discount,
          menuType: dish.menuType,
          quantity: 0,
          abbr: dish.abbr,
          adPrice: dish.adPrice,
          specArr: dish.specArr || [], // 杯型，温度
          propertyClassList: dish.propertyClassList || [] // 只有属性
        }
        dishsList.push(newDish)
      })

      newItems.dishsList = dishsList
      classifyList.push(newItems)
    })
    // menuData.menuVoList = newMenuVoList
    cb && cb(classifyList)
  },

  /**
 * 判断产品规格
 * return 0.单品  1.套餐   2.多规格
 */
  judgment(dish) {
    if (dish.menuType == 'P' || dish.productCategory === '2') {
      return 0
    } else if (dish.menuType == 'M' && dish.productCategory === '3') {
      return 1
    } else if (dish.menuType == 'S') {
      return 2
    }
  },

  /**
   * 购物车单品格式化
   */
  singleFmt(foods) {
    return {
      'productCategory': foods.productCategory,
      'ruleid': foods.systemId,
      'productId': foods.systemId,
      'systemId': foods.systemId,
      'sizeId': foods.size.sizeId,
      'sizeAttr': null,
      'baseId': foods.base.baseId,
      'baseAttr': '',
      'nameCn': foods.nameCn,
      'nameEn': foods.nameEn,
      'classId': foods.classId,
      'itemType': 0,
      'mealFlag': false,
      'specialMenu': false,
      'price': foods.price,
      'priceTrue': foods.priceTrue,
      'quantity': foods.quantity,
      'discount': foods.discount,
      'vipDiscount': foods.discount,
      'maxQty': foods.maxQty,
      'modify': foods.productCategory === '2'
    }
  },

  /**
   * 菜单页 单品加购物车 
   */
  singleToCart(foods, cb) {
    let singleFoods = globalData.sc.localDishs.singleFoods
    let singleFood = this.singleFmt(foods)
    let existItem = null
    singleFoods.forEach(item => {
      if (singleFood.systemId === item.systemId) {
        existItem = item
      }
    })
    if (existItem) { // 购物车存在   更改数量
      ++existItem.quantity
    } else {  // 购物车没有   加入购物车
      ++singleFood.quantity
      singleFoods.push(singleFood)
    }
    globalData.sc.localDishs.singleFoods = singleFoods
    cb && cb(singleFoods)
  },

  /**
   * 加购物车   套餐格式化
   */
  comboFmt(foods) {
    let condiArr = []
    foods.condimentRoundList.forEach(round => {
      round.condimentItemList.forEach(item => {
        let condiItem = {
          'ruleid': item.systemId,
          'systemId': item.systemId,
          'nameCN': item.nameCN,
          'nameEN': item.nameEN,
          'classId': item.classId,
          'itemType': 11,
          'mealFlag': false,
          'price': item.price,
          'quantity': item.quantity * 1,
          'propertyValue': item.propertyValue,
          'modify': true,
          'pop': item.pop,
          'itemgroup': 1
        }
        if (item.isdefault == 'Y') condiArr.push(condiItem)
      })
    })
    return {
      'productCategory': foods.productCategory,
      'ruleid': foods.systemId,
      'productId': foods.systemId,
      'systemId': foods.systemId,
      'sizeId': foods.size.sizeId,
      'sizeAttr': null,
      'baseId': foods.base.baseId,
      'baseAttr': '',
      'nameCn': foods.nameCn,
      'nameEn': foods.nameEn,
      'classId': foods.classId,
      'itemType': 0,
      'mealFlag': false,
      'specialMenu': false,
      'price': foods.price,
      // 'priceTrue': foods.priceTrue,
      'quantity': foods.quantity,
      // 'discount': foods.discount,
      // 'vipDiscount': foods.discount,
      'modify': foods.productCategory === '2',
      'condimentItems': condiArr
    }
  },

  /**
   * 多规格购物车格式化
   */
  multipleFmt(shop, quantity) {
    return {
      'productCategory': shop.productCategory,
      'ruleid': shop.systemId,
      'productId': shop.systemId,
      'systemId': shop.systemId,
      'sizeId': shop.size.sizeId,
      'sizeAttr': null,
      'baseId': shop.base.baseId,
      'baseAttr': '',
      'nameCn': shop.nameCn,
      'nameEn': shop.nameEn,
      'classId': shop.classId,
      'itemType': 0,
      'mealFlag': false,
      'specialMenu': false,
      'price': shop.price,
      'quantity': quantity,
      'discount': shop.discount,
      'vipDiscount': shop.discount,
      'modify': false,
      'propertyValue': '',
      'propertyShowAbbr': ''
    }
  },

  /**
   * 提交购物车
   */
  confirmDishs(dish, delFlag, cb) {
    let params = {
      orderItems: JSON.stringify(dish),
      oid: globalData.orderId,
      delFlag: delFlag,
      deviceId: globalData.openId
    }
    api.confirm(params, res => {
      const { errorCode, errorMsg, order } = res.data
      let myCouponList = globalData.couponList
      if (errorCode == 0) {
        globalData.order = order || []
        globalData.cartTotalPrice = order && order.total || []
        order && order.items && order.items.forEach(item => {
          myCouponList && myCouponList.forEach(coupon => {
            if (item.promotionCode == coupon.couponCode) {
              coupon.isUsed = true
            } else {
              coupon.isUsed = false
            }
          })
        })
        globalData.couponList = myCouponList
      }
      cb && cb(res)
    })
  },

  /**
   * 交互后 清空购物车单品
   */
  emptySingle () {
    globalData.sc.localDishs.singleFoods = []
  },

  /**
   * 清空购物车 所有数据
   */
  emptyCart(cb) {
    api.empty({}, res => {
      globalData.sc = { //购物车数据
        localDishs: { // 缓存本地未交互购物车数据
          singleFoods: [], // 单品
          condiments: [], // 套餐
        }
      }
      globalData.cartTotalPrice = 0
      globalData.order = {}
      globalData.orderId = ''
      cb && cb()
    })
  }
}