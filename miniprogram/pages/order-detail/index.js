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

  onLoad: function (options) {
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
  checkRole: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        currentRole: userInfo.currentRole || 'parent'
      })
    }
  },

  // 加载订单详情
  loadOrderDetail: function (id) {
    this.setData({ loading: true })

    // 从数据库获取订单详情
    const db = wx.cloud.database()
    db.collection('orders').doc(id).get().then(res => {
      console.log('获取订单详情:', res)
      const orderData = res.data

      // 映射订单状态文本
      const statusTextMap = {
        'pending': '待确认',
        'confirmed': '待服务',
        'ongoing': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      }

      // 格式化订单数据
      let avatarUrl = orderData.teacherAvatar;
      if (!avatarUrl || avatarUrl === '/images/avatar.png' || avatarUrl === '/images/icons/default-avatar.png' || avatarUrl === '/images/default_teacher_avatar.png') {
        if (orderData.teacherGender) {
          avatarUrl = orderData.teacherGender === 'male'
            ? '/images/avatars/teacher-male-default.png'
            : '/images/avatars/teacher-female-default.png';
        } else {
          avatarUrl = '/images/default_teacher_avatar.png';
        }
      }

      const order = {
        id: orderData._id,
        orderNo: orderData.orderNo,
        status: orderData.status,
        statusText: statusTextMap[orderData.status] || '未知',
        teacher: {
          id: orderData.teacherId,
          name: orderData.teacherName,
          avatar: avatarUrl,
          title: '专业陪伴师'
        },
        child: {
          id: orderData.childId,
          name: orderData.childName,
          age: '',
          grade: '',
          gender: ''
        },
        service: {
          id: orderData.serviceId,
          name: orderData.serviceName,
          price: orderData.totalPrice / orderData.serviceDuration,
          unit: '小时'
        },
        serviceDate: orderData.serviceDate,
        serviceTime: orderData.serviceTime,
        duration: orderData.serviceDuration,
        address: orderData.address,
        remark: orderData.remark || '',

        // 价格
        totalPrice: orderData.totalPrice,
        discountPrice: orderData.discountPrice || 0,
        finalPrice: orderData.finalPrice || orderData.totalPrice,
        couponName: orderData.discountPrice > 0 ? '优惠券' : '',

        // 时间
        createTime: this.formatServerDate(orderData.createTime),
        confirmTime: '',
        startTime: '',
        endTime: '',

        // 评价
        review: null
      }

      this.setData({
        order: order,
        loading: false
      })
    }).catch(err => {
      console.error('获取订单详情失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '获取订单失败', icon: 'none' })
    })
  },

  // 格式化服务端日期
  formatServerDate: function (serverDate) {
    if (!serverDate) return ''
    if (typeof serverDate === 'string') return serverDate
    if (serverDate.$date) {
      return new Date(serverDate.$date).toLocaleString('zh-CN')
    }
    if (serverDate instanceof Date) {
      return this.formatTime(serverDate)
    }
    return String(serverDate)
  },

  // 复制订单号
  copyOrderId: function () {
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
  makeCall: function (e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  // 联系对方
  contactUser: function () {
    const teacherId = this.data.order.teacher.id
    wx.navigateTo({
      url: '/pages/chat/index?teacherId=' + teacherId + '&orderId=' + this.data.orderId
    })
  },

  // 查看陪伴师详情
  viewTeacherDetail: function () {
    wx.navigateTo({
      url: '/pages/teacher-detail/index?id=' + this.data.order.teacher.id
    })
  },

  // 取消订单
  cancelOrder: function () {
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
  confirmOrder: function () {
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
  startService: function () {
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
  completeService: function () {
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
  showReview: function () {
    this.setData({
      showReviewModal: true
    })
  },

  // 隐藏评价弹窗
  hideReview: function () {
    this.setData({
      showReviewModal: false
    })
  },

  // 设置评分
  setRating: function (e) {
    const rating = e.currentTarget.dataset.rating
    this.setData({
      'reviewData.rating': rating
    })
  },

  // 选择评价标签
  toggleTag: function (e) {
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
  onReviewInput: function (e) {
    this.setData({
      'reviewData.content': e.detail.value
    })
  },

  // 提交评价
  submitReview: function () {
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
  reBook: function () {
    wx.navigateTo({
      url: '/pages/order-confirm/index?teacherId=' + this.data.order.teacher.id
    })
  },

  // 格式化时间
  formatTime: function (date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const second = date.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '智伴优程订单详情',
      path: '/pages/index/index'
    }
  }
})
