// utils/api.js
// API接口封装

const app = getApp()

// 基础配置
const config = {
  baseUrl: 'https://api.zhibanjia.com',
  timeout: 30000
}

// 请求拦截
const requestInterceptor = (options) => {
  // 添加token
  const token = wx.getStorageSync('token')
  if (token) {
    options.header = options.header || {}
    options.header['Authorization'] = 'Bearer ' + token
  }
  
  // 添加通用参数
  options.header = options.header || {}
  options.header['Content-Type'] = 'application/json'
  
  return options
}

// 响应拦截
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  if (statusCode === 200) {
    if (data.code === 0 || data.code === 200) {
      return data.data
    } else if (data.code === 401) {
      // token过期，跳转登录
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return Promise.reject(new Error('登录已过期，请重新登录'))
    } else {
      return Promise.reject(new Error(data.message || '请求失败'))
    }
  } else {
    return Promise.reject(new Error('网络错误'))
  }
}

// 通用请求方法
const request = (url, method, data, options = {}) => {
  return new Promise((resolve, reject) => {
    let requestOptions = {
      url: config.baseUrl + url,
      method: method,
      data: data,
      timeout: config.timeout,
      ...options
    }
    
    // 请求拦截
    requestOptions = requestInterceptor(requestOptions)
    
    wx.request({
      ...requestOptions,
      success: (res) => {
        try {
          const result = responseInterceptor(res)
          if (result instanceof Promise) {
            result.then(resolve).catch(reject)
          } else {
            resolve(result)
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

// GET请求
const get = (url, params = {}) => {
  return request(url, 'GET', params)
}

// POST请求
const post = (url, data = {}) => {
  return request(url, 'POST', data)
}

// PUT请求
const put = (url, data = {}) => {
  return request(url, 'PUT', data)
}

// DELETE请求
const del = (url, data = {}) => {
  return request(url, 'DELETE', data)
}

// 文件上传
const upload = (url, filePath, name = 'file', formData = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    
    wx.uploadFile({
      url: config.baseUrl + url,
      filePath: filePath,
      name: name,
      formData: formData,
      header: {
        'Authorization': token ? 'Bearer ' + token : ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0 || data.code === 200) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })
  })
}

// ====================== API接口 ======================

// 用户相关
const userApi = {
  // 登录
  login: (data) => post('/user/login', data),
  
  // 微信登录
  wxLogin: (code) => post('/user/wx-login', { code }),
  
  // 获取验证码
  getCode: (phone) => post('/user/send-code', { phone }),
  
  // 注册
  register: (data) => post('/user/register', data),
  
  // 获取用户信息
  getUserInfo: () => get('/user/info'),
  
  // 更新用户信息
  updateUserInfo: (data) => put('/user/info', data),
  
  // 退出登录
  logout: () => post('/user/logout')
}

// 首页相关
const homeApi = {
  // 获取Banner
  getBanner: () => get('/home/banner'),
  
  // 获取服务类型
  getServiceTypes: () => get('/home/service-types'),
  
  // 获取推荐老师
  getRecommendTeachers: (params) => get('/home/recommend-teachers', params)
}

// 老师相关
const teacherApi = {
  // 获取老师列表
  getList: (params) => get('/teacher/list', params),
  
  // 获取老师详情
  getDetail: (id) => get('/teacher/detail/' + id),
  
  // 获取老师评价
  getReviews: (id, params) => get('/teacher/reviews/' + id, params),
  
  // 获取老师案例
  getCases: (id, params) => get('/teacher/cases/' + id, params),
  
  // 收藏老师
  collect: (id) => post('/teacher/collect/' + id),
  
  // 取消收藏
  uncollect: (id) => del('/teacher/collect/' + id)
}

// 订单相关
const orderApi = {
  // 创建订单
  create: (data) => post('/order/create', data),
  
  // 获取订单列表
  getList: (params) => get('/order/list', params),
  
  // 获取订单详情
  getDetail: (id) => get('/order/detail/' + id),
  
  // 取消订单
  cancel: (id, reason) => post('/order/cancel/' + id, { reason }),
  
  // 确认完成
  complete: (id) => post('/order/complete/' + id),
  
  // 评价订单
  review: (id, data) => post('/order/review/' + id, data),
  
  // 支付订单
  pay: (id) => post('/order/pay/' + id)
}

// 孩子信息相关
const childApi = {
  // 获取孩子列表
  getList: () => get('/child/list'),
  
  // 添加孩子
  add: (data) => post('/child/add', data),
  
  // 更新孩子信息
  update: (id, data) => put('/child/update/' + id, data),
  
  // 删除孩子
  remove: (id) => del('/child/delete/' + id)
}

// 消息相关
const messageApi = {
  // 获取消息列表
  getList: (params) => get('/message/list', params),
  
  // 标记已读
  markRead: (id) => post('/message/read/' + id),
  
  // 全部已读
  markAllRead: () => post('/message/read-all'),
  
  // 获取未读数量
  getUnreadCount: () => get('/message/unread-count')
}

// 案例相关
const caseApi = {
  // 获取案例列表
  getList: (params) => get('/case/list', params),
  
  // 获取案例详情
  getDetail: (id) => get('/case/detail/' + id),
  
  // 点赞案例
  like: (id) => post('/case/like/' + id),
  
  // 收藏案例
  collect: (id) => post('/case/collect/' + id)
}

// 返利相关
const rebateApi = {
  // 获取返利统计
  getStatistics: () => get('/rebate/statistics'),
  
  // 获取返利明细
  getList: (params) => get('/rebate/list', params),
  
  // 获取提现记录
  getWithdrawList: (params) => get('/rebate/withdraw-list', params),
  
  // 申请提现
  withdraw: (data) => post('/rebate/withdraw', data)
}

// 反馈相关
const feedbackApi = {
  // 提交反馈
  submit: (data) => post('/feedback/submit', data)
}

// 其他
const commonApi = {
  // 上传图片
  uploadImage: (filePath) => upload('/common/upload-image', filePath),
  
  // 获取配置
  getConfig: (key) => get('/common/config', { key })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  userApi,
  homeApi,
  teacherApi,
  orderApi,
  childApi,
  messageApi,
  caseApi,
  rebateApi,
  feedbackApi,
  commonApi
}
