// pages/order-list/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 订单状态tabs
    tabs: [
      { id: 'all', name: '全部' },
      { id: 'pending', name: '待确认' },
      { id: 'confirmed', name: '待服务' },
      { id: 'ongoing', name: '进行中' },
      { id: 'completed', name: '已完成' },
      { id: 'cancelled', name: '已取消' }
    ],

    // 当前选中的tab
    currentTab: 'all',

    // 订单列表
    orderList: [],

    // 当前用户角色
    currentRole: 'parent', // parent: 家长, teacher: 陪伴师

    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,

    loading: false
  },

  onLoad: function (options) {
    if (options.status) {
      this.setData({
        currentTab: options.status
      })
    }

    this.checkRole()
    this.loadOrderList()
  },

  onShow: function () {
    this.checkRole()
  },

  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      hasMore: true,
      orderList: []
    })
    this.loadOrderList()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreOrders()
    }
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

  // 切换Tab
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab,
      page: 1,
      hasMore: true,
      orderList: []
    })
    this.loadOrderList()
  },

  // 加载订单列表
  loadOrderList: function () {
    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'getOrderList',
      data: {
        status: this.data.currentTab,
        page: this.data.page,
        pageSize: this.data.pageSize,
        role: this.data.currentRole
      },
      success: res => {
        if (res.result.success) {
          const { list, hasMore } = res.result.data

          // 格式化订单数据
          const formattedList = list.map(item => {
            let avatarUrl = item.teacherAvatar;
            if (!avatarUrl || avatarUrl === '/images/avatar.png' || avatarUrl === '/images/icons/default-avatar.png' || avatarUrl === '/images/default_teacher_avatar.png') {
              if (item.teacherGender) {
                avatarUrl = item.teacherGender === 'male'
                  ? '/images/avatars/teacher-male-default.png'
                  : '/images/avatars/teacher-female-default.png';
              } else {
                avatarUrl = '/images/default_teacher_avatar.png';
              }
            }

            return {
              id: item.orderNo, // 显示用订单号
              _id: item._id, // 数据库ID
              status: item.status,
              statusText: this.getStatusText(item.status),
              teacher: {
                id: item.teacherId,
                name: item.teacherName,
                avatar: avatarUrl
              },
              child: {
                name: item.childName,
                // age: 8 // 暂时没有年龄数据
              },
              service: {
                name: item.serviceName,
                price: item.finalPrice // 显示最终价格
              },
              serviceDate: item.serviceDate,
              serviceTime: item.serviceTime,
              duration: item.serviceDuration,
              totalPrice: item.finalPrice,
              createTime: this.formatTime(new Date(item.createTime))
            }
          })

          this.setData({
            orderList: this.data.page === 1 ? formattedList : this.data.orderList.concat(formattedList),
            hasMore: hasMore,
            loading: false
          })
        } else {
          console.error('获取订单列表失败', res.result.error)
          wx.showToast({ title: '加载订单失败', icon: 'none' })
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

  // 格式化时间
  formatTime: function (date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 获取状态文本
  getStatusText: function (status) {
    const map = {
      'pending': '待确认',
      'confirmed': '待服务',
      'ongoing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return map[status] || '未知状态'
  },



  // 加载更多订单
  loadMoreOrders: function () {
    this.setData({
      page: this.data.page + 1
    })
    // 模拟没有更多数据
    this.setData({
      hasMore: false
    })
  },

  // 查看订单详情
  viewOrderDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order-detail/index?id=' + id
    })
  },

  // 取消订单
  cancelOrder: function (e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orderList.find(o => o.id === id)
    if (!order) return

    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' })
          wx.cloud.callFunction({
            name: 'updateOrder',
            data: {
              orderId: order._id,
              status: 'cancelled'
            },
            success: (cloudRes) => {
              wx.hideLoading()
              if (cloudRes.result.success) {
                const orderList = this.data.orderList.map(o => {
                  if (o.id === id) {
                    o.status = 'cancelled'
                    o.statusText = '已取消'
                  }
                  return o
                })
                this.setData({ orderList })
                wx.showToast({ title: '订单已取消', icon: 'success' })
              } else {
                wx.showToast({ title: cloudRes.result.error || '取消失败', icon: 'none' })
              }
            },
            fail: (err) => {
              wx.hideLoading()
              console.error('取消订单失败', err)
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 确认订单（陪伴师）
  confirmOrder: function (e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orderList.find(o => o.id === id)
    if (!order) return

    wx.showModal({
      title: '提示',
      content: '确定接受该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' })
          wx.cloud.callFunction({
            name: 'updateOrder',
            data: {
              orderId: order._id,
              status: 'confirmed'
            },
            success: (cloudRes) => {
              wx.hideLoading()
              if (cloudRes.result.success) {
                const orderList = this.data.orderList.map(o => {
                  if (o.id === id) {
                    o.status = 'confirmed'
                    o.statusText = '待服务'
                  }
                  return o
                })
                this.setData({ orderList })
                wx.showToast({ title: '已确认订单', icon: 'success' })
              } else {
                wx.showToast({ title: cloudRes.result.error || '操作失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 开始服务
  startService: function (e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orderList.find(o => o.id === id)
    if (!order) return

    wx.showLoading({ title: '处理中' })
    wx.cloud.callFunction({
      name: 'updateOrder',
      data: {
        orderId: order._id,
        status: 'ongoing'
      },
      success: (cloudRes) => {
        wx.hideLoading()
        if (cloudRes.result.success) {
          const orderList = this.data.orderList.map(o => {
            if (o.id === id) {
              o.status = 'ongoing'
              o.statusText = '进行中'
            }
            return o
          })
          this.setData({ orderList })
          wx.showToast({ title: '服务已开始', icon: 'success' })
        } else {
          wx.showToast({ title: cloudRes.result.error || '操作失败', icon: 'none' })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 完成服务
  completeService: function (e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orderList.find(o => o.id === id)
    if (!order) return

    wx.showModal({
      title: '提示',
      content: '确定完成该服务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' })
          wx.cloud.callFunction({
            name: 'updateOrder',
            data: {
              orderId: order._id,
              status: 'completed'
            },
            success: (cloudRes) => {
              wx.hideLoading()
              if (cloudRes.result.success) {
                const orderList = this.data.orderList.map(o => {
                  if (o.id === id) {
                    o.status = 'completed'
                    o.statusText = '已完成'
                    o.hasReviewed = false
                  }
                  return o
                })
                this.setData({ orderList })
                wx.showToast({ title: '服务已完成', icon: 'success' })
              } else {
                wx.showToast({ title: cloudRes.result.error || '操作失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 去评价
  goToReview: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order-detail/index?id=' + id + '&action=review'
    })
  },

  // 再次预约
  reBook: function (e) {
    const orderId = e.currentTarget.dataset.id
    const order = this.data.orderList.find(o => o.id === orderId)
    if (!order || !order.teacher || !order.teacher.id) return
    wx.navigateTo({
      url: '/pages/order-confirm/index?teacherId=' + order.teacher.id
    })
  },

  // 联系客服
  contactUser: function (e) {
    wx.navigateTo({
      url: '/pages/customer-service/index'
    })
  }
})
