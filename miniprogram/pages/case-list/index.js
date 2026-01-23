// pages/case-list/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 案例分类
    categories: [
      { id: 'all', name: '全部' },
      { id: 'study', name: '学习提升' },
      { id: 'habit', name: '习惯养成' },
      { id: 'interest', name: '兴趣培养' },
      { id: 'psychology', name: '心理疏导' }
    ],

    // 当前分类
    currentCategory: 'all',

    // 案例列表
    caseList: [],

    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,

    loading: false
  },

  onLoad: function (options) {
    if (options.category) {
      this.setData({
        currentCategory: options.category
      })
    }
    this.loadCaseList()
  },

  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      hasMore: true,
      caseList: []
    })
    this.loadCaseList()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreCases()
    }
  },

  // 切换分类
  switchCategory: function (e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      page: 1,
      hasMore: true,
      caseList: []
    })
    this.loadCaseList()
  },

  // 加载案例列表
  loadCaseList: function () {
    this.setData({ loading: true })

    const db = wx.cloud.database()
    let query = {}
    if (this.data.currentCategory !== 'all') {
      query.category = this.data.currentCategory
    }

    db.collection('case').where(query)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        this.setData({
          caseList: res.data,
          loading: false,
          hasMore: false
        })
      })
      .catch(err => {
        console.error('加载案例失败', err)
        this.setData({ loading: false })
        wx.showToast({ title: '加载案例失败', icon: 'none' })
      })
  },

  // 加载更多案例
  loadMoreCases: function () {
    this.setData({
      page: this.data.page + 1
    })
    // 模拟没有更多数据
    this.setData({
      hasMore: false
    })
  },

  // 查看案例详情
  viewCaseDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/case-detail/index?id=' + id
    })
  },

  // 查看陪伴师详情
  viewTeacherDetail: function (e) {
    const id = e.currentTarget.dataset.teacherid
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + id
    })
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '智伴优程 - 成功案例',
      path: '/pages/case-list/index'
    }
  }
})
