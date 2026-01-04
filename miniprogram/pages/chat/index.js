// pages/chat/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 聊天对象信息
    targetUser: null,
    targetUserId: '',
    
    // 当前用户信息
    userInfo: null,
    
    // 消息列表
    messageList: [],
    
    // 输入内容
    inputValue: '',
    
    // 滚动位置
    scrollTop: 0,
    toView: '',
    
    // 是否显示更多功能
    showMore: false,
    
    // 键盘高度
    keyboardHeight: 0,
    
    // 是否正在发送
    sending: false,
    
    // 是否正在加载更多
    loadingMore: false,
    hasMore: true,
    pageNum: 1
  },

  onLoad: function(options) {
    const targetUserId = options.userId || ''
    const targetUserName = options.userName || '用户'
    const targetUserAvatar = options.userAvatar || ''
    
    this.setData({
      targetUserId: targetUserId,
      targetUser: {
        id: targetUserId,
        name: targetUserName,
        avatar: targetUserAvatar
      }
    })
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: targetUserName
    })
    
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
    
    // 加载聊天记录
    this.loadMessages()
  },

  onShow: function() {
    // 模拟轮询新消息
  },

  onUnload: function() {
    // 离开时标记已读
  },

  // 加载消息列表
  loadMessages: function() {
    // 模拟加载历史消息
    const messages = [
      {
        id: 'msg_1',
        senderId: this.data.targetUserId,
        content: '您好，请问有什么可以帮您的？',
        type: 'text',
        time: '10:00',
        isMine: false
      },
      {
        id: 'msg_2',
        senderId: 'me',
        content: '您好，我想咨询一下陪伴服务',
        type: 'text',
        time: '10:01',
        isMine: true
      },
      {
        id: 'msg_3',
        senderId: this.data.targetUserId,
        content: '好的，我们提供多种陪伴服务，包括课后辅导、作业陪伴、兴趣培养等，您需要哪种类型的服务呢？',
        type: 'text',
        time: '10:02',
        isMine: false
      }
    ]
    
    this.setData({
      messageList: messages
    })
    
    // 滚动到底部
    this.scrollToBottom()
  },

  // 加载更多消息
  loadMoreMessages: function() {
    if (this.data.loadingMore || !this.data.hasMore) return
    
    this.setData({ loadingMore: true })
    
    // 模拟加载
    setTimeout(() => {
      this.setData({
        loadingMore: false,
        pageNum: this.data.pageNum + 1
      })
    }, 1000)
  },

  // 滚动到底部
  scrollToBottom: function() {
    const list = this.data.messageList
    if (list.length > 0) {
      this.setData({
        toView: list[list.length - 1].id
      })
    }
  },

  // 输入消息
  onInput: function(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  // 发送消息
  sendMessage: function() {
    const content = this.data.inputValue.trim()
    if (!content) return
    
    this.setData({ sending: true })
    
    // 创建消息对象
    const msg = {
      id: 'msg_' + Date.now(),
      senderId: 'me',
      content: content,
      type: 'text',
      time: this.formatTime(new Date()),
      isMine: true,
      status: 'sending'
    }
    
    // 添加到列表
    const messageList = [...this.data.messageList, msg]
    this.setData({
      messageList: messageList,
      inputValue: ''
    })
    
    // 滚动到底部
    this.scrollToBottom()
    
    // 模拟发送成功
    setTimeout(() => {
      const list = this.data.messageList
      const index = list.findIndex(m => m.id === msg.id)
      if (index > -1) {
        list[index].status = 'sent'
        this.setData({
          messageList: list,
          sending: false
        })
      }
      
      // 模拟对方回复
      this.simulateReply()
    }, 500)
  },

  // 模拟对方回复
  simulateReply: function() {
    const replies = [
      '好的，我了解了',
      '请问还有其他问题吗？',
      '您可以通过下单页面预约服务',
      '感谢您的咨询'
    ]
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    
    setTimeout(() => {
      const msg = {
        id: 'msg_' + Date.now(),
        senderId: this.data.targetUserId,
        content: randomReply,
        type: 'text',
        time: this.formatTime(new Date()),
        isMine: false
      }
      
      const messageList = [...this.data.messageList, msg]
      this.setData({ messageList })
      this.scrollToBottom()
    }, 1500)
  },

  // 显示更多功能
  toggleMore: function() {
    this.setData({
      showMore: !this.data.showMore
    })
  },

  // 选择图片
  chooseImage: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const imagePath = res.tempFilePaths[0]
        this.sendImageMessage(imagePath)
      }
    })
    
    this.setData({ showMore: false })
  },

  // 发送图片消息
  sendImageMessage: function(imagePath) {
    const msg = {
      id: 'msg_' + Date.now(),
      senderId: 'me',
      content: imagePath,
      type: 'image',
      time: this.formatTime(new Date()),
      isMine: true,
      status: 'sending'
    }
    
    const messageList = [...this.data.messageList, msg]
    this.setData({ messageList })
    this.scrollToBottom()
    
    // 模拟发送成功
    setTimeout(() => {
      const list = this.data.messageList
      const index = list.findIndex(m => m.id === msg.id)
      if (index > -1) {
        list[index].status = 'sent'
        this.setData({ messageList: list })
      }
    }, 1000)
  },

  // 预览图片
  previewImage: function(e) {
    const src = e.currentTarget.dataset.src
    const images = this.data.messageList
      .filter(m => m.type === 'image')
      .map(m => m.content)
    
    wx.previewImage({
      current: src,
      urls: images
    })
  },

  // 拨打电话
  makeCall: function() {
    wx.showModal({
      title: '提示',
      content: '确定要拨打客服电话吗？',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        }
      }
    })
    
    this.setData({ showMore: false })
  },

  // 格式化时间
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return hours + ':' + minutes
  },

  // 键盘高度变化
  onKeyboardHeightChange: function(e) {
    this.setData({
      keyboardHeight: e.detail.height
    })
  },

  // 点击头像
  onAvatarTap: function(e) {
    const userId = e.currentTarget.dataset.userId
    if (userId !== 'me') {
      wx.navigateTo({
        url: '/pages/teacher-detail/index?id=' + userId
      })
    }
  }
})
