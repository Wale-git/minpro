// components/storechoose/storechoose.js
import util from '../../common/utils/util.js'
let gbData = getApp().globalData
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    store: {
      type: Object,
      observer: function(val, old) {
        this.getStoreTime()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    orderType: 1,
    hourArr: ['00', '01','02','03','04','05','06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
    minutsArr: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭订餐选择
    close() {
      this.triggerEvent('close')
    },
    // 选择订餐方式
    chooseOrderType(e) {
      let type = e.currentTarget.dataset.type
      if (type == 1) {
        gbData.preTimestamp = ''
      }
      this.setData({
        orderType: type
      })
    },
    // "确定"
    goMenu() {
      if (this.data.orderType == 2) { // 预约点餐
        let str = ''
        if (this.data.choosedHour && this.data.choosedMinute) {
          str = this.data.choosedHour + ':' + this.data.choosedMinute + ':00'
        } else {
          str = this.data.canDoHour[0] + ':' + this.data.minutsArr[0] + ':00'
        }
        
        let timeStamp = util.getTimeStamp(str)
        gbData.preTimestamp = timeStamp
      }
      getApp().backToPage('pages/menu/menu', { storecode: this.properties.store.storecode })
    },

    /**
     * 获取餐厅时间
     */
    getStoreTime () {
      const hourArr = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
      const minutsArr = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

      let startTime = gbData.chooseStore.starttime
      let endTime = gbData.chooseStore.endtime
      
      let startTimeHour = startTime.split(':')[0]
      let startTimeMinute = startTime.split(':')[1]
      let endTimeHour = endTime.split(':')[0]
      let endTimeMinute = endTime.split(':')[1]
      
      let curHour = new Date().getHours()
      let timeTmp = new Date().getMinutes() + 15
      let overFlag = false
      if (timeTmp > 60) {
        overFlag = true
      }
      let curMinute = timeTmp > 60 ? timeTmp - 60 : timeTmp

      let jugeStartHour = startTimeHour > curHour ? startTimeHour : curHour
      let jugeEndHour = endTimeHour > curHour ? endTimeHour : curHour

      let canDoHour = hourArr.filter(hour => { // 可选餐时间小时
        if (hour >= jugeStartHour && hour <= jugeEndHour) {
          return true
        }
      })

      let jugeStartMinute = 0
      let jugeEndMinute = endTimeMinute > curMinute ? endTimeMinute : curMinute
      if (canDoHour[0] > startTimeHour) {
        jugeStartMinute = curMinute
        if (overFlag) {
          canDoHour.splice(0, 1)
        }
      } else {
        jugeStartMinute = startTimeMinute > curMinute ? startTimeMinute : curMinute
      }

      let canDoMinuteBefore = minutsArr.filter(minute => { // 开始时间点后可选分钟数
        if (minute >= jugeStartMinute) {
          return true
        }
      })

      let canDoMinuteAfter = minutsArr.filter(minute => { // 结束时间点之前的可选分钟数
        if (minute <= jugeEndMinute) {
          return true
        }
      })
      if (!canDoMinuteBefore || canDoMinuteBefore.length == 0) {
        canDoHour.splice(0, 1)
      }

      this.setData({
        canDoHour: canDoHour,
        canDoMinuteBefore: canDoMinuteBefore,
        canDoMinuteAfter: canDoMinuteAfter,
        allMinitesArr: minutsArr,
        minutsArr: canDoMinuteBefore.length > 0 ? canDoMinuteBefore : minutsArr,
      })
    },

    /**
     * 时间选择结束
     */
    pickEnd(e) {
      const val = e.detail.value
      let canDoHour = this.data.canDoHour
      let canDoMinuteBefore = this.data.canDoMinuteBefore
      let canDoMinuteAfter = this.data.canDoMinuteAfter

      const minutsArr = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

      let choosedHour = canDoHour[val[0]]
      if (choosedHour == canDoHour[0]) {
        this.setData({
          minutsArr: canDoMinuteBefore.length > 0 ? canDoMinuteBefore : minutsArr
        })
      } else if (choosedHour == canDoHour[canDoHour.length - 1]) {
        this.setData({
          minutsArr: canDoMinuteAfter
        })
      } else {
        this.setData({
          minutsArr: this.data.allMinitesArr
        })
      }

      let choosedMinute = this.data.minutsArr[val[1]]

      this.setData({
        choosedHour: choosedHour || '',
        choosedMinute: choosedMinute || ''
      })
    },
  }
})
