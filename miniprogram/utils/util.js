// utils/util.js
// 工具函数

/**
 * 格式化时间
 * @param {Date|string|number} date 日期
 * @param {string} format 格式
 * @returns {string}
 */
const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date)
  }
  
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const formatMap = {
    'YYYY': year,
    'MM': month.toString().padStart(2, '0'),
    'DD': day.toString().padStart(2, '0'),
    'HH': hour.toString().padStart(2, '0'),
    'mm': minute.toString().padStart(2, '0'),
    'ss': second.toString().padStart(2, '0'),
    'M': month,
    'D': day,
    'H': hour,
    'm': minute,
    's': second
  }

  let result = format
  for (const key in formatMap) {
    result = result.replace(key, formatMap[key])
  }
  
  return result
}

/**
 * 获取相对时间
 * @param {Date|string|number} date 日期
 * @returns {string}
 */
const getRelativeTime = (date) => {
  if (!date) return ''
  
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date)
  }
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前'
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前'
  } else {
    return Math.floor(diff / year) + '年前'
  }
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 验证身份证号
 * @param {string} idCard 身份证号
 * @returns {boolean}
 */
const isValidIdCard = (idCard) => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

/**
 * 隐藏手机号中间四位
 * @param {string} phone 手机号
 * @returns {string}
 */
const hidePhone = (phone) => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 隐藏身份证号
 * @param {string} idCard 身份证号
 * @returns {string}
 */
const hideIdCard = (idCard) => {
  if (!idCard || idCard.length < 15) return idCard
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2')
}

/**
 * 隐藏银行卡号
 * @param {string} cardNo 银行卡号
 * @returns {string}
 */
const hideBankCard = (cardNo) => {
  if (!cardNo || cardNo.length < 8) return cardNo
  return '**** **** **** ' + cardNo.slice(-4)
}

/**
 * 格式化金额
 * @param {number} amount 金额
 * @param {number} decimals 小数位数
 * @returns {string}
 */
const formatMoney = (amount, decimals = 2) => {
  if (isNaN(amount)) return '0.00'
  return parseFloat(amount).toFixed(decimals)
}

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {number} interval 间隔时间
 * @returns {Function}
 */
const throttle = (fn, interval = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {*} obj 要拷贝的对象
 * @returns {*}
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (obj instanceof Object) {
    const copy = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = deepClone(obj[key])
      }
    }
    return copy
  }
  
  return obj
}

/**
 * 生成唯一ID
 * @returns {string}
 */
const generateId = () => {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取年龄
 * @param {string} birthday 生日
 * @returns {number}
 */
const getAge = (birthday) => {
  if (!birthday) return 0
  
  const birthDate = new Date(birthday)
  const today = new Date()
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * 计算距离
 * @param {number} lat1 纬度1
 * @param {number} lon1 经度1
 * @param {number} lat2 纬度2
 * @param {number} lon2 经度2
 * @returns {string}
 */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // 地球半径（千米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  if (distance < 1) {
    return (distance * 1000).toFixed(0) + 'm'
  } else {
    return distance.toFixed(1) + 'km'
  }
}

/**
 * 显示加载提示
 * @param {string} title 提示文字
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示消息提示
 * @param {string} title 提示文字
 * @param {string} icon 图标
 */
const showToast = (title, icon = 'none') => {
  wx.showToast({
    title: title,
    icon: icon,
    duration: 2000
  })
}

/**
 * 显示成功提示
 * @param {string} title 提示文字
 */
const showSuccess = (title) => {
  showToast(title, 'success')
}

/**
 * 显示错误提示
 * @param {string} title 提示文字
 */
const showError = (title) => {
  showToast(title, 'error')
}

/**
 * 显示模态框
 * @param {object} options 配置项
 * @returns {Promise}
 */
const showModal = (options) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      showCancel: options.showCancel !== false,
      cancelText: options.cancelText || '取消',
      confirmText: options.confirmText || '确定',
      success: (res) => {
        if (res.confirm) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: reject
    })
  })
}

/**
 * 检查是否登录
 * @returns {boolean}
 */
const isLoggedIn = () => {
  const token = wx.getStorageSync('token')
  const userInfo = wx.getStorageSync('userInfo')
  return !!(token && userInfo)
}

/**
 * 获取用户信息
 * @returns {object|null}
 */
const getUserInfo = () => {
  return wx.getStorageSync('userInfo') || null
}

/**
 * 获取用户角色
 * @returns {string}
 */
const getUserRole = () => {
  const userInfo = getUserInfo()
  return userInfo ? (userInfo.role || 'parent') : 'parent'
}

module.exports = {
  formatTime,
  getRelativeTime,
  isValidPhone,
  isValidEmail,
  isValidIdCard,
  hidePhone,
  hideIdCard,
  hideBankCard,
  formatMoney,
  debounce,
  throttle,
  deepClone,
  generateId,
  getAge,
  getDistance,
  showLoading,
  hideLoading,
  showToast,
  showSuccess,
  showError,
  showModal,
  isLoggedIn,
  getUserInfo,
  getUserRole
}
