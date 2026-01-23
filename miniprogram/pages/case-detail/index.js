// pages/case-detail/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 案例ID
    caseId: null,

    // 案例详情
    caseInfo: null,

    // 是否已点赞
    isLiked: false,

    // 是否已收藏
    isFavorite: false,

    loading: true
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        caseId: options.id
      })
      this.loadCaseDetail(options.id)
      this.checkFavoriteStatus()
    }
  },

  // 加载案例详情
  loadCaseDetail: function (id) {
    this.setData({ loading: true })

    const db = wx.cloud.database()
    db.collection('case').doc(id).get().then(res => {
      this.setData({
        caseInfo: res.data,
        loading: false
      })
    }).catch(err => {
      console.error('获取案例详情失败', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  // 点赞
  toggleLike: function () {
    const isLiked = !this.data.isLiked
    const caseInfo = this.data.caseInfo

    if (isLiked) {
      caseInfo.likeCount++
    } else {
      caseInfo.likeCount--
    }

    this.setData({
      isLiked: isLiked,
      caseInfo: caseInfo
    })

    wx.showToast({
      title: isLiked ? '点赞成功' : '已取消点赞',
      icon: 'success'
    })
  },

  // 收藏
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
    const caseInfo = this.data.caseInfo

    if (this.data.isFavorite) {
      // 取消收藏
      db.collection('favorite_cases')
        .where({
          userId: userInfo._id,
          caseId: this.data.caseId
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
      db.collection('favorite_cases')
        .add({
          data: {
            userId: userInfo._id,
            caseId: this.data.caseId,
            title: caseInfo.title,
            summary: caseInfo.summary || '',
            cover: caseInfo.cover || '',
            teacherName: caseInfo.teacher ? caseInfo.teacher.name : '',
            teacherAvatar: caseInfo.teacher ? caseInfo.teacher.avatar : '',
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
    db.collection('favorite_cases')
      .where({
        userId: userInfo._id,
        caseId: this.data.caseId
      })
      .count()
      .then(res => {
        this.setData({ isFavorite: res.total > 0 })
      })
      .catch(err => {
        console.error('检查收藏状态失败', err)
      })
  },

  // 查看陪伴师详情
  viewTeacherDetail: function () {
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + this.data.caseInfo.teacher.id
    })
  },

  // 预约陪伴师
  bookTeacher: function () {
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

    wx.navigateTo({
      url: '/pages/order-confirm/index?teacherId=' + this.data.caseInfo.teacher.id
    })
  },

  // 预览图片
  previewImage: function (e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.caseInfo.images
    })
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: this.data.caseInfo ? this.data.caseInfo.title : '智伴优程成功案例',
      path: '/pages/case-detail/index?id=' + this.data.caseId,
      imageUrl: this.data.caseInfo ? this.data.caseInfo.cover : ''
    }
  }
})
