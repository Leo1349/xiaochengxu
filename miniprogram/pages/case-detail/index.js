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

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        caseId: options.id
      })
      this.loadCaseDetail(options.id)
    }
  },

  // 加载案例详情
  loadCaseDetail: function(id) {
    this.setData({ loading: true })
    
    // 模拟数据
    const mockCase = {
      id: id,
      category: 'study',
      categoryName: '学习提升',
      title: '帮助小学生数学成绩提升30分',
      cover: '/images/ai_example1.png',
      
      teacher: {
        id: 1,
        name: '张老师',
        avatar: '/images/avatar.png',
        title: '专业陪伴师'
      },
      
      // 学生基本信息（脱敏）
      student: {
        grade: '小学三年级',
        age: 9,
        gender: '男'
      },
      
      // 服务信息
      serviceInfo: {
        type: '学科辅导',
        duration: '3个月',
        frequency: '每周3次，每次2小时'
      },
      
      // 案例内容
      content: {
        background: '小明是一名小学三年级的学生，数学成绩一直不理想，期中考试只考了60分。家长非常着急，希望能找到专业的老师帮助孩子提升数学成绩。',
        
        problem: '经过初步了解，发现小明主要存在以下问题：\n1. 数学基础薄弱，对加减法运算不熟练\n2. 缺乏学习兴趣，对数学有畏惧心理\n3. 学习方法不当，做题缺乏技巧\n4. 注意力不集中，容易走神',
        
        solution: '针对小明的情况，我制定了以下辅导方案：\n\n第一阶段（第1-4周）：夯实基础\n- 从最基础的加减法开始复习\n- 通过游戏化教学提升学习兴趣\n- 建立错题本，总结易错点\n\n第二阶段（第5-8周）：技巧训练\n- 教授解题技巧和方法\n- 针对性练习，强化薄弱环节\n- 培养独立思考能力\n\n第三阶段（第9-12周）：巩固提升\n- 综合练习，查漏补缺\n- 模拟考试，适应考试节奏\n- 建立学习自信心',
        
        result: '经过3个月的系统辅导，小明的数学成绩有了显著提升：\n- 期末考试考了90分，提升了30分\n- 对数学产生了浓厚的兴趣\n- 掌握了正确的学习方法\n- 学习主动性明显增强\n\n家长对辅导效果非常满意，小明也变得更加自信了。'
      },
      
      // 图片展示
      images: [
        '/images/ai_example1.png',
        '/images/ai_example2.png',
        '/images/cloud_dev.png'
      ],
      
      // 统计数据
      viewCount: 1280,
      likeCount: 356,
      shareCount: 89,
      
      createTime: '2025-12-20'
    }
    
    setTimeout(() => {
      this.setData({
        caseInfo: mockCase,
        loading: false
      })
    }, 500)
  },

  // 点赞
  toggleLike: function() {
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

  // 查看陪伴师详情
  viewTeacherDetail: function() {
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + this.data.caseInfo.teacher.id
    })
  },

  // 预约陪伴师
  bookTeacher: function() {
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
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.caseInfo.images
    })
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: this.data.caseInfo ? this.data.caseInfo.title : '智伴家成功案例',
      path: '/pages/case-detail/index?id=' + this.data.caseId,
      imageUrl: this.data.caseInfo ? this.data.caseInfo.cover : ''
    }
  }
})
