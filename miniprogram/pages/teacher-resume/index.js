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

  onLoad: function (options) {
    if (options.isNew === '1') {
      this.setData({
        isNew: true
      })
    }
    this.loadResumeData()
  },

  // 加载简历数据
  loadResumeData: function () {
    this.setData({ loading: true })

    const db = wx.cloud.database()
    db.collection('teachers').where({
      _openid: '{openid}' // 自动匹配当前用户 openid
    }).get().then(res => {
      if (res.data.length > 0) {
        const data = res.data[0]
        this.setData({
          status: data.status || 'draft',
          statusText: this.getStatusText(data.status || 'draft'),
          basicInfo: {
            name: data.name || '',
            gender: data.gender || '男',
            birthDate: data.birthDate || '',
            phone: data.phone || '',
            avatar: data.avatar || '',
            idCard: data.idCard || '',
            education: data.education || '',
            major: data.major || '',
            introduction: data.introduction || ''
          },
          serviceInfo: {
            serviceTypes: data.serviceTypes || [],
            serviceAreas: data.serviceAreas || [],
            serviceTime: data.serviceTime || '',
            pricePerHour: data.price ? String(data.price) : ''
          },
          certificates: data.certificates || [],
          workExperience: data.workExperience || [],
          photos: data.photos || [],
          loading: false
        })
      } else {
        this.setData({ loading: false })
      }
    }).catch(err => {
      console.error('加载简历失败', err)
      this.setData({ loading: false })
      // 新用户或无权限，不做特殊处理，保持空表单
    })
  },

  // 获取状态文本
  getStatusText: function (status) {
    const statusMap = {
      draft: '草稿',
      pending: '审核中',
      approved: '已通过',
      rejected: '审核未通过'
    }
    return statusMap[status] || ''
  },

  // 选择头像
  chooseAvatar: function () {
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
  onNameInput: function (e) {
    this.setData({
      'basicInfo.name': e.detail.value
    })
  },

  // 选择性别
  onGenderChange: function (e) {
    this.setData({
      'basicInfo.gender': this.data.genderOptions[e.detail.value]
    })
  },

  // 选择出生日期
  onBirthDateChange: function (e) {
    this.setData({
      'basicInfo.birthDate': e.detail.value
    })
  },

  // 选择学历
  onEducationChange: function (e) {
    this.setData({
      'basicInfo.education': this.data.educationOptions[e.detail.value]
    })
  },

  // 输入专业
  onMajorInput: function (e) {
    this.setData({
      'basicInfo.major': e.detail.value
    })
  },

  // 输入个人介绍
  onIntroductionInput: function (e) {
    this.setData({
      'basicInfo.introduction': e.detail.value
    })
  },

  // 选择服务类型
  onServiceTypeChange: function (e) {
    const values = e.detail.value
    const types = values.map(i => this.data.serviceTypeOptions[i])
    this.setData({
      'serviceInfo.serviceTypes': types
    })
  },

  // 输入服务区域
  onServiceAreasInput: function (e) {
    const areas = e.detail.value.split('、').filter(a => a.trim())
    this.setData({
      'serviceInfo.serviceAreas': areas
    })
  },

  // 输入服务时间
  onServiceTimeInput: function (e) {
    this.setData({
      'serviceInfo.serviceTime': e.detail.value
    })
  },

  // 输入价格
  onPriceInput: function (e) {
    this.setData({
      'serviceInfo.pricePerHour': e.detail.value
    })
  },

  // 添加证书
  addCertificate: function () {
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
  deleteCertificate: function (e) {
    const id = e.currentTarget.dataset.id
    const certificates = this.data.certificates.filter(c => c.id !== id)
    this.setData({ certificates })
  },

  // 显示添加工作经历弹窗
  showAddWorkModal: function () {
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
  showEditWorkModal: function (e) {
    const id = e.currentTarget.dataset.id
    const work = this.data.workExperience.find(w => w.id === id)
    this.setData({
      showWorkModal: true,
      currentWork: { ...work }
    })
  },

  // 隐藏工作经历弹窗
  hideWorkModal: function () {
    this.setData({
      showWorkModal: false,
      currentWork: null
    })
  },

  // 工作经历表单输入
  onWorkCompanyInput: function (e) {
    this.setData({ 'currentWork.company': e.detail.value })
  },

  onWorkPositionInput: function (e) {
    this.setData({ 'currentWork.position': e.detail.value })
  },

  onWorkStartDateChange: function (e) {
    this.setData({ 'currentWork.startDate': e.detail.value })
  },

  onWorkEndDateChange: function (e) {
    this.setData({ 'currentWork.endDate': e.detail.value })
  },

  onWorkDescriptionInput: function (e) {
    this.setData({ 'currentWork.description': e.detail.value })
  },

  // 保存工作经历
  saveWork: function () {
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
  deleteWork: function (e) {
    const id = e.currentTarget.dataset.id
    const workExperience = this.data.workExperience.filter(w => w.id !== id)
    this.setData({ workExperience })
  },

  // 添加照片
  addPhoto: function () {
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
  deletePhoto: function (e) {
    const index = e.currentTarget.dataset.index
    const photos = [...this.data.photos]
    photos.splice(index, 1)
    this.setData({ photos })
  },

  // 预览照片
  previewPhoto: function (e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.photos
    })
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
    const uploads = []

    // 上传头像
    if (this.data.basicInfo.avatar && !this.data.basicInfo.avatar.startsWith('cloud://')) {
      uploads.push(
        this.uploadImage(this.data.basicInfo.avatar, `teacher-avatars/${timestamp}_avatar.jpg`)
          .then(fileId => { this.data.basicInfo.avatar = fileId })
      )
    }

    // 上传证书图片
    for (let i = 0; i < this.data.certificates.length; i++) {
      const cert = this.data.certificates[i]
      if (cert.image && !cert.image.startsWith('cloud://')) {
        uploads.push(
          this.uploadImage(cert.image, `teacher-certificates/${timestamp}_cert_${i}.jpg`)
            .then(fileId => { this.data.certificates[i].image = fileId })
        )
      }
    }

    // 上传相册图片
    for (let i = 0; i < this.data.photos.length; i++) {
      const photo = this.data.photos[i]
      if (photo && !photo.startsWith('cloud://')) {
        uploads.push(
          this.uploadImage(photo, `teacher-photos/${timestamp}_photo_${i}.jpg`)
            .then(fileId => { this.data.photos[i] = fileId })
        )
      }
    }

    await Promise.all(uploads)
  },

  // 保存简历
  saveResume: async function () {
    if (!this.validateForm()) return

    this.setData({ saving: true })

    try {
      // 先上传所有图片到云存储
      wx.showLoading({ title: '上传图片中...' })
      await this.uploadAllImages()
      wx.hideLoading()

      wx.showLoading({ title: '保存中...' })

      const db = wx.cloud.database()
      const data = {
        name: this.data.basicInfo.name,
        avatar: this.data.basicInfo.avatar,
        gender: this.data.basicInfo.gender,
        introduction: this.data.basicInfo.introduction,
        birthDate: this.data.basicInfo.birthDate,
        phone: this.data.basicInfo.phone,
        idCard: this.data.basicInfo.idCard,
        education: this.data.basicInfo.education,
        major: this.data.basicInfo.major,

        serviceTypes: this.data.serviceInfo.serviceTypes,
        serviceAreas: this.data.serviceInfo.serviceAreas,
        serviceTime: this.data.serviceInfo.serviceTime,
        price: Number(this.data.serviceInfo.pricePerHour),
        priceUnit: '小时',

        certificates: this.data.certificates,
        workExperience: this.data.workExperience,
        photos: this.data.photos,

        status: 'pending',
        updateTime: db.serverDate()
      }

      const res = await db.collection('teachers').where({
        _openid: '{openid}'
      }).get()

      if (res.data.length > 0) {
        const id = res.data[0]._id
        await db.collection('teachers').doc(id).update({ data: data })
      } else {
        await db.collection('teachers').add({
          data: { ...data, createTime: db.serverDate(), orderCount: 0, rating: 5.0 }
        })
      }

      wx.hideLoading()
      this.setData({
        saving: false,
        status: 'pending',
        statusText: '审核中'
      })
      wx.showToast({ title: '提交成功，等待审核', icon: 'success' })
    } catch (err) {
      console.error('保存失败', err)
      wx.hideLoading()
      this.setData({ saving: false })
      wx.showToast({ title: '提交失败: ' + (err.errMsg || '未知错误'), icon: 'none' })
    }
  },

  // 验证表单
  validateForm: function () {
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
