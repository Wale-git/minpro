// pages/invoice/invoice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    linkedUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let url = decodeURIComponent(options.linkedUrl)
    this.setData({
      linkedUrl: url
    }) 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindmessage: function (e) {
    console.log(e)
  }
})