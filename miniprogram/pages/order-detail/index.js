// pages/order-detail/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 订单ID
    orderId: null,
    
    // 订单详情
    order: null,
    
    // 当前用户角色
    currentRole: 'parent',
    
    // 是否显示评价弹窗
    showReviewModal: false,
    
    // 评价数据
    reviewData: {
      rating: 5,
      content: '',
      tags: []
    },
    
    // 评价标签
    reviewTags: ['服务态度好', '专业能力强', '守时准时', '孩子喜欢', '效果明显', '耐心细致'],
    
    loading: true
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      })
      this.loadOrderDetail(options.id)
    }
    
    if (options.action === 'review') {
      this.setData({
        showReviewModal: true
      })
    }
    
    this.checkRole()
  },

  // 检查当前角色
  checkRole: function() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        currentRole: userInfo.currentRole || 'parent'
      })
    }
  },

  // 加载订单详情
  loadOrderDetail: function(id) {
    this.setData({ loading: true })
    
    // 模拟数据
    const mockOrder = {
      id: id,
      status: 'confirmed',
      statusText: '待服务',
      teacher: {
        id: 1,
        name: '张老师',
        avatar: '/images/avatar.png',
        phone: '138****8888',
        title: '专业陪伴师'
      },
      parent: {
        id: 1,
        name: '王先生',
        phone: '139****9999'
      },
      child: {
        id: 1,
        name: '小明',
        age: 8,
        grade: '小学二年级',
        gender: '男'
      },
      service: {
        id: 1,
        name: '学科辅导',
        price: 150,
        unit: '小时'
      },
      serviceDate: '2026-01-05',
      serviceTime: '14:00',
      duration: 2,
      address: '北京市海淀区中关村大街1号',
      remark: '孩子数学基础较弱，希望重点辅导',
      
      // 价格
      totalPrice: 300,
      discountPrice: 50,
      finalPrice: 250,
      couponName: '新人优惠券',
      
      // 时间
      createTime: '2026-01-01 10:00:00',
      confirmTime: '2026-01-01 10:30:00',
      startTime: '',
      endTime: '',
      
      // 评价
      review: null
    }
    
    setTimeout(() => {
      this.setData({
        order: mockOrder,
        loading: false
      })
    }, 500)
  },

  // 复制订单号
  copyOrderId: function() {
    wx.setClipboardData({
      data: this.data.order.id,
      success: () => {
        wx.showToast({
          title: '订单号已复制',
          icon: 'success'
        })
      }
    })
  },

  // 拨打电话
  makeCall: function(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  // 联系对方
  contactUser: function() {
    const teacherId = this.data.order.teacher.id
    wx.navigateTo({
      url: '/pages/chat/index?teacherId=' + teacherId + '&orderId=' + this.data.orderId
    })
  },

  // 查看陪伴师详情
  viewTeacherDetail: function() {
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + this.data.order.teacher.id
    })
  },

  // 取消订单
  cancelOrder: function() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          const order = this.data.order
          order.status = 'cancelled'
          order.statusText = '已取消'
          
          this.setData({ order })
          
          wx.showToast({
            title: '订单已取消',
            icon: 'success'
          })
        }
      }
    })
  },

  // 确认订单（陪伴师）
  confirmOrder: function() {
    wx.showModal({
      title: '确认订单',
      content: '确定接受该订单吗？',
      success: (res) => {
        if (res.confirm) {
          const order = this.data.order
          order.status = 'confirmed'
          order.statusText = '待服务'
          order.confirmTime = this.formatTime(new Date())
          
          this.setData({ order })
          
          wx.showToast({
            title: '已确认订单',
            icon: 'success'
          })
        }
      }
    })
  },

  // 开始服务
  startService: function() {
    const order = this.data.order
    order.status = 'ongoing'
    order.statusText = '进行中'
    order.startTime = this.formatTime(new Date())
    
    this.setData({ order })
    
    wx.showToast({
      title: '服务已开始',
      icon: 'success'
    })
  },

  // 完成服务
  completeService: function() {
    wx.showModal({
      title: '完成服务',
      content: '确定完成该服务吗？',
      success: (res) => {
        if (res.confirm) {
          const order = this.data.order
          order.status = 'completed'
          order.statusText = '已完成'
          order.endTime = this.formatTime(new Date())
          
          this.setData({ order })
          
          wx.showToast({
            title: '服务已完成',
            icon: 'success'
          })
        }
      }
    })
  },

  // 显示评价弹窗
  showReview: function() {
    this.setData({
      showReviewModal: true
    })
  },

  // 隐藏评价弹窗
  hideReview: function() {
    this.setData({
      showReviewModal: false
    })
  },

  // 设置评分
  setRating: function(e) {
    const rating = e.currentTarget.dataset.rating
    this.setData({
      'reviewData.rating': rating
    })
  },

  // 选择评价标签
  toggleTag: function(e) {
    const tag = e.currentTarget.dataset.tag
    const tags = this.data.reviewData.tags
    const index = tags.indexOf(tag)
    
    if (index > -1) {
      tags.splice(index, 1)
    } else {
      if (tags.length < 3) {
        tags.push(tag)
      }
    }
    
    this.setData({
      'reviewData.tags': tags
    })
  },

  // 输入评价内容
  onReviewInput: function(e) {
    this.setData({
      'reviewData.content': e.detail.value
    })
  },

  // 提交评价
  submitReview: function() {
    if (!this.data.reviewData.content) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      })
      return
    }
    
    // 模拟提交
    const order = this.data.order
    order.review = {
      rating: this.data.reviewData.rating,
      content: this.data.reviewData.content,
      tags: this.data.reviewData.tags,
      time: this.formatTime(new Date())
    }
    
    this.setData({
      order: order,
      showReviewModal: false
    })
    
    wx.showToast({
      title: '评价成功',
      icon: 'success'
    })
  },

  // 再次预约
  reBook: function() {
    wx.navigateTo({
      url: '/pages/order-confirm/index?teacherId=' + this.data.order.teacher.id
    })
  },

  // 格式化时间
  formatTime: function(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const second = date.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: '智伴家订单详情',
      path: '/pages/index/index'
    }
  }
})
