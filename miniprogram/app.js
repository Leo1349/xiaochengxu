// app.js
App({
  onLaunch: function () {
    this.globalData = {
      env: '',
      userInfo: null,
      userRole: null, // 'parent' 或 'teacher'
      isLoggedIn: false,
      openId: null,
    };

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }

    this.checkLoginStatus();
  },

  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.userRole = userRole;
      this.globalData.isLoggedIn = true;
    }
  },

  setUserInfo: function (userInfo, role) {
    this.globalData.userInfo = userInfo;
    this.globalData.userRole = role;
    this.globalData.isLoggedIn = true;
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('userRole', role);
  },

  logout: function () {
    this.globalData.userInfo = null;
    this.globalData.userRole = null;
    this.globalData.isLoggedIn = false;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userRole');
  },

  getRoleName: function () {
    return this.globalData.userRole === 'teacher' ? '陪伴师' : '家长';
  },
});