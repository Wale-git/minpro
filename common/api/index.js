 var ajax = require('./ajax').ajax
module.exports = {
  /**
   * login
   */
  miniLogin: function (param, cb) {
    ajax('weChatLogin/miniprogramLogin.do', 'POST', param, cb)
  },

  /**
   * 获取服务用户
   */
  getUserInfo(param, cb) {
    ajax('weChatLogin/getUserInfo.do', 'POST', param, cb)
  },

  /**
   * 根据经纬度获取城市信息
   * @returns {AxiosPromise}
   */
  getCityByRgeoCode: function (param, cb) {
    ajax('misc/search/getCityByRgeoCode', 'POST', param, cb)
  },

  /**
   * menu/getMenuByStore.do
   */
  getMenuByStore(param, cb) {
    ajax('menu/getMenuByStore.do', 'POST', param, cb);
  },

  /**
   * 菜单加载
   */
  create(param, cb) {
    ajax('order/create.do', 'POST', param, cb);
  },

  /**
   * menu/getMealDeal
   */
  getMealDeal(param, cb) {
    ajax('menu/getMealDeal.do', 'POST', param, cb);
  },

  /**
   * 清空购物车
   */
  empty(param, cb) {
    ajax('order/empty.do', 'POST', param, cb);
  },

  /**
   * 购物车交互
   */
  confirm(param, cb) {
    ajax('order/confirm.do', 'POST', param, cb);
  },

  /**
   * 选好了
   */
  save(param, cb) {
    ajax('order/save.do', 'POST', param, cb);
  },

  saveFormIds(param, cb) {
    ajax('order/saveFormIds.do', 'POST', param, cb);
  },

  /**********          store     *************/
  /**
   *   根据城市code获取餐厅  
   */
  searchAllStoresByCityCode(param, cb) {
    ajax('misc/store/search/searchAllStoresByCityCode.do', 'POST', param, cb);
  },

  /**
   * validStore
   */

  validStore(param, cb) {
    ajax('misc/store/valid/validStore.do', 'POST', param, cb);
  },

  /**
   * 获取历史点餐的店
   */

  getOrderedStoreList(param, cb) {
    ajax('misc/store/search/getOrderedStoreList.do', 'POST', param, cb);
  },

  /**
   * 关键词搜店
   */
  searchAllStoresByCityCodeAndKeyword(param, cb) {
    ajax('misc/store/search/searchAllStoresByCityCodeAndKeyword.do', 'POST', param, cb);
  },


  /*******************************结算********************************/
  /**
   * 支付
   */
  getPaymentUrl(param, cb) {
    ajax('payment/getPaymentUrl.do', 'POST', param, cb);
  },
  

  /*******************************订单***************************** */
  orderlist(param, cb) {
    ajax('order/orderlist.do', 'POST', param, cb);
  },

  /**
   * 取消订单
   */
  cancleOrder(param, cb) {
    ajax('order/cancleOrder.do', 'POST', param, cb);
  },
  
  /**
   * 订单  签到
   */
  placeOrder(param, cb) {
    ajax('order/placeOrder.do', 'POST', param, cb);
  },

  /**
   * 订单状态
   */
  orderStatus (param, cb) {
    ajax('order/status.do', 'POST', param, cb);
  },
  
  /**
   * 取消订单  发起退款
   */
  quitOrder(param, cb) {
    ajax('payment/quitOrder.do', 'POST', param, cb);
  },

  /**************************优惠券**************************** */

  /**
   * order/usePromotion.do
   */
  usePromotion(param, cb) {
    ajax('order/usePromotion.do', 'POST', param, cb);
  },

  /**
   * 获取电子发票URL
   */
  getInvoiceUrl(param, cb) {
    ajax('customer/getInvoiceUrl.do', 'POST', param, cb);
  },
   /**
   * 自动注册会员
   */
  registerWithCardType(param, cb) {
    ajax('customer/registerWithCardType.do', 'POST', param, cb);
  },
  /**
  * 根据gps获取城市列表 
  */
  gpscity: function (param, cb) {
    ajax('misc/search/gpscity.do', 'POST', param, cb)
  },
}