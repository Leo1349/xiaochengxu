// pages/message/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 消息列表
    messageList: [],
    
    // 消息分类
    tabs: [
      { id: 'all', name: '全部消息' },
      { id: 'system', name: '系统通知' },
      { id: 'order', name: '订单消息' },
      { id: 'chat', name: '聊天消息' }
    ],
    
    // 当前选中的tab
    currentTab: 'all',
    
    // 未读消息数
    unreadCount: {
      all: 0,
      system: 0,
      order: 0,
      chat: 0
    },
    
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad: function(options) {
    this.loadMessages()
  },

  onShow: function() {
    this.checkLoginStatus()
    // 更新tabbar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      hasMore: true,
      messageList: []
    })
    this.loadMessages()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreMessages()
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看消息',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }
        }
      })
    }
  },

  // 加载消息列表
  loadMessages: function() {
    this.setData({ loading: true })
    
    // 模拟数据
    const mockMessages = [
      {
        id: 1,
        type: 'system',
        title: '系统通知',
        content: '欢迎使用智伴家平台，祝您使用愉快！',
        time: '2026-01-01 10:00',
        isRead: false,
        icon: '/images/icons/examples.png'
      },
      {
        id: 2,
        type: 'order',
        title: '订单提醒',
        content: '您的订单已被陪伴师接单，请注意查看详情',
        time: '2026-01-01 09:30',
        isRead: false,
        orderId: '20260101001',
        icon: '/images/icons/goods.png'
      },
      {
        id: 3,
        type: 'chat',
        title: '张老师',
        content: '您好，我已经确认了服务时间，明天下午3点开始',
        time: '2026-01-01 09:00',
        isRead: true,
        avatar: '/images/avatar.png',
        teacherId: 1
      },
      {
        id: 4,
        type: 'system',
        title: '活动通知',
        content: '新用户专享：首单立减50元，快来体验吧！',
        time: '2025-12-31 18:00',
        isRead: true,
        icon: '/images/icons/examples.png'
      },
      {
        id: 5,
        type: 'order',
        title: '服务完成',
        content: '您的订单服务已完成，请对陪伴师进行评价',
        time: '2025-12-30 17:00',
        isRead: true,
        orderId: '20251230001',
        icon: '/images/icons/goods-active.png'
      }
    ]
    
    setTimeout(() => {
      // 计算未读数
      const unreadCount = {
        all: mockMessages.filter(m => !m.isRead).length,
        system: mockMessages.filter(m => m.type === 'system' && !m.isRead).length,
        order: mockMessages.filter(m => m.type === 'order' && !m.isRead).length,
        chat: mockMessages.filter(m => m.type === 'chat' && !m.isRead).length
      }
      
      this.setData({
        messageList: mockMessages,
        unreadCount: unreadCount,
        loading: false
      })
    }, 500)
  },

  // 加载更多消息
  loadMoreMessages: function() {
    this.setData({
      page: this.data.page + 1
    })
    // 这里应该调用API加载更多数据
    // 模拟没有更多数据
    this.setData({
      hasMore: false
    })
  },

  // 切换tab
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 获取过滤后的消息列表
  getFilteredMessages: function() {
    if (this.data.currentTab === 'all') {
      return this.data.messageList
    }
    return this.data.messageList.filter(m => m.type === this.data.currentTab)
  },

  // 点击消息
  onMessageTap: function(e) {
    const messageId = e.currentTarget.dataset.id
    const message = this.data.messageList.find(m => m.id == messageId)
    if (!message) return
    
    // 标记为已读
    this.markAsRead(message.id)
    
    // 根据消息类型跳转
    switch (message.type) {
      case 'order':
        if (message.orderId) {
          wx.navigateTo({
            url: '/pages/order-detail/index?id=' + message.orderId
          })
        }
        break
      case 'chat':
        if (message.teacherId) {
          wx.navigateTo({
            url: '/pages/chat/index?teacherId=' + message.teacherId
          })
        }
        break
      case 'system':
        // 系统消息详情或者不跳转
        wx.showModal({
          title: message.title,
          content: message.content,
          showCancel: false
        })
        break
    }
  },

  // 标记消息为已读
  markAsRead: function(messageId) {
    const messageList = this.data.messageList.map(m => {
      if (m.id === messageId) {
        m.isRead = true
      }
      return m
    })
    
    // 重新计算未读数
    const unreadCount = {
      all: messageList.filter(m => !m.isRead).length,
      system: messageList.filter(m => m.type === 'system' && !m.isRead).length,
      order: messageList.filter(m => m.type === 'order' && !m.isRead).length,
      chat: messageList.filter(m => m.type === 'chat' && !m.isRead).length
    }
    
    this.setData({
      messageList: messageList,
      unreadCount: unreadCount
    })
  },

  // 全部标记为已读
  markAllAsRead: function() {
    const messageList = this.data.messageList.map(m => {
      m.isRead = true
      return m
    })
    
    this.setData({
      messageList: messageList,
      unreadCount: {
        all: 0,
        system: 0,
        order: 0,
        chat: 0
      }
    })
    
    wx.showToast({
      title: '已全部标记为已读',
      icon: 'success'
    })
  },

  // 删除消息
  deleteMessage: function(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定删除这条消息吗？',
      success: (res) => {
        if (res.confirm) {
          const messageList = this.data.messageList.filter(m => m.id !== id)
          this.setData({
            messageList: messageList
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})
