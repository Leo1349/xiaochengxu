// pages/teacher-detail/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 陪伴师ID
    teacherId: null,
    
    // 陪伴师信息
    teacher: null,
    
    // 服务列表
    services: [],
    
    // 评价列表
    reviews: [],
    
    // 成功案例
    cases: [],
    
    // 当前Tab
    currentTab: 'info', // info: 简介, service: 服务, review: 评价, case: 案例
    
    // 是否已收藏
    isFavorite: false,
    
    // 加载状态
    loading: true
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        teacherId: options.id
      })
      this.loadTeacherDetail(options.id)
    }
  },

  // 加载陪伴师详情
  loadTeacherDetail: function(id) {
    this.setData({ loading: true })
    
    // 调用云函数获取详情
    wx.cloud.callFunction({
      name: 'getTeacherDetail',
      data: { id: id },
      success: res => {
        if (res.result.success) {
          const { teacher, reviews, services, cases } = res.result.data
          
          // 格式化老师数据
          const formattedTeacher = {
            ...teacher,
            id: teacher._id // 确保 id 字段存在
          }

          this.setData({
            teacher: formattedTeacher,
            reviews: reviews,
            services: services,
            cases: cases,
            loading: false
          })
        } else {
          console.error('获取详情失败', res.result.message)
          this.useMockData(id)
        }
      },
      fail: err => {
        console.error('调用云函数失败', err)
        this.useMockData(id)
      }
    })
  },

  // 降级使用模拟数据
  useMockData: function(id) {
    // 模拟数据
    const mockTeacher = {
      id: id,
      name: '张老师',
      avatar: '/images/avatar.png',
      title: '专业陪伴师',
      rating: 4.9,
      orderCount: 128,
      tags: ['学科辅导', '耐心细致', '经验丰富'],
      price: 150,
      priceUnit: '小时',
      introduction: '5年教育经验，擅长小学全科辅导，曾任某知名培训机构主讲老师。对待孩子有爱心、有耐心，善于发现孩子的优点并加以引导。',
      education: '北京师范大学 教育学硕士',
      experience: '5年教育行业经验',
      certificates: ['教师资格证', '心理咨询师证'],
      serviceTime: '周一至周五 14:00-20:00，周末全天',
      serviceArea: '北京市海淀区、朝阳区',
      photos: [
        '/images/ai_example1.png',
        '/images/ai_example2.png',
        '/images/cloud_dev.png'
      ]
    }
    
    const mockServices = [
      { id: 1, name: '学科辅导', price: 150, unit: '小时', description: '小学全科、初中数学英语辅导' },
      { id: 2, name: '作业陪伴', price: 100, unit: '小时', description: '陪伴孩子完成作业，培养良好学习习惯' },
      { id: 3, name: '兴趣培养', price: 120, unit: '小时', description: '绘画、书法等兴趣爱好培养' }
    ]
    
    const mockReviews = [
      {
        id: 1,
        userName: '小明妈妈',
        userAvatar: '/images/avatar.png',
        rating: 5,
        content: '张老师非常有耐心，孩子很喜欢，学习成绩也有明显进步！',
        time: '2025-12-28',
        serviceName: '学科辅导'
      },
      {
        id: 2,
        userName: '乐乐爸爸',
        userAvatar: '/images/avatar.png',
        rating: 5,
        content: '老师很专业，对孩子很有方法，推荐！',
        time: '2025-12-25',
        serviceName: '作业陪伴'
      },
      {
        id: 3,
        userName: '小红妈妈',
        userAvatar: '/images/avatar.png',
        rating: 4,
        content: '服务态度好，孩子的学习习惯有所改善。',
        time: '2025-12-20',
        serviceName: '习惯养成'
      }
    ]
    
    const mockCases = [
      {
        id: 1,
        title: '帮助小学生提高数学成绩30分',
        cover: '/images/ai_example1.png',
        description: '通过3个月的辅导，学生数学成绩从60分提高到90分'
      },
      {
        id: 2,
        title: '培养孩子良好的阅读习惯',
        cover: '/images/ai_example2.png',
        description: '引导孩子爱上阅读，每天坚持阅读30分钟'
      }
    ]
    
    this.setData({
      teacher: mockTeacher,
      services: mockServices,
      reviews: mockReviews,
      cases: mockCases,
      loading: false
    })
  },

  // 切换Tab
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 收藏/取消收藏
  toggleFavorite: function() {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后收藏',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }
        }
      })
      return
    }
    
    this.setData({
      isFavorite: !this.data.isFavorite
    })
    
    wx.showToast({
      title: this.data.isFavorite ? '收藏成功' : '已取消收藏',
      icon: 'success'
    })
  },

  // 联系陪伴师
  contactTeacher: function() {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后联系',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }
        }
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/chat/index?teacherId=' + this.data.teacherId
    })
  },

  // 立即预约
  bookNow: function(e) {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后预约',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }
        }
      })
      return
    }
    
    const serviceId = e.currentTarget.dataset.serviceid || ''
    wx.navigateTo({
      url: '/pages/order-confirm/index?teacherId=' + this.data.teacherId + '&serviceId=' + serviceId
    })
  },

  // 查看案例详情
  viewCaseDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/case-detail/index?id=' + id
    })
  },

  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.teacher.photos
    })
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: this.data.teacher ? this.data.teacher.name + ' - 智伴家专业陪伴师' : '智伴家专业陪伴师',
      path: '/pages/teacher-detail/index?id=' + this.data.teacherId,
      imageUrl: this.data.teacher ? this.data.teacher.avatar : ''
    }
  }
})
