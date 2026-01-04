// pages/feedback/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 反馈类型
    feedbackTypes: [
      { id: 'suggestion', name: '功能建议' },
      { id: 'bug', name: '问题反馈' },
      { id: 'complaint', name: '投诉举报' },
      { id: 'other', name: '其他' }
    ],
    
    // 当前选中的类型
    selectedType: 'suggestion',
    
    // 反馈内容
    content: '',
    
    // 联系方式
    contact: '',
    
    // 图片列表
    images: [],
    
    // 最大图片数量
    maxImages: 4,
    
    // 提交状态
    submitting: false
  },

  onLoad: function(options) {
    if (options.type) {
      this.setData({
        selectedType: options.type
      })
    }
    
    // 获取用户联系方式
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.phone) {
      this.setData({
        contact: userInfo.phone
      })
    }
  },

  // 选择反馈类型
  selectType: function(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type
    })
  },

  // 输入反馈内容
  onContentInput: function(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 输入联系方式
  onContactInput: function(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 选择图片
  chooseImage: function() {
    const count = this.data.maxImages - this.data.images.length
    if (count <= 0) {
      wx.showToast({
        title: '最多上传' + this.data.maxImages + '张图片',
        icon: 'none'
      })
      return
    }
    
    wx.chooseImage({
      count: count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = [...this.data.images, ...res.tempFilePaths]
        this.setData({ images })
      }
    })
  },

  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.images
    })
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 验证表单
  validateForm: function() {
    if (!this.data.content) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return false
    }
    
    if (this.data.content.length < 10) {
      wx.showToast({
        title: '反馈内容至少10个字',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 提交反馈
  submitFeedback: function() {
    if (!this.validateForm()) return
    
    this.setData({ submitting: true })
    
    // 模拟提交
    setTimeout(() => {
      this.setData({ submitting: false })
      
      wx.showModal({
        title: '提交成功',
        content: '感谢您的反馈，我们会尽快处理！',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }, 1000)
  }
})
