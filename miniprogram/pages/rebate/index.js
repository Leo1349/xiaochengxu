// pages/rebate/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 用户信息
    userInfo: null,
    
    // 返利统计
    statistics: {
      totalRebate: 0,
      withdrawnRebate: 0,
      pendingRebate: 0,
      availableRebate: 0
    },
    
    // 返利明细列表
    rebateList: [],
    
    // 提现记录
    withdrawList: [],
    
    // 当前Tab
    activeTab: 'rebate',
    
    // 加载状态
    loading: false,
    hasMore: true,
    pageNum: 1,
    
    // 提现弹窗
    showWithdrawModal: false,
    withdrawAmount: '',
    
    // 银行卡信息
    bankCard: null
  },

  onLoad: function(options) {
    this.checkLogin()
  },

  onShow: function() {
    this.loadData()
  },

  // 检查登录状态
  checkLogin: function() {
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    
    if (!userInfo || !token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
      })
      return false
    }
    
    this.setData({
      userInfo: userInfo
    })
    return true
  },

  // 加载数据
  loadData: function() {
    this.loadStatistics()
    this.loadRebateList()
    this.loadBankCard()
  },

  // 加载返利统计
  loadStatistics: function() {
    // 模拟数据
    this.setData({
      statistics: {
        totalRebate: 2580.50,
        withdrawnRebate: 1200.00,
        pendingRebate: 380.50,
        availableRebate: 1000.00
      }
    })
  },

  // 加载返利明细
  loadRebateList: function() {
    this.setData({ loading: true })
    
    // 模拟数据
    setTimeout(() => {
      const list = [
        {
          id: '1',
          orderId: 'ORD202401150001',
          orderAmount: 200,
          rebateRate: 10,
          rebateAmount: 20,
          status: 'completed',
          statusText: '已到账',
          createTime: '2024-01-15 14:30'
        },
        {
          id: '2',
          orderId: 'ORD202401140002',
          orderAmount: 300,
          rebateRate: 10,
          rebateAmount: 30,
          status: 'pending',
          statusText: '待结算',
          createTime: '2024-01-14 10:20'
        },
        {
          id: '3',
          orderId: 'ORD202401130003',
          orderAmount: 500,
          rebateRate: 10,
          rebateAmount: 50,
          status: 'completed',
          statusText: '已到账',
          createTime: '2024-01-13 16:45'
        },
        {
          id: '4',
          orderId: 'ORD202401120004',
          orderAmount: 400,
          rebateRate: 10,
          rebateAmount: 40,
          status: 'completed',
          statusText: '已到账',
          createTime: '2024-01-12 09:15'
        }
      ]
      
      this.setData({
        rebateList: list,
        loading: false,
        hasMore: false
      })
    }, 500)
  },

  // 加载提现记录
  loadWithdrawList: function() {
    this.setData({ loading: true })
    
    // 模拟数据
    setTimeout(() => {
      const list = [
        {
          id: '1',
          amount: 500,
          status: 'success',
          statusText: '提现成功',
          bankName: '中国银行',
          bankCardNo: '**** **** **** 1234',
          createTime: '2024-01-10 10:00',
          completeTime: '2024-01-11 15:30'
        },
        {
          id: '2',
          amount: 700,
          status: 'success',
          statusText: '提现成功',
          bankName: '工商银行',
          bankCardNo: '**** **** **** 5678',
          createTime: '2024-01-05 14:00',
          completeTime: '2024-01-06 10:20'
        }
      ]
      
      this.setData({
        withdrawList: list,
        loading: false
      })
    }, 500)
  },

  // 加载银行卡信息
  loadBankCard: function() {
    // 模拟数据
    this.setData({
      bankCard: {
        bankName: '中国银行',
        cardNo: '6222021234567891234',
        cardNoDisplay: '**** **** **** 1234'
      }
    })
  },

  // 切换Tab
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    
    if (tab === 'withdraw' && this.data.withdrawList.length === 0) {
      this.loadWithdrawList()
    }
  },

  // 加载更多
  loadMore: function() {
    if (this.data.loading || !this.data.hasMore) return
    // 加载更多逻辑
  },

  // 显示提现弹窗
  showWithdraw: function() {
    if (this.data.statistics.availableRebate <= 0) {
      wx.showToast({
        title: '暂无可提现金额',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.bankCard) {
      wx.showModal({
        title: '提示',
        content: '请先绑定银行卡',
        confirmText: '去绑定',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/bank-card/index'
            })
          }
        }
      })
      return
    }
    
    this.setData({
      showWithdrawModal: true,
      withdrawAmount: ''
    })
  },

  // 隐藏提现弹窗
  hideWithdraw: function() {
    this.setData({
      showWithdrawModal: false,
      withdrawAmount: ''
    })
  },

  // 输入提现金额
  onAmountInput: function(e) {
    let value = e.detail.value
    
    // 限制小数点后两位
    if (value.indexOf('.') > -1) {
      const parts = value.split('.')
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2)
      }
    }
    
    this.setData({
      withdrawAmount: value
    })
  },

  // 全部提现
  withdrawAll: function() {
    this.setData({
      withdrawAmount: this.data.statistics.availableRebate.toFixed(2)
    })
  },

  // 确认提现
  confirmWithdraw: function() {
    const amount = parseFloat(this.data.withdrawAmount)
    
    if (!amount || amount <= 0) {
      wx.showToast({
        title: '请输入提现金额',
        icon: 'none'
      })
      return
    }
    
    if (amount > this.data.statistics.availableRebate) {
      wx.showToast({
        title: '提现金额超出可用余额',
        icon: 'none'
      })
      return
    }
    
    if (amount < 10) {
      wx.showToast({
        title: '最低提现10元',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '提交中...'
    })
    
    // 模拟提现
    setTimeout(() => {
      wx.hideLoading()
      
      this.setData({
        showWithdrawModal: false,
        withdrawAmount: ''
      })
      
      wx.showToast({
        title: '提现申请已提交',
        icon: 'success'
      })
      
      // 刷新数据
      this.loadData()
    }, 1000)
  },

  // 查看订单详情
  viewOrder: function(e) {
    const orderId = e.currentTarget.dataset.orderId
    wx.navigateTo({
      url: '/pages/order-detail/index?id=' + orderId
    })
  },

  // 绑定银行卡
  bindBankCard: function() {
    wx.navigateTo({
      url: '/pages/bank-card/index'
    })
  }
})
