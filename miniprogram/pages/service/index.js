// pages/service/index.js
const app = getApp()

Page({
  data: {
    // 顶部快捷入口
    quickTabs: [
      { id: 1, name: '我的陪伴师', url: '/pages/search/index' },
      { id: 2, name: '我的订单', url: '/pages/order-list/index' },
      { id: 3, name: '孩子信息', url: '/pages/child-info/index' },
      { id: 4, name: '成功案例', url: '/pages/case-list/index' }
    ],

    activeQuickTab: 1,

    // 服务类型列表
    serviceTypes: [
      {
        id: 1,
        name: '学科辅导',
        icon: '/images/icons/goods.png',
        description: '专业老师一对一辅导，提升学习成绩',
        subTypes: ['语文', '数学', '英语', '物理', '化学', '生物']
      },
      {
        id: 2,
        name: '兴趣培养',
        icon: '/images/icons/examples.png',
        description: '发现孩子兴趣，培养特长技能',
        subTypes: ['绘画', '音乐', '书法', '舞蹈', '棋类', '编程']
      },
      {
        id: 3,
        name: '习惯养成',
        icon: '/images/icons/business.png',
        description: '帮助孩子养成良好的学习和生活习惯',
        subTypes: ['时间管理', '作业习惯', '阅读习惯', '自律能力']
      },
      {
        id: 4,
        name: '心理疏导',
        icon: '/images/icons/message.png',
        description: '关注孩子心理健康，解决成长烦恼',
        subTypes: ['情绪管理', '社交能力', '自信培养', '压力疏导']
      },
      {
        id: 5,
        name: '升学规划',
        icon: '/images/icons/service.png',
        description: '科学规划升学路径，助力孩子未来',
        subTypes: ['小升初', '中考规划', '高考规划', '留学咨询']
      },
      {
        id: 6,
        name: '特殊陪伴',
        icon: '/images/icons/service.png',
        description: '特殊时期的专业陪伴服务',
        subTypes: ['考前陪伴', '假期托管', '作业陪伴', '上下学接送']
      }
    ],

    // 当前选中的服务类型
    currentTypeId: 1,

    // 推荐陪伴师（原始列表）
    teacherList: [],
    // 筛选后的列表
    filteredTeacherList: [],

    loading: false
  },

  onLoad: function (options) {
    console.log('Service Page onLoad', options)
    if (options.typeId) {
      this.setData({
        currentTypeId: parseInt(options.typeId)
      })
    }

    this.loadTeacherList()
  },

  onShow: function () {
    console.log('Service Page onShow')
    // 更新tabbar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  // 顶部快捷入口
  onQuickTabTap: function (e) {
    const url = e.currentTarget.dataset.url
    const id = e.currentTarget.dataset.id
    this.setData({ activeQuickTab: id })

    // 未登录时，除成功案例外需要登录
    const token = wx.getStorageSync('token')
    const isNeedLogin = url !== '/pages/case-list/index' && url !== '/pages/search/index'
    if (isNeedLogin && !token) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    wx.navigateTo({ url })
  },

  // 加载推荐陪伴师列表
  loadTeacherList: function () {
    this.setData({ loading: true })

    const db = wx.cloud.database()
    db.collection('teachers').limit(20).get()
      .then(res => {
        const list = res.data.map(item => ({
          id: item._id,
          name: item.name,
          avatar: item.avatar || '/images/default_teacher_avatar.png',
          title: item.title,
          rating: item.rating,
          orderCount: item.orderCount,
          tags: item.tags || [],
          price: item.price,
          introduction: item.introduction
        }))

        this.setData({
          teacherList: list,
          loading: false
        }, () => {
          this.updateFilteredTeachers()
        })
      })
      .catch(err => {
        console.error('加载老师列表失败', err)
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  updateFilteredTeachers: function () {
    const currentTypeId = this.data.currentTypeId
    const type = this.data.serviceTypes.find((t) => t.id === currentTypeId)
    const typeName = type ? type.name : ''
    const list = (this.data.teacherList || []).filter((t) => {
      if (!typeName) return true
      return (t.tags || []).some((tag) => tag === typeName)
    })
    this.setData({ filteredTeacherList: list })
  },

  // 选择服务类型
  selectServiceType: function (e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      currentTypeId: id
    }, () => {
      this.updateFilteredTeachers()
    })
  },

  // 查看更多陪伴师
  viewMoreTeachers: function () {
    wx.navigateTo({
      url: '/pages/search/index?typeId=' + this.data.currentTypeId
    })
  },

  // 跳转到陪伴师详情
  goToTeacherDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + id
    })
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '智伴优程 - 专业陪伴服务',
      path: '/pages/service/index'
    }
  }
})
