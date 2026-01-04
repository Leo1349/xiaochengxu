// pages/register/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 注册角色
    role: 'parent', // parent: 家长, teacher: 陪伴师
    
    // 表单数据
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    nickName: '',
    
    // 验证码
    codeText: '获取验证码',
    codeSending: false,
    countdown: 60,
    
    // 协议
    agreed: false,
    
    // 加载状态
    loading: false,
    
    // 当前步骤（陪伴师注册）
    step: 1 // 1: 基本信息, 2: 资质认证
  },

  onLoad: function(options) {
    if (options.role) {
      this.setData({
        role: options.role
      })
    }
  },

  // 切换注册角色
  switchRole: function(e) {
    const role = e.currentTarget.dataset.role
    this.setData({
      role: role,
      step: 1
    })
  },

  // 输入手机号
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 输入验证码
  onCodeInput: function(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 输入密码
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 输入确认密码
  onConfirmPasswordInput: function(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },

  // 输入昵称
  onNickNameInput: function(e) {
    this.setData({
      nickName: e.detail.value
    })
  },

  // 获取验证码
  getCode: function() {
    if (this.data.codeSending) return
    
    const phone = this.data.phone
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      codeSending: true,
      codeText: this.data.countdown + '秒后重试'
    })
    
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    })
    
    // 倒计时
    let countdown = this.data.countdown
    const timer = setInterval(() => {
      countdown--
      if (countdown <= 0) {
        clearInterval(timer)
        this.setData({
          codeSending: false,
          codeText: '获取验证码',
          countdown: 60
        })
      } else {
        this.setData({
          codeText: countdown + '秒后重试'
        })
      }
    }, 1000)
  },

  // 切换协议同意状态
  toggleAgreement: function() {
    this.setData({
      agreed: !this.data.agreed
    })
  },

  // 查看用户协议
  viewUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/agreement/index?type=user'
    })
  },

  // 查看隐私政策
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/agreement/index?type=privacy'
    })
  },

  // 验证表单
  validateForm: function() {
    const { phone, code, password, confirmPassword, nickName, agreed } = this.data
    
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return false
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return false
    }
    
    if (!code) {
      wx.showToast({ title: '请输入验证码', icon: 'none' })
      return false
    }
    
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return false
    }
    
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return false
    }
    
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码输入不一致', icon: 'none' })
      return false
    }
    
    if (!nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return false
    }
    
    if (!agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' })
      return false
    }
    
    return true
  },

  // 注册
  register: function() {
    if (!this.validateForm()) return
    
    this.setData({ loading: true })
    
    // 模拟注册
    setTimeout(() => {
      const userInfo = {
        id: Date.now(),
        phone: this.data.phone,
        nickName: this.data.nickName,
        avatarUrl: '/images/avatar.png',
        currentRole: this.data.role
      }
      
      wx.setStorageSync('token', 'mock_token_' + Date.now())
      wx.setStorageSync('userInfo', userInfo)
      
      this.setData({ loading: false })
      
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        if (this.data.role === 'teacher') {
          // 陪伴师跳转到简历填写
          wx.redirectTo({
            url: '/pages/teacher-resume/index?isNew=1'
          })
        } else {
          wx.navigateBack({
            delta: 2
          })
        }
      }, 1500)
    }, 1000)
  },

  // 跳转到登录页
  goToLogin: function() {
    wx.navigateBack()
  }
})
