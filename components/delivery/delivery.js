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
    },
    deliveryInfo: {
      type: Object,
      observer: function (val, old) {
        if(old){
          this.setData({
            userName: val.userName,
            address: val.address,
            addressDetail: val.addressDetail,
            phone: val.phone
          })
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    addedMoney: 0,
    minutsArr: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
    pickIndex: 0,
    userName: '',
    address: '',
    addressDetail: '',
    phone: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.triggerEvent('close')
    },
    inputName(e) {
      this.setData({
        userName: e.detail.value
      })
    },
    inputPhone(e) {
      this.setData({
        phone: e.detail.value
      })
    },
    inputAddDetail(e) {
      this.setData({
        addressDetail: e.detail.value
      })
    },
    bindChange(e){
      let minutsArr = this.data.minutsArr
      this.setData({
        address: minutsArr[e.detail.value]
      })
    },
    /**
     * 提交推荐商品
     */
    confirm(e) {
      let userName = this.data.userName
      let addressDetail = this.data.addressDetail
      let phone = this.data.phone
      let address = this.data.address
      

      let param = {
        userName: userName,
        phone: phone,
        address: address,
        addressDetail: addressDetail
      }
      gbData.deliveryInfo = param
      this.triggerEvent('close')
    },
    /**
    * 选择picker
    */
    pickEnd(e) {
      const val = e.detail.value
      let canDoMinuteBefore = this.data.canDoMinuteBefore
      let canDoMinuteAfter = this.data.canDoMinuteAfter
      const minutsArr = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
      this.setData({
        minutsArr: minutsArr
      })
      let choosedMinute = this.data.minutsArr[val[0]]

      this.setData({
        choosedMinute: choosedMinute || ''
      })
    },
  }
})
