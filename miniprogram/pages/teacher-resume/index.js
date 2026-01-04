// pages/teacher-resume/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 是否新用户
    isNew: false,
    
    // 简历状态
    status: 'draft', // draft: 草稿, pending: 审核中, approved: 已通过, rejected: 已拒绝
    statusText: '',
    rejectReason: '',
    
    // 基本信息
    basicInfo: {
      name: '',
      gender: '男',
      birthDate: '',
      phone: '',
      avatar: '',
      idCard: '',
      education: '',
      major: '',
      introduction: ''
    },
    
    // 服务信息
    serviceInfo: {
      serviceTypes: [],
      serviceAreas: [],
      serviceTime: '',
      pricePerHour: ''
    },
    
    // 资质证书
    certificates: [],
    
    // 工作经历
    workExperience: [],
    
    // 相册
    photos: [],
    
    // 选项数据
    genderOptions: ['男', '女'],
    educationOptions: ['高中', '大专', '本科', '硕士', '博士'],
    serviceTypeOptions: ['学科辅导', '兴趣培养', '习惯养成', '心理疏导', '升学规划', '特殊陪伴'],
    
    // 当前编辑的工作经历
    currentWork: null,
    showWorkModal: false,
    
    loading: false,
    saving: false
  },

  onLoad: function(options) {
    if (options.isNew === '1') {
      this.setData({
        isNew: true
      })
    }
    this.loadResumeData()
  },

  // 加载简历数据
  loadResumeData: function() {
    this.setData({ loading: true })
    
    // 模拟数据
    const mockData = {
      status: 'approved',
      basicInfo: {
        name: '张老师',
        gender: '女',
        birthDate: '1990-05-15',
        phone: '138****8888',
        avatar: '/images/avatar.png',
        idCard: '110***********1234',
        education: '本科',
        major: '教育学',
        introduction: '5年教育经验，擅长小学全科辅导，曾任某知名培训机构主讲老师。对待孩子有爱心、有耐心，善于发现孩子的优点并加以引导。'
      },
      serviceInfo: {
        serviceTypes: ['学科辅导', '习惯养成'],
        serviceAreas: ['海淀区', '朝阳区'],
        serviceTime: '周一至周五 14:00-20:00，周末全天',
        pricePerHour: '150'
      },
      certificates: [
        { id: 1, name: '教师资格证', image: '/images/create_env.png' },
        { id: 2, name: '心理咨询师证', image: '/images/cloud_dev.png' }
      ],
      workExperience: [
        {
          id: 1,
          company: '北京某教育培训机构',
          position: '主讲老师',
          startDate: '2019-06',
          endDate: '2023-08',
          description: '负责小学语文、数学课程教学，学生成绩提升显著'
        },
        {
          id: 2,
          company: '私人家教',
          position: '家庭教师',
          startDate: '2023-09',
          endDate: '至今',
          description: '为多个家庭提供一对一辅导服务'
        }
      ],
      photos: [
        '/images/ai_example1.png',
        '/images/ai_example2.png'
      ]
    }
    
    setTimeout(() => {
      this.setData({
        ...mockData,
        statusText: this.getStatusText(mockData.status),
        loading: false
      })
    }, 500)
  },

  // 获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      draft: '草稿',
      pending: '审核中',
      approved: '已通过',
      rejected: '审核未通过'
    }
    return statusMap[status] || ''
  },

  // 选择头像
  chooseAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'basicInfo.avatar': res.tempFilePaths[0]
        })
      }
    })
  },

  // 输入姓名
  onNameInput: function(e) {
    this.setData({
      'basicInfo.name': e.detail.value
    })
  },

  // 选择性别
  onGenderChange: function(e) {
    this.setData({
      'basicInfo.gender': this.data.genderOptions[e.detail.value]
    })
  },

  // 选择出生日期
  onBirthDateChange: function(e) {
    this.setData({
      'basicInfo.birthDate': e.detail.value
    })
  },

  // 选择学历
  onEducationChange: function(e) {
    this.setData({
      'basicInfo.education': this.data.educationOptions[e.detail.value]
    })
  },

  // 输入专业
  onMajorInput: function(e) {
    this.setData({
      'basicInfo.major': e.detail.value
    })
  },

  // 输入个人介绍
  onIntroductionInput: function(e) {
    this.setData({
      'basicInfo.introduction': e.detail.value
    })
  },

  // 选择服务类型
  onServiceTypeChange: function(e) {
    const values = e.detail.value
    const types = values.map(i => this.data.serviceTypeOptions[i])
    this.setData({
      'serviceInfo.serviceTypes': types
    })
  },

  // 输入服务区域
  onServiceAreasInput: function(e) {
    const areas = e.detail.value.split('、').filter(a => a.trim())
    this.setData({
      'serviceInfo.serviceAreas': areas
    })
  },

  // 输入服务时间
  onServiceTimeInput: function(e) {
    this.setData({
      'serviceInfo.serviceTime': e.detail.value
    })
  },

  // 输入价格
  onPriceInput: function(e) {
    this.setData({
      'serviceInfo.pricePerHour': e.detail.value
    })
  },

  // 添加证书
  addCertificate: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showModal({
          title: '证书名称',
          editable: true,
          placeholderText: '请输入证书名称',
          success: (result) => {
            if (result.confirm && result.content) {
              const certificates = [...this.data.certificates, {
                id: Date.now(),
                name: result.content,
                image: res.tempFilePaths[0]
              }]
              this.setData({ certificates })
            }
          }
        })
      }
    })
  },

  // 删除证书
  deleteCertificate: function(e) {
    const id = e.currentTarget.dataset.id
    const certificates = this.data.certificates.filter(c => c.id !== id)
    this.setData({ certificates })
  },

  // 显示添加工作经历弹窗
  showAddWorkModal: function() {
    this.setData({
      showWorkModal: true,
      currentWork: {
        id: null,
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    })
  },

  // 显示编辑工作经历弹窗
  showEditWorkModal: function(e) {
    const id = e.currentTarget.dataset.id
    const work = this.data.workExperience.find(w => w.id === id)
    this.setData({
      showWorkModal: true,
      currentWork: { ...work }
    })
  },

  // 隐藏工作经历弹窗
  hideWorkModal: function() {
    this.setData({
      showWorkModal: false,
      currentWork: null
    })
  },

  // 工作经历表单输入
  onWorkCompanyInput: function(e) {
    this.setData({ 'currentWork.company': e.detail.value })
  },
  
  onWorkPositionInput: function(e) {
    this.setData({ 'currentWork.position': e.detail.value })
  },
  
  onWorkStartDateChange: function(e) {
    this.setData({ 'currentWork.startDate': e.detail.value })
  },
  
  onWorkEndDateChange: function(e) {
    this.setData({ 'currentWork.endDate': e.detail.value })
  },
  
  onWorkDescriptionInput: function(e) {
    this.setData({ 'currentWork.description': e.detail.value })
  },

  // 保存工作经历
  saveWork: function() {
    const work = this.data.currentWork
    if (!work.company || !work.position) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    
    let workExperience = [...this.data.workExperience]
    if (work.id) {
      workExperience = workExperience.map(w => w.id === work.id ? work : w)
    } else {
      work.id = Date.now()
      workExperience.push(work)
    }
    
    this.setData({
      workExperience,
      showWorkModal: false,
      currentWork: null
    })
  },

  // 删除工作经历
  deleteWork: function(e) {
    const id = e.currentTarget.dataset.id
    const workExperience = this.data.workExperience.filter(w => w.id !== id)
    this.setData({ workExperience })
  },

  // 添加照片
  addPhoto: function() {
    const count = 6 - this.data.photos.length
    if (count <= 0) {
      wx.showToast({ title: '最多上传6张照片', icon: 'none' })
      return
    }
    
    wx.chooseImage({
      count: count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const photos = [...this.data.photos, ...res.tempFilePaths]
        this.setData({ photos })
      }
    })
  },

  // 删除照片
  deletePhoto: function(e) {
    const index = e.currentTarget.dataset.index
    const photos = [...this.data.photos]
    photos.splice(index, 1)
    this.setData({ photos })
  },

  // 预览照片
  previewPhoto: function(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.photos
    })
  },

  // 保存简历
  saveResume: function() {
    if (!this.validateForm()) return
    
    this.setData({ saving: true })
    
    setTimeout(() => {
      this.setData({
        saving: false,
        status: 'pending',
        statusText: '审核中'
      })
      
      wx.showToast({
        title: '提交成功，等待审核',
        icon: 'success'
      })
    }, 1000)
  },

  // 验证表单
  validateForm: function() {
    const { basicInfo, serviceInfo } = this.data
    
    if (!basicInfo.name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return false
    }
    if (!basicInfo.avatar) {
      wx.showToast({ title: '请上传头像', icon: 'none' })
      return false
    }
    if (!basicInfo.introduction) {
      wx.showToast({ title: '请输入个人介绍', icon: 'none' })
      return false
    }
    if (serviceInfo.serviceTypes.length === 0) {
      wx.showToast({ title: '请选择服务类型', icon: 'none' })
      return false
    }
    if (!serviceInfo.pricePerHour) {
      wx.showToast({ title: '请输入服务价格', icon: 'none' })
      return false
    }
    
    return true
  }
})
