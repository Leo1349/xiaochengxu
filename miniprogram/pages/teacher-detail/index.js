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

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        teacherId: options.id
      })
      this.loadTeacherDetail(options.id)
      this.checkFavoriteStatus()
    }
  },

  // 加载陪伴师详情
  loadTeacherDetail: function (id) {
    this.setData({ loading: true })

    // 调用云函数获取详情
    wx.cloud.callFunction({
      name: 'getTeacherDetail',
      data: { id: id },
      success: res => {
        if (res.result.success) {
          const { teacher, reviews, services, cases } = res.result.data

          // 格式化老师数据
          let avatarUrl = teacher.avatar;
          if (!avatarUrl || avatarUrl === '/images/avatar.png' || avatarUrl === '/images/icons/default-avatar.png') {
            avatarUrl = '/images/default_teacher_avatar.png';
          }

          const formattedTeacher = {
            ...teacher,
            id: teacher._id, // 确保 id 字段存在
            avatar: avatarUrl
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
          wx.showToast({ title: '获取详情失败', icon: 'none' })
          this.setData({ loading: false })
        }
      },
      fail: err => {
        console.error('调用云函数失败', err)
        wx.showToast({ title: '网络错误', icon: 'none' })
        this.setData({ loading: false })
      }
    })
  },

  // 切换Tab
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 收藏/取消收藏
  toggleFavorite: function () {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (!token || !userInfo) {
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

    const db = wx.cloud.database()
    const that = this

    if (this.data.isFavorite) {
      // 取消收藏
      db.collection('favorite_teachers')
        .where({
          userId: userInfo._id,
          teacherId: this.data.teacherId
        })
        .remove()
        .then(() => {
          that.setData({ isFavorite: false })
          wx.showToast({ title: '已取消收藏', icon: 'success' })
        })
        .catch(err => {
          console.error('取消收藏失败', err)
          wx.showToast({ title: '操作失败', icon: 'none' })
        })
    } else {
      // 添加收藏
      const teacher = this.data.teacher
      db.collection('favorite_teachers')
        .add({
          data: {
            userId: userInfo._id,
            teacherId: this.data.teacherId,
            name: teacher.name,
            avatar: teacher.avatar,
            title: teacher.title || '专业陪伴师',
            tags: teacher.tags || [],
            createTime: db.serverDate()
          }
        })
        .then(() => {
          that.setData({ isFavorite: true })
          wx.showToast({ title: '收藏成功', icon: 'success' })
        })
        .catch(err => {
          console.error('收藏失败', err)
          wx.showToast({ title: '操作失败', icon: 'none' })
        })
    }
  },

  // 检查是否已收藏
  checkFavoriteStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo._id) return

    const db = wx.cloud.database()
    db.collection('favorite_teachers')
      .where({
        userId: userInfo._id,
        teacherId: this.data.teacherId
      })
      .count()
      .then(res => {
        this.setData({ isFavorite: res.total > 0 })
      })
      .catch(err => {
        console.error('检查收藏状态失败', err)
      })
  },

  // 联系陪伴师
  contactTeacher: function () {
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
  bookNow: function (e) {
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
  viewCaseDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/case-detail/index?id=' + id
    })
  },

  // 预览图片
  previewImage: function (e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.teacher.photos
    })
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: this.data.teacher ? this.data.teacher.name + ' - 智伴优程专业陪伴师' : '智伴优程专业陪伴师',
      path: '/pages/teacher-detail/index?id=' + this.data.teacherId,
      imageUrl: this.data.teacher ? this.data.teacher.avatar : ''
    }
  }
})
