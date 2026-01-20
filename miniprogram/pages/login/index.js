// pages/login/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 登录方式
    loginType: 'wechat', // phone: 手机号登录, wechat: 微信登录

    // 手机号登录表单
    phone: '',
    code: '',

    // 验证码
    codeText: '获取验证码',
    codeSending: false,
    countdown: 60,

    // 协议
    agreed: false,

    // 加载状态
    loading: false
  },

  onLoad: function (options) {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      wx.navigateBack()
    }
  },

  // 切换登录方式
  switchLoginType: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      loginType: type
    })
  },

  // 输入手机号
  onPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 输入验证码
  onCodeInput: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 获取验证码
  getCode: function () {
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

    // 发送验证码
    // api.sendCode({ phone: phone }).then(res => {
    //   wx.showToast({ title: '验证码已发送', icon: 'success' })
    // })

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
  toggleAgreement: function () {
    this.setData({
      agreed: !this.data.agreed
    })
  },

  // 查看用户协议
  viewUserAgreement: function () {
    wx.navigateTo({
      url: '/pages/agreement/index?type=user'
    })
  },

  // 查看隐私政策
  viewPrivacyPolicy: function () {
    wx.navigateTo({
      url: '/pages/agreement/index?type=privacy'
    })
  },

  // 手机号登录
  loginByPhone: function () {
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    const phone = this.data.phone
    const code = this.data.code

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

    if (!code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 模拟登录
    setTimeout(() => {
      const userInfo = {
        id: 1,
        phone: phone,
        nickName: '智伴用户',
        avatarUrl: '/images/avatar.png',
        currentRole: 'parent'
      }

      wx.setStorageSync('token', 'mock_token_' + Date.now())
      wx.setStorageSync('userInfo', userInfo)

      this.setData({ loading: false })

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  },

  // 微信一键登录
  loginByWechat: function (e) {
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 推荐使用 wx.getUserProfile 获取用户信息
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中
      success: (res) => {
        const userInfo = res.userInfo

        // 调用云函数登录/注册
        wx.cloud.callFunction({
          name: 'login',
          data: {
            type: 'wechat',
            userInfo: userInfo
          },
          success: (cloudRes) => {
            if (cloudRes.result.success) {
              const user = cloudRes.result.data

              // 保存登录状态
              wx.setStorageSync('token', cloudRes.result.token)
              wx.setStorageSync('userInfo', user)

              // 更新全局状态
              app.setUserInfo(user, user.currentRole || 'parent')

              this.setData({ loading: false })

              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })

              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } else {
              console.error('登录失败', cloudRes.result.error)
              this.setData({ loading: false })
              wx.showToast({
                title: '登录失败',
                icon: 'none'
              })
            }
          },
          fail: (err) => {
            console.error('调用云函数失败', err)
            this.setData({ loading: false })
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.log('用户拒绝授权', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '您取消了授权',
          icon: 'none'
        })
      }
    })
  },

  // 获取手机号（微信授权）
  getPhoneNumber: function (e) {
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    // 如果拒绝授权
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '您取消了授权',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 调用云函数，传递 code 获取手机号并登录
    wx.cloud.callFunction({
      name: 'login',
      data: {
        type: 'phone',
        code: e.detail.code
      },
      success: (res) => {
        if (res.result.success) {
          const user = res.result.data

          wx.setStorageSync('token', res.result.token)
          wx.setStorageSync('userInfo', user)
          app.setUserInfo(user, user.currentRole || 'parent')

          this.setData({ loading: false })

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })

          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          console.error('登录失败', res.result.error)
          this.setData({ loading: false })
          wx.showToast({
            title: '登录失败: ' + (res.result.error || '未知错误'),
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('调用云函数失败', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到注册页
  goToRegister: function () {
    wx.navigateTo({
      url: '/pages/register/index'
    })
  }
})
