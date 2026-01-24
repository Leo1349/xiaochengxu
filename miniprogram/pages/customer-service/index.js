// pages/customer-service/index.js
const app = getApp()

Page({
  data: {
    // 加载状态
    loading: true,

    // 常见问题（默认空数组，等待云函数返回）
    faqList: [],

    // 客服信息（默认数据，云函数可覆盖）
    serviceInfo: {
      phone: '400-123-4567',
      workTime: '周一至周日 9:00-21:00',
      email: 'service@zhibanjia.com',
      wechat: 'zhibanjia_kefu'
    }
  },

  onLoad: function (options) {
    this.loadServiceData()
  },

  // 加载客服数据
  loadServiceData: function () {
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'getServiceData',
      success: res => {
        if (res.result.success) {
          // 确保 expanded 属性存在
          const faqList = (res.result.data.faqList || []).map(item => ({
            ...item,
            expanded: false
          }))
          this.setData({
            serviceInfo: res.result.data.serviceInfo || this.data.serviceInfo,
            faqList: faqList
          })
        } else {
          // 云函数调用失败时使用默认FAQ
          this.loadDefaultFaq()
        }
      },
      fail: err => {
        console.error('获取客服数据失败', err)
        // 失败时使用默认FAQ
        this.loadDefaultFaq()
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 加载默认FAQ数据
  loadDefaultFaq: function () {
    this.setData({
      faqList: [
        { id: 1, question: '如何预约陪伴师？', answer: '您可以在首页搜索陪伴师，查看陪伴师详情后点击"立即预约"按钮，选择服务类型、时间和孩子信息后提交订单即可。', expanded: false },
        { id: 2, question: '如何取消订单？', answer: '在"我的订单"中找到待确认或待服务的订单，点击"取消订单"按钮即可取消。请注意，服务开始前24小时内取消可能需要支付一定的取消费用。', expanded: false },
        { id: 3, question: '陪伴师的资质如何保证？', answer: '所有陪伴师都经过平台严格的资质审核，包括身份验证、学历验证、资格证书验证等。我们还会进行背景调查，确保陪伴师的品行端正。', expanded: false },
        { id: 4, question: '如何申请退款？', answer: '如果服务尚未开始，您可以直接取消订单申请全额退款。如果服务已开始但不满意，请联系客服说明情况，我们会根据实际情况处理退款申请。', expanded: false },
        { id: 5, question: '如何成为陪伴师？', answer: '在"我的"页面切换到陪伴师模式，完善个人简历并提交审核。审核通过后即可开始接单。您需要年满18周岁，具有相关教育经验或资格证书。', expanded: false },
        { id: 6, question: '服务过程中遇到问题怎么办？', answer: '您可以随时通过订单详情页的"联系老师"按钮与陪伴师沟通。如果问题无法解决，请及时联系平台客服，我们会协助处理。', expanded: false },
        { id: 7, question: '如何评价陪伴师？', answer: '服务完成后，您可以在订单详情页对陪伴师进行评价。真实的评价可以帮助其他家长更好地选择陪伴师，也是对陪伴师工作的认可。', expanded: false },
        { id: 8, question: '支付方式有哪些？', answer: '目前支持微信支付。支付成功后，款项会暂时托管在平台，服务完成后再结算给陪伴师，保障双方权益。', expanded: false }
      ]
    })
  },

  // 展开/收起问题
  toggleFaq: function (e) {
    const id = e.currentTarget.dataset.id
    const faqList = this.data.faqList.map(item => {
      if (item.id === id) {
        item.expanded = !item.expanded
      }
      return item
    })
    this.setData({ faqList })
  },

  // 拨打电话
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.serviceInfo.phone.replace(/-/g, '')
    })
  },

  // 复制微信号
  copyWechat: function () {
    wx.setClipboardData({
      data: this.data.serviceInfo.wechat,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        })
      }
    })
  },

  // 复制邮箱
  copyEmail: function () {
    wx.setClipboardData({
      data: this.data.serviceInfo.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        })
      }
    })
  },

  // 在线客服
  handleOnlineService: function () {
    wx.navigateTo({
      url: '/pages/chat/index?userId=service&userName=智伴优程客服&userAvatar=/images/icons/service-headset.png'
    })
  },

  // 跳转到反馈页面
  goToFeedback: function () {
    wx.navigateTo({
      url: '/pages/feedback/index'
    })
  }
})
