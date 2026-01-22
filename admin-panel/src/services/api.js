/**
 * API 服务层 - 调用云函数
 * 
 * 支持三种模式：
 * 1. DEV_MODE: 开发模式，使用模拟数据
 * 2. PROXY_MODE: 代理模式，通过本地代理服务调用云函数
 * 3. 生产模式: 直接调用云函数 HTTP 触发器
 */
import axios from 'axios'

// ==================== 模式配置 ====================
// 开发模式：使用模拟数据
const DEV_MODE = false

// 代理模式：通过本地代理服务调用云函数（推荐本地开发使用）
const PROXY_MODE = true

// 代理服务地址
const PROXY_URL = 'http://localhost:3001/api/cloud'

// 云函数直接调用配置（生产模式，需要 HTTP 触发器）
const CLOUD_CONFIG = {
    baseURL: 'https://your-env-id.service.tcloudbase.com',
    functionName: 'adminFunctions'
}

/**
 * 调用云函数
 */
async function callCloudFunction(type, data = {}) {
    // 开发模式：返回模拟数据
    if (DEV_MODE) {
        return mockResponse(type, data)
    }

    // 代理模式：通过本地代理服务调用
    if (PROXY_MODE) {
        try {
            const response = await axios.post(PROXY_URL, { type, data })
            return response.data
        } catch (error) {
            console.error('Proxy call error:', error)
            return { success: false, error: error.message || '代理服务调用失败' }
        }
    }

    // 生产模式：直接调用云函数
    try {
        const response = await axios.post(
            `${CLOUD_CONFIG.baseURL}/${CLOUD_CONFIG.functionName}`,
            { type, data },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-WX-SERVICE-TOKEN': localStorage.getItem('adminToken') || ''
                }
            }
        )
        return response.data
    } catch (error) {
        console.error('Cloud function error:', error)
        return { success: false, error: error.message }
    }
}

// ==================== API 导出 ====================

export const api = {
    // 登录
    login: (username, password) => callCloudFunction('login', { username, password }),

    // 统计
    getStats: () => callCloudFunction('getStats'),

    // 老师管理
    getTeachers: (params) => callCloudFunction('getTeachers', params),
    addTeacher: (data) => callCloudFunction('addTeacher', data),
    updateTeacher: (data) => callCloudFunction('updateTeacher', data),
    deleteTeacher: (_id) => callCloudFunction('deleteTeacher', { _id }),

    // 轮播图管理
    getBanners: (params) => callCloudFunction('getBanners', params),
    addBanner: (data) => callCloudFunction('addBanner', data),
    updateBanner: (data) => callCloudFunction('updateBanner', data),
    deleteBanner: (_id) => callCloudFunction('deleteBanner', { _id }),

    // 订单管理
    getOrders: (params) => callCloudFunction('getOrders', params),
    updateOrderStatus: (_id, status) => callCloudFunction('updateOrderStatus', { _id, status }),

    // 用户管理
    getUsers: (params) => callCloudFunction('getUsers', params),

    // 反馈管理
    getFeedbacks: (params) => callCloudFunction('getFeedbacks', params),
    updateFeedbackStatus: (_id, status) => callCloudFunction('updateFeedbackStatus', { _id, status }),

    // 图片上传
    uploadImage: async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        try {
            const response = await axios.post('http://localhost:3001/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        } catch (error) {
            console.error('Upload error:', error)
            return { success: false, error: error.message || '上传失败' }
        }
    },

    // 刷新单个云存储图片链接
    refreshImageUrl: async (fileId) => {
        try {
            const response = await axios.post('http://localhost:3001/api/refresh-url', { fileId })
            return response.data
        } catch (error) {
            console.error('Refresh URL error:', error)
            return { success: false, error: error.message || '刷新链接失败' }
        }
    },

    // 批量刷新云存储图片链接
    refreshImageUrls: async (fileIds) => {
        try {
            const response = await axios.post('http://localhost:3001/api/refresh-url', { fileIds })
            return response.data
        } catch (error) {
            console.error('Refresh URLs error:', error)
            return { success: false, error: error.message || '刷新链接失败' }
        }
    }
}

// ==================== 模拟数据（开发模式） ====================

function mockResponse(type, data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getMockData(type, data))
        }, 300)
    })
}

