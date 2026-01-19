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

    // 模拟数据
    const mockCases = [
      {
        id: 1,
        category: 'study',
        title: '帮助小学生数学成绩提升30分',
        cover: '/images/ai_example1.png',
        summary: '通过3个月的系统辅导，学生从60分提升到90分，掌握了正确的学习方法',
        teacher: {
          name: '张老师',
          avatar: '/images/avatar.png'
        },
        viewCount: 1280,
        likeCount: 356,
        createTime: '2025-12-20'
      },
      {
        id: 2,
        category: 'habit',
        title: '培养孩子良好的阅读习惯',
        cover: '/images/ai_example2.png',
        summary: '引导孩子爱上阅读，从抵触看书到每天主动阅读30分钟',
        teacher: {
          name: '李老师',
          avatar: '/images/avatar.png'
        },
        viewCount: 986,
        likeCount: 267,
        createTime: '2025-12-15'
      },
      {
        id: 3,
        category: 'psychology',
        title: '帮助内向孩子建立自信',
        cover: '/images/cloud_dev.png',
        summary: '通过耐心引导和鼓励，帮助孩子克服社交恐惧，变得开朗自信',
        teacher: {
          name: '王老师',
          avatar: '/images/avatar.png'
        },
        viewCount: 756,
        likeCount: 198,
        createTime: '2025-12-10'
      },
      {
        id: 4,
        category: 'interest',
        title: '发现孩子的绘画天赋',
        cover: '/images/database.png',
        summary: '挖掘孩子兴趣，系统培养绘画技能，作品获得区级比赛一等奖',
        teacher: {
          name: '赵老师',
          avatar: '/images/avatar.png'
        },
        viewCount: 654,
        likeCount: 178,
        createTime: '2025-12-05'
      },
      {
        id: 5,
        category: 'study',
        title: '英语口语从零基础到流利对话',
        cover: '/images/default-goods-image.png',
        summary: '采用沉浸式教学方法，6个月内实现英语口语的质的飞跃',
        teacher: {
          name: '孙老师',
          avatar: '/images/avatar.png'
        },
        viewCount: 543,
        likeCount: 145,
        createTime: '2025-12-01'
      }
    ]

    setTimeout(() => {
      // 根据分类筛选
      let filteredCases = mockCases
      if (this.data.currentCategory !== 'all') {
        filteredCases = mockCases.filter(c => c.category === this.data.currentCategory)
      }

      this.setData({
        caseList: filteredCases,
        loading: false,
        hasMore: false
      })
    }, 500)
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
