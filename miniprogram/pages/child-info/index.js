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

  onLoad: function(options) {
    this.initDateRange()
    this.loadChildList()
    
    if (options.action === 'add') {
      this.showAddModal()
    }
  },

  onShow: function() {
    this.loadChildList()
  },

  // 初始化日期范围
  initDateRange: function() {
    const today = new Date()
    const maxDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    this.setData({
      maxDate: maxDate
    })
  },

  // 加载孩子列表
  loadChildList: function() {
    this.setData({ loading: true })
    
    // 模拟数据
    const mockChildren = [
      {
        id: 1,
        name: '小明',
        gender: '男',
        birthDate: '2018-05-15',
        age: 7,
        grade: '小学二年级',
        school: '北京市海淀区实验小学',
        interests: '阅读、绘画、足球',
        weakSubjects: '数学',
        personality: '活泼开朗，好奇心强',
        remark: '注意力有时不够集中'
      },
      {
        id: 2,
        name: '小红',
        gender: '女',
        birthDate: '2016-08-20',
        age: 9,
        grade: '小学四年级',
        school: '北京市朝阳区第一小学',
        interests: '舞蹈、钢琴',
        weakSubjects: '英语',
        personality: '文静内向，认真细心',
        remark: ''
      }
    ]
    
    setTimeout(() => {
      this.setData({
        childList: mockChildren,
        loading: false
      })
    }, 300)
  },

  // 显示添加弹窗
  showAddModal: function() {
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
  showEditModal: function(e) {
    const id = e.currentTarget.dataset.id
    const child = this.data.childList.find(c => c.id === id)
    
    this.setData({
      showModal: true,
      modalType: 'edit',
      currentChild: { ...child }
    })
  },

  // 隐藏弹窗
  hideModal: function() {
    this.setData({
      showModal: false
    })
  },

  // 输入名字
  onNameInput: function(e) {
    this.setData({
      'currentChild.name': e.detail.value
    })
  },

  // 选择性别
  onGenderChange: function(e) {
    this.setData({
      'currentChild.gender': this.data.genderOptions[e.detail.value]
    })
  },

  // 选择出生日期
  onBirthDateChange: function(e) {
    this.setData({
      'currentChild.birthDate': e.detail.value
    })
  },

  // 选择年级
  onGradeChange: function(e) {
    this.setData({
      'currentChild.grade': this.data.gradeOptions[e.detail.value]
    })
  },

  // 输入学校
  onSchoolInput: function(e) {
    this.setData({
      'currentChild.school': e.detail.value
    })
  },

  // 输入兴趣爱好
  onInterestsInput: function(e) {
    this.setData({
      'currentChild.interests': e.detail.value
    })
  },

  // 输入薄弱科目
  onWeakSubjectsInput: function(e) {
    this.setData({
      'currentChild.weakSubjects': e.detail.value
    })
  },

  // 输入性格特点
  onPersonalityInput: function(e) {
    this.setData({
      'currentChild.personality': e.detail.value
    })
  },

  // 输入备注
  onRemarkInput: function(e) {
    this.setData({
      'currentChild.remark': e.detail.value
    })
  },

  // 验证表单
  validateForm: function() {
    const child = this.data.currentChild
    
    if (!child.name) {
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
  saveChild: function() {
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
    
    if (this.data.modalType === 'add') {
      // 添加
      child.id = Date.now()
      const childList = [...this.data.childList, child]
      this.setData({
        childList: childList,
        showModal: false
      })
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } else {
      // 编辑
      const childList = this.data.childList.map(c => {
        if (c.id === child.id) {
          return child
        }
        return c
      })
      
      this.setData({
        childList: childList,
        showModal: false
      })
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  },

  // 删除孩子
  deleteChild: function(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '提示',
      content: '确定删除该孩子信息吗？',
      success: (res) => {
        if (res.confirm) {
          const childList = this.data.childList.filter(c => c.id !== id)
          this.setData({
            childList: childList
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})
