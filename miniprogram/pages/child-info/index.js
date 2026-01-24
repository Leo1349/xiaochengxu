// pages/child-info/index.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    // 孩子列表
    childList: [],

    // 是否显示添加/编辑弹窗
    showModal: false,
    modalType: 'add', // add: 添加, edit: 编辑

    // 当前编辑的孩子
    currentChild: {
      id: null,
      name: '',
      gender: '男',
      birthDate: '',
      grade: '',
      school: '',
      interests: '',
      weakSubjects: '',
      personality: '',
      remark: ''
    },

    // 性别选项
    genderOptions: ['男', '女'],

    // 年级选项
    gradeOptions: [
      '幼儿园小班', '幼儿园中班', '幼儿园大班',
      '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级'
    ],

    // 日期选择范围
    minDate: '2005-01-01',
    maxDate: '',

    loading: false
  },

  onLoad: function (options) {
    this.initDateRange()
    this.loadChildList()

    if (options.action === 'add') {
      this.showAddModal()
    }
  },

  onShow: function () {
    this.loadChildList()
  },

  // 初始化日期范围
  initDateRange: function () {
    const today = new Date()
    const maxDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    this.setData({
      maxDate: maxDate
    })
  },

  // 加载孩子列表
  loadChildList: function () {
    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'manageChild',
      data: { action: 'list' },
      success: res => {
        if (res.result.success) {
          this.setData({
            childList: res.result.data.list,
            loading: false
          })
        } else {
          console.error(res.result.error)
          this.setData({ loading: false })
          wx.showToast({ title: '加载失败', icon: 'none' })
        }
      },
      fail: err => {
        console.error(err)
        this.setData({ loading: false })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 显示添加弹窗
  showAddModal: function () {
    this.setData({
      showModal: true,
      modalType: 'add',
      currentChild: {
        id: null,
        name: '',
        gender: '男',
        birthDate: '',
        grade: '',
        school: '',
        interests: '',
        weakSubjects: '',
        personality: '',
        remark: ''
      }
    })
  },

  // 显示编辑弹窗
  showEditModal: function (e) {
    const id = e.currentTarget.dataset.id
    const child = this.data.childList.find(item => item.id === id || item._id === id)
    if (child) {
      this.setData({
        showModal: true,
        modalType: 'edit',
        currentChild: {
          id: child.id || child._id,
          name: child.name || '',
          gender: child.gender || '男',
          birthDate: child.birthDate || '',
          grade: child.grade || '',
          school: child.school || '',
          interests: child.interests || '',
          weakSubjects: child.weakSubjects || '',
          personality: child.personality || '',
          remark: child.remark || ''
        }
      })
    }
  },

  // 隐藏弹窗
  hideModal: function () {
    this.setData({
      showModal: false
    })
  },

  // 表单输入处理
  onNameInput: function (e) {
    this.setData({ 'currentChild.name': e.detail.value })
  },

  onGenderChange: function (e) {
    this.setData({ 'currentChild.gender': this.data.genderOptions[e.detail.value] })
  },

  onBirthDateChange: function (e) {
    this.setData({ 'currentChild.birthDate': e.detail.value })
  },

  onGradeChange: function (e) {
    this.setData({ 'currentChild.grade': this.data.gradeOptions[e.detail.value] })
  },

  onSchoolInput: function (e) {
    this.setData({ 'currentChild.school': e.detail.value })
  },

  onInterestsInput: function (e) {
    this.setData({ 'currentChild.interests': e.detail.value })
  },

  onWeakSubjectsInput: function (e) {
    this.setData({ 'currentChild.weakSubjects': e.detail.value })
  },

  onPersonalityInput: function (e) {
    this.setData({ 'currentChild.personality': e.detail.value })
  },

  onRemarkInput: function (e) {
    this.setData({ 'currentChild.remark': e.detail.value })
  },

  // 表单验证
  validateForm: function () {
    const child = this.data.currentChild
    if (!child.name.trim()) {
      wx.showToast({ title: '请输入孩子姓名', icon: 'none' })
      return false
    }
    if (!child.birthDate) {
      wx.showToast({ title: '请选择出生日期', icon: 'none' })
      return false
    }
    if (!child.grade) {
      wx.showToast({ title: '请选择年级', icon: 'none' })
      return false
    }
    return true
  },

  // 保存孩子信息
  saveChild: function () {
    if (!this.validateForm()) return

    const child = this.data.currentChild
    // 计算年龄
    const birthDate = new Date(child.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    if (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--
    }
    child.age = age

    const action = this.data.modalType === 'add' ? 'add' : 'update'
    const data = {
      action: action,
      childId: child.id, // add 时忽略
      childData: child
    }

    wx.showLoading({ title: '保存中...' })

    wx.cloud.callFunction({
      name: 'manageChild',
      data: data,
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          wx.showToast({ title: '保存成功', icon: 'success' })
          this.hideModal()
          this.loadChildList()
        } else {
          wx.showToast({ title: res.result.error || '保存失败', icon: 'none' })
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error(err)
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 删除孩子
  deleteChild: function (e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '提示',
      content: '确定删除该孩子信息吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          wx.cloud.callFunction({
            name: 'manageChild',
            data: { action: 'delete', childId: id },
            success: res => {
              wx.hideLoading()
              if (res.result.success) {
                wx.showToast({ title: '删除成功', icon: 'success' })
                this.loadChildList()
              } else {
                wx.showToast({ title: res.result.error || '删除失败', icon: 'none' })
              }
            },
            fail: err => {
              wx.hideLoading()
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  }
})
