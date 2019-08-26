// pages/bms/bms.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imei: '',
    toView: 'red',
    scrollTop: 100,
    batteryVariation: "",
    batteryInfo: {},
    vlistText:  "电池"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imei: options.imei
    })
    this.getBatteryStatus();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getBatteryStatus () {
    const that = this;
    const url = "https://litin.gpsoo.net/1/devices/search"
    wx.request({
      url: url,
      data: {
        method: "dev_pass_info",
        imei: this.data.imei,
        access_token: app.globalData.accessToken,
        access_type: "inner"
      },
      success: (res) => {
        if (res.data.errcode ==0) {
          if (!res.data.data[0].info) {
            wx.showToast({
              title: '无电池信息',
              icon: 'none',
              duration: 1000
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              });
            }, 2000);
            return
          }
          var obj = JSON.parse(res.data.data[0].info);
          var percentage = obj.rel_capacity;
          if (percentage * 100 < 15) {
            that.setData({
              batteryVariation: 
                "height:" +  (143 * percentage) + "px;" + 
                'background-Color: #D82E42;'
            })
          } else {
            that.setData({
              batteryVariation: "height:" + (143 * percentage) + "px;" +
                'background-Color: #2CDB61;'
            })
          }
          this.setData({
            batteryInfo: obj
          })
        } else {
          wx.showToast({
            title: "获取电池信息失败，请稍后重试",
            icon: 'none'
          })
        }
      }
    })
  },
  checkOrderResult (id) {
    const url = "https://litin.gmiot.net/1/devices/search?access_type=inner&method=get_response&imei=" + this.data.imei + "&id=" + id + "&access_token=" + app.globalData.accessToken
    wx.request({
      url: url,
      success: res => {
        if (res.data.errcode == 0) {
          if (res.data.data.response) {
            wx.showToast({
              title: res.data.data.response
            })
            this.getBatteryStatus();
          } else {
            setTimeout(() => {
              this.checkOrderResult(id);
            }, 1000);
          }
        }
      }
    })
  },
  batterySwitch () { 
    let data;
    if (this.data.batteryInfo.mos) {
      data = encodeURIComponent("RELAY,0#");
    } else {
      data = encodeURIComponent("RELAY,1#");
    }
    const url = "https://litin.gmiot.net/1/devices/search?method=sendDirectOrder&access_type=inner&imei=" + this.data.imei + "&order_content=" + data + "&access_token=" + app.globalData.accessToken
    wx.request({
      url: url,
      success: (res) => {
        if (res.data.errcode == 0) {
          this.checkOrderResult(res.data.data.id)
        }
      }
    })
  }
})