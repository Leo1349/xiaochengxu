// pages/search/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 搜索关键词
    keyword: '',

    // 搜索历史
    searchHistory: [],

    // 热门搜索
    hotSearchList: [
      '数学辅导',
      '英语陪伴',
      '作业辅导',
      '钢琴陪练',
      '绘画启蒙',
      '阅读陪伴',
      '编程启蒙',
      '书法练习'
    ],

    // 搜索结果
    resultList: [],

    // 是否显示结果
    showResult: false,

    // 筛选栏展示文案（避免在 WXML 里做复杂表达式）
    serviceTypeLabel: '服务类型',
    sortByLabel: '综合排序',

    // 筛选条件
    filters: {
      serviceType: '',
      sortBy: 'default',
      priceRange: '',
      distance: ''
    },

    // 服务类型选项
    serviceTypes: [
      { id: '', name: '全部' },
      { id: 'study', name: '学习辅导' },
      { id: 'art', name: '艺术培养' },
      { id: 'sport', name: '运动陪伴' },
      { id: 'life', name: '生活陪伴' }
    ],

    // 排序选项
    sortOptions: [
      { id: 'default', name: '综合排序' },
      { id: 'rating', name: '评分最高' },
      { id: 'orders', name: '订单最多' },
      { id: 'price_asc', name: '价格从低到高' },
      { id: 'price_desc', name: '价格从高到低' }
    ],

    // 是否显示筛选面板
    showFilterPanel: false,
    activeFilter: '',

    // 加载状态
    loading: false,
    hasMore: true,
    pageNum: 1
  },

  onLoad: function (options) {
    // 加载搜索历史
    this.loadSearchHistory()

    // 初始化筛选展示文案
    this.updateFilterLabels()

    // 如果有传入关键词，直接搜索
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      })
      this.doSearch()
    }
  },

  // 加载搜索历史
  loadSearchHistory: function () {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({
      searchHistory: history
    })
  },

  // 保存搜索历史
  saveSearchHistory: function (keyword) {
    let history = wx.getStorageSync('searchHistory') || []

    // 去重
    const index = history.indexOf(keyword)
    if (index > -1) {
      history.splice(index, 1)
    }

    // 添加到开头
    history.unshift(keyword)

    // 最多保存10条
    if (history.length > 10) {
      history = history.slice(0, 10)
    }

    wx.setStorageSync('searchHistory', history)
    this.setData({
      searchHistory: history
    })
  },

  // 清空搜索历史
  clearHistory: function () {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({
            searchHistory: []
          })
        }
      }
    })
  },

  // 输入搜索关键词
  onInput: function (e) {
    this.setData({
      keyword: e.detail.value
    })

    if (!e.detail.value) {
      this.setData({
        showResult: false,
        resultList: []
      })
    }
  },

  // 清空输入
  clearInput: function () {
    this.setData({
      keyword: '',
      showResult: false,
      resultList: []
    })
  },

  // 点击搜索
  onSearch: function () {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return
    }

    this.doSearch()
  },

  // 点击历史/热门标签
  onTagTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({
      keyword: keyword
    })
    this.doSearch()
  },

  // 执行搜索
  doSearch: function () {
    const keyword = this.data.keyword.trim()
    if (!keyword) return

    // 保存搜索历史
    this.saveSearchHistory(keyword)

    this.setData({
      loading: true,
      showResult: true,
      pageNum: 1,
      resultList: []
    })

    const db = wx.cloud.database()
    const _ = db.command

    // 构建查询条件
    db.collection('teachers').where(_.or([
      { name: db.RegExp({ regexp: keyword, options: 'i' }) },
      { tags: db.RegExp({ regexp: keyword, options: 'i' }) },
      { title: db.RegExp({ regexp: keyword, options: 'i' }) }
    ])).get().then(res => {
      const results = res.data.map(item => ({
        id: item._id,
        name: item.name,
        avatar: item.avatar || '/images/default_teacher_avatar.png',
        title: item.title,
        rating: item.rating || 5.0,
        orders: item.orderCount || 0,
        price: item.price,
        priceUnit: item.priceUnit || '小时',
        tags: item.tags || [],
        distance: '未知'
      }))

      this.setData({
        resultList: results,
        loading: false,
        hasMore: false
      })
    }).catch(err => {
      console.error('搜索失败', err)
      this.setData({ loading: false })
      wx.showToast({ title: '搜索失败', icon: 'none' })
    })
  },

  // 加载更多
  loadMore: function () {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({
      loading: true,
      pageNum: this.data.pageNum + 1
    })

    setTimeout(() => {
      this.setData({
        loading: false,
        hasMore: false
      })
    }, 500)
  },

  // 显示筛选面板
  showFilter: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      showFilterPanel: true,
      activeFilter: type
    })
  },

  // 隐藏筛选面板
  hideFilter: function () {
    this.setData({
      showFilterPanel: false,
      activeFilter: ''
    })
  },

  // 选择筛选项
  selectFilterOption: function (e) {
    const type = this.data.activeFilter
    const value = e.currentTarget.dataset.value

    this.setData(
      {
        ['filters.' + type]: value,
        showFilterPanel: false,
        activeFilter: ''
      },
      () => {
        this.updateFilterLabels()

        // 重新搜索
        if (this.data.keyword) {
          this.doSearch()
        }
      }
    )
  },

  // 更新筛选栏展示文案
  updateFilterLabels: function () {
    const filters = this.data.filters

    let serviceTypeLabel = '服务类型'
    if (filters.serviceType) {
      for (let i = 0; i < this.data.serviceTypes.length; i++) {
        const opt = this.data.serviceTypes[i]
        if (opt.id === filters.serviceType) {
          serviceTypeLabel = opt.name
          break
        }
      }
    }

    let sortByLabel = '综合排序'
    for (let i = 0; i < this.data.sortOptions.length; i++) {
      const opt = this.data.sortOptions[i]
      if (opt.id === filters.sortBy) {
        sortByLabel = opt.name
        break
      }
    }

    this.setData({
      serviceTypeLabel,
      sortByLabel
    })
  },

  // 查看老师详情
  viewTeacher: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + id
    })
  },

  // 返回
  goBack: function () {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  }
})
