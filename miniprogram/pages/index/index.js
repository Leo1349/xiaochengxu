// pages/index/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,

    // 轮播图
    bannerList: [
      { id: 1, image: '/images/banner1.jpg', url: '' },
      { id: 2, image: '/images/banner2.jpg', url: '' },
      { id: 3, image: '/images/banner3.jpg', url: '' }
    ],

    // 功能入口
    menuList: [
      { id: 1, icon: '/images/icons_v3/nav_find_tutor.png', name: '找陪伴师', url: '/pages/search/index' },
      { id: 2, icon: '/images/icons_v3/nav_orders.png', name: '我的订单', url: '/pages/order-list/index' },
      { id: 3, icon: '/images/icons_v3/nav_child.png', name: '孩子信息', url: '/pages/child-info/index' },
      { id: 4, icon: '/images/icons_v3/nav_cases.png', name: '成功案例', url: '/pages/case-list/index' }
    ],

    // 推荐陪伴师列表
    teacherList: [],

    // 服务类型
    serviceTypes: [
      { id: 1, name: '学科辅导', icon: '/images/icons_v3/service_subject.png' },
      { id: 2, name: '兴趣培养', icon: '/images/icons_v3/service_interest.png' },
      { id: 3, name: '习惯养成', icon: '/images/icons_v3/service_habit.png' },
      { id: 4, name: '心理疏导', icon: '/images/icons_v3/service_psych.png' }
    ],

    // 页面状态
    loading: false,

    // 公告
    notice: '欢迎使用智伴优程，专业陪伴师为您的孩子提供一对一陪伴服务！'
  },

  onLoad: function (options) {
    this.checkLoginStatus()
    this.loadTeacherList()
  },

  onShow: function () {
    this.checkLoginStatus()
    // 更新tabbar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  onPullDownRefresh: function () {
    this.loadTeacherList()
    wx.stopPullDownRefresh()
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    if (userInfo && token) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      })
    } else {
      this.setData({
        userInfo: null,
        isLoggedIn: false
      })
    }
  },

  // 加载推荐陪伴师列表
  loadTeacherList: function () {
    this.setData({ loading: true })

    // 调用云函数获取首页数据
    wx.cloud.callFunction({
      name: 'getHomeData',
      data: {},
      success: res => {
        if (res.result.success) {
          const { banners, recommendTeachers } = res.result.data

          // 格式化 Banner 数据以适配前端
          const formattedBanners = banners.map(item => {
            return {
              id: item._id,
              image: item.image, // 直接使用数据库中的图片字段
              url: item.url || ''
            };
          })

          // 格式化老师数据以适配前端
          const formattedTeachers = recommendTeachers.map(item => {
            // 根据性别选择默认头像
            let avatarUrl = item.avatar;
            if (!avatarUrl || avatarUrl === '/images/avatar.png' || avatarUrl === '/images/icons/default-avatar.png') {
              // 根据性别使用不同的默认头像
              avatarUrl = item.gender === 'male'
                ? '/images/avatars/teacher-male-default.png'
                : '/images/avatars/teacher-female-default.png';
            }

            return {
              id: item._id, // 使用数据库的 _id
              name: item.name,
              avatar: avatarUrl,
              title: item.title,
              rating: item.rating,
              orderCount: item.orderCount,
              tags: item.tags,
              price: item.price,
              priceUnit: item.priceUnit,
              introduction: item.introduction
            };
          })

          this.setData({
            bannerList: formattedBanners.length > 0 ? formattedBanners : this.data.bannerList,
            teacherList: formattedTeachers,
            loading: false
          })
        } else {
          console.error('获取首页数据失败', res.result.error)
          this.useMockData() // 降级使用模拟数据
        }
      },
      fail: err => {
        console.error('调用云函数失败', err)
        this.useMockData() // 降级使用模拟数据
      }
    })
  },

  // 降级使用模拟数据
  useMockData: function () {
    const mockTeachers = [
      {
        id: 1,
        name: '张老师',
        avatar: '/images/avatars/teacher-male-default.png',
        title: '专业陪伴师',
        rating: 4.9,
        orderCount: 128,
        tags: ['学科辅导', '耐心细致'],
        price: 150,
        introduction: '5年教育经验，擅长小学全科辅导'
      },
      {
        id: 2,
        name: '李老师',
        avatar: '/images/avatars/teacher-female-default.png',
        title: '金牌陪伴师',
        rating: 5.0,
        orderCount: 256,
        tags: ['兴趣培养', '习惯养成'],
        price: 200,
        introduction: '专注儿童习惯养成，帮助孩子建立良好学习习惯'
      },
      {
        id: 3,
        name: '王老师',
        avatar: '/images/avatars/teacher-female-default.png',
        title: '高级陪伴师',
        rating: 4.8,
        orderCount: 89,
        tags: ['心理疏导', '亲子沟通'],
        price: 180,
        priceUnit: '小时',
        introduction: '心理学专业背景，善于与孩子沟通交流'
      }
    ]

    this.setData({
      teacherList: mockTeachers,
      loading: false
    })
  },

  // 跳转到搜索页
  goToSearch: function () {
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },

  // 跳转到陪伴师详情
  goToTeacherDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + id
    })
  },

  // 跳转到登录页
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/index'
    })
  },

  // 跳转到菜单页面
  goToMenu: function (e) {
    const url = e.currentTarget.dataset.url
    if (!this.data.isLoggedIn && url !== '/pages/case-list/index') {
      this.goToLogin()
      return
    }
    wx.navigateTo({
      url: url
    })
  },

  // 跳转到服务类型
  goToServiceType: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/search/index?typeId=' + id
    })
  },

  // 轮播图点击
  onBannerTap: function (e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url: url
      })
    }
  },

  // 查看更多陪伴师
  viewMoreTeachers: function () {
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '智伴优程 - 专业陪伴师平台',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  }
})