function getMockData(type, data) {
    switch (type) {
        case 'login':
            const admins = [
                { username: 'admin', password: 'admin123', role: 'super' },
                { username: 'operator', password: 'operator123', role: 'operator' }
            ]
            const admin = admins.find(a => a.username === data.username && a.password === data.password)
            if (admin) {
                return {
                    success: true,
                    data: { username: admin.username, role: admin.role, token: 'mock_token_' + Date.now() }
                }
            }
            return { success: false, error: '用户名或密码错误' }

        case 'getStats':
            return {
                success: true,
                data: {
                    totalTeachers: 12,
                    totalOrders: 156,
                    todayOrders: 8,
                    totalUsers: 328,
                    todayUsers: 15,
                    pendingFeedbacks: 3
                }
            }

        case 'getTeachers':
            return {
                success: true,
                data: {
                    list: [
                        { _id: '1', name: '张老师', gender: 'male', title: '专业陪伴师', rating: 4.9, orderCount: 128, tags: ['学科辅导', '耐心细致'], price: 150, isRecommended: true, createTime: '2026-01-15 10:00:00' },
                        { _id: '2', name: '李老师', gender: 'female', title: '资深家教', rating: 4.8, orderCount: 96, tags: ['英语专精', '口语流利'], price: 180, isRecommended: true, createTime: '2026-01-14 09:30:00' },
                        { _id: '3', name: '王老师', gender: 'female', title: '金牌陪伴师', rating: 5.0, orderCount: 210, tags: ['全能型', '心理辅导'], price: 200, isRecommended: false, createTime: '2026-01-13 14:20:00' }
                    ],
                    total: 3,
                    page: 1,
                    pageSize: 20
                }
            }

        case 'getBanners':
            return {
                success: true,
                data: {
                    list: [
                        { _id: '1', title: '新年优惠活动', url: '/images/ai_example1.png', link: '', order: 1, isActive: true, createTime: '2026-01-15 10:00:00' },
                        { _id: '2', title: '精选陪伴师推荐', url: '/images/ai_example2.png', link: '', order: 2, isActive: true, createTime: '2026-01-14 09:30:00' }
                    ],
                    total: 2,
                    page: 1,
                    pageSize: 20
                }
            }

        case 'getOrders':
            return {
                success: true,
                data: {
                    list: [
                        { _id: '1', orderNo: 'ORD1767580544457', teacherName: '张老师', serviceName: '学科辅导', childName: '小明', serviceDate: '2026-01-20', serviceTime: '14:00', serviceDuration: 2, address: '北京市海淀区', totalPrice: 300, status: 'pending', createTime: '2026-01-18 10:30:00' },
                        { _id: '2', orderNo: 'ORD1767480544123', teacherName: '李老师', serviceName: '英语辅导', childName: '小红', serviceDate: '2026-01-19', serviceTime: '16:00', serviceDuration: 1.5, address: '北京市朝阳区', totalPrice: 270, status: 'confirmed', createTime: '2026-01-17 15:20:00' }
                    ],
                    total: 2,
                    page: 1,
                    pageSize: 20
                }
            }

        case 'getUsers':
            return {
                success: true,
                data: {
                    list: [
                        { _id: '1', _openid: 'oXXXXXXXXXXXXXXX1', nickName: '张三', avatarUrl: '', phone: '138****1234', currentRole: 'parent', createTime: '2026-01-15 10:00:00', lastLoginTime: '2026-01-20 08:30:00', orderCount: 5 },
                        { _id: '2', _openid: 'oXXXXXXXXXXXXXXX2', nickName: '李四', avatarUrl: '', phone: '139****5678', currentRole: 'parent', createTime: '2026-01-14 09:30:00', lastLoginTime: '2026-01-19 14:20:00', orderCount: 3 }
                    ],
                    total: 2,
                    page: 1,
                    pageSize: 20
                }
            }

        case 'getFeedbacks':
            return {
                success: true,
                data: {
                    list: [
                        { _id: '1', type: 'suggestion', content: '希望能增加更多的筛选条件', images: [], contact: '13800138001', status: 'pending', createTime: '2026-01-20 10:30:00' },
                        { _id: '2', type: 'bug', content: '点击联系老师按钮没有反应', images: [], contact: '', status: 'processing', createTime: '2026-01-19 15:20:00' }
                    ],
                    total: 2,
                    page: 1,
                    pageSize: 20
                }
            }

        case 'addTeacher':
        case 'updateTeacher':
        case 'deleteTeacher':
        case 'addBanner':
        case 'updateBanner':
        case 'deleteBanner':
        case 'updateOrderStatus':
        case 'updateFeedbackStatus':
            return { success: true }

        default:
            return { success: false, error: '未知操作' }
    }
}

export default api
