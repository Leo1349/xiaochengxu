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

  onLoad: function (options) {
    this.loadMessages()
  },

  onShow: function () {
    this.checkLoginStatus()
    // 更新tabbar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      hasMore: true,
      messageList: []
    })
    this.loadMessages()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreMessages()
    }
  },

  // 检查登录状态
  checkLoginStatus: function () {
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
  loadMessages: function () {
    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'getMessageList',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize,
        type: this.data.currentTab
      },
      success: res => {
        if (res.result.success) {
          const { list, unreadCount, hasMore } = res.result.data

          this.setData({
            messageList: this.data.page === 1 ? list : this.data.messageList.concat(list),
            unreadCount: unreadCount,
            loading: false,
            hasMore: hasMore
          })
        } else {
          console.error('加载消息失败', res.result.error)
          this.setData({ loading: false })
          wx.showToast({ title: '加载消息失败', icon: 'none' })
        }
      },
      fail: err => {
        console.error('调用云函数失败', err)
        this.setData({ loading: false })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 加载更多消息
  loadMoreMessages: function () {
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
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 获取过滤后的消息列表
  getFilteredMessages: function () {
    if (this.data.currentTab === 'all') {
      return this.data.messageList
    }
    return this.data.messageList.filter(m => m.type === this.data.currentTab)
  },

  // 点击消息
  onMessageTap: function (e) {
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
  markAsRead: function (messageId) {
    wx.cloud.callFunction({
      name: 'markMessageRead',
      data: { messageId: messageId },
      success: res => {
        if (res.result.success) {
          // 更新本地状态
          const messageList = this.data.messageList.map(m => {
            if (m.id === messageId) m.isRead = true
            return m
          })
          this.setData({ messageList })
          // 重新加载以更新未读数
          this.loadMessages()
        }
      }
    })
  },

  // 全部标记为已读
  markAllAsRead: function () {
    wx.cloud.callFunction({
      name: 'markMessageRead',
      data: { markAll: true, type: this.data.currentTab },
      success: res => {
        if (res.result.success) {
          wx.showToast({ title: '已全部已读', icon: 'success' })
          this.loadMessages()
        }
      },
      fail: err => {
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
    })
  },

  // 删除消息
  deleteMessage: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '暂不支持删除消息',
      showCancel: false
    })
  }
})
