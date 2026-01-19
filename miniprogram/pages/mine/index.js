// pages/mine/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 用户信息
    userInfo: null,
    isLoggedIn: false,
    currentRole: 'parent', // parent: 家长, teacher: 陪伴师

    // 家长端菜单
    parentMenuList: [
      {
        title: '我的服务',
        items: [
          { id: 'orders', icon: '/images/mine_v3/order_all.png', name: '我的订单', url: '/pages/order-list/index' },
          { id: 'children', icon: '/images/mine_v3/menu_child.png', name: '孩子信息', url: '/pages/child-info/index' },
          { id: 'cases', icon: '/images/mine_v3/menu_case.png', name: '成功案例', url: '/pages/case-list/index' }
        ]
      },
      {
        title: '其他服务',
        items: [
          { id: 'feedback', icon: '/images/mine_v3/menu_feedback.png', name: '意见反馈', url: '/pages/feedback/index' },
          { id: 'service', icon: '/images/mine_v3/menu_service.png', name: '联系客服', url: '/pages/customer-service/index' },
          { id: 'settings', icon: '/images/mine_v3/menu_settings.png', name: '设置', url: '/pages/settings/index' }
        ]
      }
    ],

    // 陪伴师端菜单
    teacherMenuList: [
      {
        title: '我的服务',
        items: [
          { id: 'resume', icon: '/images/mine_v3/menu_resume.png', name: '我的简历', url: '/pages/teacher-resume/index' },
          { id: 'orders', icon: '/images/mine_v3/order_all.png', name: '我的订单', url: '/pages/order-list/index' },
          { id: 'rebate', icon: '/images/mine_v3/menu_rebate.png', name: '返利中心', url: '/pages/rebate/index' }
        ]
      },
      {
        title: '其他服务',
        items: [
          { id: 'feedback', icon: '/images/mine_v3/menu_feedback.png', name: '意见反馈', url: '/pages/feedback/index' },
          { id: 'service', icon: '/images/mine_v3/menu_service.png', name: '联系客服', url: '/pages/customer-service/index' },
          { id: 'settings', icon: '/images/mine_v3/menu_settings.png', name: '设置', url: '/pages/settings/index' }
        ]
      }
    ],

    // 统计数据
    statistics: {
      orderCount: 0,
      childCount: 0,
      favoriteCount: 0
    },

    // 陪伴师统计
    teacherStatistics: {
      orderCount: 0,
      income: 0,
      rating: 0
    }
  },

  onLoad: function (options) {
    this.checkLoginStatus()
  },

  onShow: function () {
    this.checkLoginStatus()
    // 更新tabbar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    if (userInfo && token) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true,
        currentRole: userInfo.currentRole || 'parent'
      })
      this.loadStatistics()
    } else {
      this.setData({
        userInfo: null,
        isLoggedIn: false,
        currentRole: 'parent'
      })
    }
  },

  // 加载统计数据
  loadStatistics: function () {
    // 模拟数据
    if (this.data.currentRole === 'parent') {
      this.setData({
        statistics: {
          orderCount: 5,
          childCount: 2,
          favoriteCount: 8
        }
      })
    } else {
      this.setData({
        teacherStatistics: {
          orderCount: 28,
          income: 4200,
          rating: 4.9
        }
      })
    }
  },

  // 跳转到登录页
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/index'
    })
  },

  // 跳转到菜单页面
  goToPage: function (e) {
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }

    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  // 切换角色
  switchRole: function () {
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }

    const newRole = this.data.currentRole === 'parent' ? 'teacher' : 'parent'
    const userInfo = this.data.userInfo
    userInfo.currentRole = newRole

    this.setData({
      currentRole: newRole,
      userInfo: userInfo
    })

    wx.setStorageSync('userInfo', userInfo)

    this.loadStatistics()

    wx.showToast({
      title: newRole === 'parent' ? '已切换到家长模式' : '已切换到陪伴师模式',
      icon: 'none'
    })
  },

  // 编辑个人信息
  editProfile: function () {
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }
    wx.navigateTo({
      url: '/pages/settings/index?tab=profile'
    })
  },

  // 查看全部订单
  viewAllOrders: function () {
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }
    wx.navigateTo({
      url: '/pages/order-list/index'
    })
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '智伴优程 - 专业陪伴师平台',
      path: '/pages/index/index'
    }
  }
})
