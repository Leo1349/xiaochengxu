// pages/order-confirm/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 陪伴师信息
    teacherId: null,
    teacher: null,

    // 选中的服务
    serviceId: null,
    selectedService: null,

    // 服务列表
    services: [],

    // 选中的孩子
    selectedChild: null,
    childList: [],

    // 预约时间
    serviceDate: '',
    serviceTime: '',
    serviceDuration: 2, // 服务时长（小时）

    // 服务地址
    address: '',

    // 备注
    remark: '',

    // 优惠券
    coupon: null,
    couponList: [],
    showCouponPicker: false,

    // 价格计算
    totalPrice: 0,
    discountPrice: 0,
    finalPrice: 0,

    // 日期选择器
    minDate: '',
    maxDate: '',

    // 时间选项
    timeOptions: [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00'
    ],

    // 时长选项
    durationOptions: [1, 2, 3, 4, 5, 6, 7, 8],

    loading: false,
    submitting: false
  },

  onLoad: function (options) {
    this.initDateRange()

    if (options.teacherId) {
      this.setData({
        teacherId: options.teacherId,
        serviceId: options.serviceId || null
      })
      this.loadTeacherInfo(options.teacherId)
    }

    this.loadChildList()
    this.loadCouponList()
  },

  // 初始化日期范围
  initDateRange: function () {
    const today = new Date()
    const minDate = this.formatDate(today)

    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 1)

    this.setData({
      minDate: minDate,
      maxDate: this.formatDate(maxDate),
      serviceDate: minDate
    })
  },

  // 格式化日期
  formatDate: function (date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 加载陪伴师信息
  loadTeacherInfo: function (id) {
    this.setData({ loading: true })

    // 调用云函数获取老师详情
    wx.cloud.callFunction({
      name: 'getTeacherDetail',
      data: { id: id },
      success: res => {
        console.log('获取老师详情:', res)
        if (res.result.success) {
          const { teacher, services } = res.result.data

          // 设置老师信息
          const teacherInfo = {
            id: teacher._id,
            name: teacher.name,
            avatar: teacher.avatar || '/images/avatar.png',
            title: teacher.title || '专业陪伴师',
            rating: teacher.rating || 5.0
          }

          // 设置服务列表
          let selectedService = services[0]
          if (this.data.serviceId) {
            const found = services.find(s => s.id == this.data.serviceId)
            if (found) selectedService = found
          }

          this.setData({
            teacher: teacherInfo,
            services: services,
            selectedService: selectedService,
            loading: false
          })

          this.calculatePrice()
        } else {
          console.error('获取老师信息失败:', res.result.error)
          this.setData({ loading: false })
          wx.showToast({ title: '获取老师信息失败', icon: 'none' })
        }
      },
      fail: err => {
        console.error('调用云函数失败:', err)
        this.setData({ loading: false })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 加载孩子列表
  loadChildList: function () {
    wx.cloud.callFunction({
      name: 'manageChild',
      data: { action: 'list' },
      success: res => {
        if (res.result.success) {
          const list = res.result.data.list
          this.setData({
            childList: list,
            selectedChild: (list && list.length > 0) ? list[0] : null
          })
        } else {
          console.error('获取孩子列表失败', res.result.error)
          wx.showToast({ title: '获取孩子列表失败', icon: 'none' })
        }
      },
      fail: err => {
        console.error('调用云函数失败', err)
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 加载优惠券列表
  loadCouponList: function () {
    // 暂无优惠券功能，置为空
    this.setData({
      couponList: []
    })
  },

  // 选择服务
  selectService: function (e) {
    const id = e.currentTarget.dataset.id
    const service = this.data.services.find(s => s.id == id)
    this.setData({
      selectedService: service
    })
    this.calculatePrice()
  },

  // 选择孩子
  selectChild: function (e) {
    const id = e.currentTarget.dataset.id
    const child = this.data.childList.find(c => c.id == id)
    this.setData({
      selectedChild: child
    })
  },

  // 添加孩子
  addChild: function () {
    wx.navigateTo({
      url: '/pages/child-info/index?action=add'
    })
  },

  // 选择日期
  onDateChange: function (e) {
    this.setData({
      serviceDate: e.detail.value
    })
  },

  // 选择时间
  onTimeChange: function (e) {
    this.setData({
      serviceTime: this.data.timeOptions[e.detail.value]
    })
  },

  // 选择时长
  onDurationChange: function (e) {
    this.setData({
      serviceDuration: this.data.durationOptions[e.detail.value]
    })
    this.calculatePrice()
  },

  // 输入地址
  onAddressInput: function (e) {
    this.setData({
      address: e.detail.value
    })
  },

  // 输入备注
  onRemarkInput: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 显示优惠券选择器
  showCouponPicker: function () {
    this.setData({
      showCouponPicker: true
    })
  },

  // 隐藏优惠券选择器
  hideCouponPicker: function () {
    this.setData({
      showCouponPicker: false
    })
  },

  // 选择优惠券
  selectCoupon: function (e) {
    const id = e.currentTarget.dataset.id
    if (id == 0) {
      this.setData({
        coupon: null,
        showCouponPicker: false
      })
    } else {
      const coupon = this.data.couponList.find(c => c.id == id)
      this.setData({
        coupon: coupon,
        showCouponPicker: false
      })
    }
    this.calculatePrice()
  },

  // 计算价格
  calculatePrice: function () {
    if (!this.data.selectedService) return

    const totalPrice = this.data.selectedService.price * this.data.serviceDuration
    let discountPrice = 0

    if (this.data.coupon && totalPrice >= this.data.coupon.minAmount) {
      discountPrice = this.data.coupon.amount
    }

    const finalPrice = totalPrice - discountPrice

    this.setData({
      totalPrice: totalPrice,
      discountPrice: discountPrice,
      finalPrice: finalPrice
    })
  },

  // 验证表单
  validateForm: function () {
    if (!this.data.selectedService) {
      wx.showToast({ title: '请选择服务类型', icon: 'none' })
      return false
    }

    if (!this.data.selectedChild) {
      wx.showToast({ title: '请选择孩子', icon: 'none' })
      return false
    }

    if (!this.data.serviceDate) {
      wx.showToast({ title: '请选择服务日期', icon: 'none' })
      return false
    }

    if (!this.data.serviceTime) {
      wx.showToast({ title: '请选择服务时间', icon: 'none' })
      return false
    }

    if (!this.data.address) {
      wx.showToast({ title: '请填写服务地址', icon: 'none' })
      return false
    }

    return true
  },

  // 提交订单
  submitOrder: function () {
    if (!this.validateForm()) return

    this.setData({ submitting: true })

    const orderData = {
      teacherId: this.data.teacherId,
      teacherName: this.data.teacher ? this.data.teacher.name : '',
      teacherAvatar: this.data.teacher ? this.data.teacher.avatar : '',
      serviceId: this.data.selectedService.id,
      serviceName: this.data.selectedService.name,
      childId: this.data.selectedChild.id,
      childName: this.data.selectedChild.name,
      serviceDate: this.data.serviceDate,
      serviceTime: this.data.serviceTime,
      serviceDuration: this.data.serviceDuration,
      address: this.data.address,
      remark: this.data.remark,
      totalPrice: this.data.totalPrice,
      discountPrice: this.data.discountPrice,
      finalPrice: this.data.finalPrice
    }

    // 调用云函数创建订单
    wx.cloud.callFunction({
      name: 'createOrder',
      data: orderData,
      success: res => {
        if (res.result.success) {
          this.setData({ submitting: false })

          wx.showToast({
            title: '下单成功',
            icon: 'success'
          })

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/order-detail/index?id=' + res.result.data.orderId
            })
          }, 1500)
        } else {
          console.error('下单失败', res.result.error)
          this.setData({ submitting: false })
          wx.showToast({
            title: '下单失败，请重试',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('调用云函数失败', err)
        this.setData({ submitting: false })
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  }
})
