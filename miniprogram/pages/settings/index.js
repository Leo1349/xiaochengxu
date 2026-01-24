// pages/settings/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 用户信息
    userInfo: null,
    isLoggedIn: false,

    // 设置项
    settings: {
      notification: true,
      sound: true,
      vibrate: true
    },

    // 缓存大小
    cacheSize: '0 KB',

    // 版本信息
    version: '1.0.0'
  },

  onLoad: function (options) {
    this.checkLoginStatus()
    this.calculateCacheSize()

    if (options.tab === 'profile') {
      // 直接跳转到个人资料编辑
    }
  },

  onShow: function () {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    if (userInfo && token) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      })
    } else {
      this.setData({
        userInfo: null,
        isLoggedIn: false
      })
    }
  },

  // 计算缓存大小
  calculateCacheSize: function () {
    wx.getStorageInfo({
      success: (res) => {
        const size = res.currentSize
        let sizeText = ''
        if (size < 1024) {
          sizeText = size + ' KB'
        } else {
          sizeText = (size / 1024).toFixed(2) + ' MB'
        }
        this.setData({
          cacheSize: sizeText
        })
      }
    })
  },

  // 编辑头像
  editAvatar: async function () {
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }

    try {
      const res = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        })
      })

      const tempFilePath = res.tempFilePaths[0]

      // 上传到云存储
      wx.showLoading({ title: '上传中...' })
      const timestamp = Date.now()
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: `user-avatars/${timestamp}_avatar.jpg`,
        filePath: tempFilePath
      })

      const fileId = uploadRes.fileID

      // 获取临时链接用于显示
      const tempUrlRes = await wx.cloud.getTempFileURL({
        fileList: [fileId]
      })
      const displayUrl = tempUrlRes.fileList[0]?.tempFileURL || tempFilePath

      // 更新本地状态
      const userInfo = { ...this.data.userInfo }
      userInfo.avatarUrl = displayUrl
      userInfo.avatarFileId = fileId  // 保存 fileId 用于后续同步

      this.setData({ userInfo })
      wx.setStorageSync('userInfo', userInfo)

      // 同步到数据库
      const db = wx.cloud.database()
      await db.collection('users').where({
        _openid: '{openid}'
      }).update({
        data: {
          avatarUrl: fileId,  // 保存 fileId 到数据库
          updateTime: db.serverDate()
        }
      })

      wx.hideLoading()
      wx.showToast({
        title: '头像已更新',
        icon: 'success'
      })
    } catch (err) {
      console.error('更新头像失败', err)
      wx.hideLoading()
      if (err.errMsg !== 'chooseImage:fail cancel') {
        wx.showToast({ title: '更新失败', icon: 'none' })
      }
    }
  },

  // 编辑昵称
  editNickName: function () {
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }

    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          const userInfo = this.data.userInfo
          userInfo.nickName = res.content

          this.setData({ userInfo })
          wx.setStorageSync('userInfo', userInfo)

          wx.showToast({
            title: '昵称已更新',
            icon: 'success'
          })
        }
      }
    })
  },

  // 切换通知设置
  toggleNotification: function (e) {
    const value = e.detail.value
    this.setData({
      'settings.notification': value
    })
    wx.setStorageSync('settings', this.data.settings)
  },

  // 切换声音设置
  toggleSound: function (e) {
    const value = e.detail.value
    this.setData({
      'settings.sound': value
    })
    wx.setStorageSync('settings', this.data.settings)
  },

  // 切换震动设置
  toggleVibrate: function (e) {
    const value = e.detail.value
    this.setData({
      'settings.vibrate': value
    })
    wx.setStorageSync('settings', this.data.settings)
  },

  // 清除缓存
  clearCache: function () {
    wx.showModal({
      title: '提示',
      content: '确定清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 保留登录信息
          const token = wx.getStorageSync('token')
          const userInfo = wx.getStorageSync('userInfo')
          const settings = wx.getStorageSync('settings')

          wx.clearStorageSync()

          // 恢复登录信息
          if (token) wx.setStorageSync('token', token)
          if (userInfo) wx.setStorageSync('userInfo', userInfo)
          if (settings) wx.setStorageSync('settings', settings)

          this.setData({
            cacheSize: '0 KB'
          })

          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
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

  // 关于我们
  aboutUs: function () {
    wx.showModal({
      title: '关于智伴优程',
      content: '智伴优程是一个专业的家教陪伴服务平台，致力于为孩子提供优质的一对一陪伴服务。\n\n版本：' + this.data.version,
      showCancel: false
    })
  },

  // 检查更新
  checkUpdate: function () {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        wx.showModal({
          title: '发现新版本',
          content: '新版本已准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.onUpdateReady(() => {
                updateManager.applyUpdate()
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }
    })
  },

  // 跳转登录
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/index'
    })
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')

          this.setData({
            userInfo: null,
            isLoggedIn: false
          })

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      }
    })
  }
})
