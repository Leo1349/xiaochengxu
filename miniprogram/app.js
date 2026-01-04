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
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
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