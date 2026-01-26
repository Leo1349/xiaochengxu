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

  onLoad: function (options) {
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
  selectType: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type
    })
  },

  // 输入反馈内容
  onContentInput: function (e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 输入联系方式
  onContactInput: function (e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 选择图片
  chooseImage: function () {
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
  previewImage: function (e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.images
    })
  },

  // 删除图片
  deleteImage: function (e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 验证表单
  validateForm: function () {
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

  // 上传单个图片到云存储
  uploadImage: function (tempFilePath, cloudPath) {
    return new Promise((resolve, reject) => {
      // 如果已经是 cloud:// 格式，直接返回
      if (tempFilePath.startsWith('cloud://')) {
        resolve(tempFilePath)
        return
      }

      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempFilePath,
        success: res => resolve(res.fileID),
        fail: err => reject(err)
      })
    })
  },

  // 批量上传图片
  uploadAllImages: async function () {
    const timestamp = Date.now()
    const uploadedImages = []

    for (let i = 0; i < this.data.images.length; i++) {
      const image = this.data.images[i]
      if (image && !image.startsWith('cloud://')) {
        const fileId = await this.uploadImage(image, `feedbacks/${timestamp}_${i}.jpg`)
        uploadedImages.push(fileId)
      } else {
        uploadedImages.push(image)
      }
    }

    return uploadedImages
  },

  // 提交反馈
  submitFeedback: async function () {
    if (!this.validateForm()) return

    this.setData({ submitting: true })

    try {
      let uploadedImages = []

      // 如果有图片，先上传到云存储
      if (this.data.images.length > 0) {
        wx.showLoading({ title: '上传图片中...' })
        uploadedImages = await this.uploadAllImages()
        wx.hideLoading()
      }

      wx.showLoading({ title: '提交中...' })

      const res = await wx.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          type: this.data.selectedType,
          content: this.data.content,
          contact: this.data.contact,
          images: uploadedImages
        }
      })

      if (!res.result.success) {
        throw new Error(res.result.error || '提交失败')
      }

      wx.hideLoading()
      this.setData({ submitting: false })

      wx.showModal({
        title: '提交成功',
        content: '感谢您的反馈，我们会尽快处理！',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    } catch (err) {
      console.error('提交失败', err)
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  goToHistory: function () {
    wx.navigateTo({
      url: '/pages/feedback-list/index'
    })
  }
})
