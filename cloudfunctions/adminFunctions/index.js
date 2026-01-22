/**
 * 管理后台云函数
 * 支持所有后台管理操作：老师、轮播图、订单、用户、反馈等
 * 
 * 支持两种调用方式：
 * 1. 小程序端通过 wx.cloud.callFunction 调用
 * 2. Web 端通过 HTTP API 触发器调用
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 管理员账号配置（生产环境建议使用环境变量或数据库）
const ADMINS = [
    { username: 'admin', password: 'admin123', role: 'super' },
    { username: 'operator', password: 'operator123', role: 'operator' }
]

// CORS 响应头，用于 HTTP API 调用
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-WX-SERVICE-TOKEN',
    'Content-Type': 'application/json'
}

/**
 * 包装响应，添加 CORS 头（用于 HTTP API 调用）
 */
function wrapResponse(result, isHttpCall = false) {
    if (isHttpCall) {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(result)
        }
    }
    return result
}

exports.main = async (event, context) => {
    // 判断是否为 HTTP API 调用
    const isHttpCall = event.httpMethod !== undefined

    // 处理 OPTIONS 预检请求（CORS）
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: ''
        }
    }

    // 解析请求参数
    let type, data
    if (isHttpCall) {
        // HTTP 调用：从 body 中解析参数
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
        type = body.type
        data = body.data || {}
    } else {
        // 小程序调用：直接使用 event
        type = event.type
        data = event.data || {}
    }

    try {
        let result
        switch (type) {
            // ==================== 登录 ====================
            case 'login':
                result = handleLogin(data)
                break

            // ==================== 统计 ====================
            case 'getStats':
                result = await handleGetStats()
                break

            // ==================== 老师管理 ====================
            case 'getTeachers':
                result = await handleGetTeachers(data)
                break
            case 'addTeacher':
                result = await handleAddTeacher(data)
                break
            case 'updateTeacher':
                result = await handleUpdateTeacher(data)
                break
            case 'deleteTeacher':
                result = await handleDeleteTeacher(data)
                break

            // ==================== 轮播图管理 ====================
            case 'getBanners':
                result = await handleGetBanners(data)
                break
            case 'addBanner':
                result = await handleAddBanner(data)
                break
            case 'updateBanner':
                result = await handleUpdateBanner(data)
                break
            case 'deleteBanner':
                result = await handleDeleteBanner(data)
                break

            // ==================== 订单管理 ====================
            case 'getOrders':
                result = await handleGetOrders(data)
                break
            case 'updateOrderStatus':
                result = await handleUpdateOrderStatus(data)
                break

            // ==================== 用户管理 ====================
            case 'getUsers':
                result = await handleGetUsers(data)
                break

            // ==================== 反馈管理 ====================
            case 'getFeedbacks':
                result = await handleGetFeedbacks(data)
                break
            case 'updateFeedbackStatus':
                result = await handleUpdateFeedbackStatus(data)
                break

            default:
                result = { success: false, error: '未知操作类型' }
        }
        return wrapResponse(result, isHttpCall)
    } catch (err) {
        console.error('adminFunctions error:', err)
        return wrapResponse({ success: false, error: err.message || '操作失败' }, isHttpCall)
    }
}

// ==================== 登录处理 ====================
function handleLogin(data) {
    const { username, password } = data
    const admin = ADMINS.find(a => a.username === username && a.password === password)

    if (admin) {
        return {
            success: true,
            data: {
                username: admin.username,
                role: admin.role,
                token: 'admin_token_' + Date.now()
            }
        }
    }
    return { success: false, error: '用户名或密码错误' }
}

// ==================== 统计处理 ====================
async function handleGetStats() {
    // 安全计数函数：集合不存在时返回 0
    async function safeCount(collection, query = {}) {
        try {
            const result = await db.collection(collection).where(query).count()
            return result.total || 0
        } catch (err) {
            console.warn(`Collection ${collection} count failed:`, err.message)
            return 0
        }
    }

    // 并行获取所有统计数据
    const [teacherCount, orderCount, userCount, feedbackCount] = await Promise.all([
        safeCount('teachers'),
        safeCount('orders'),
        safeCount('users'),
        safeCount('feedbacks', { status: 'pending' })
    ])

    // 获取今日数据
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayOrders, todayUsers] = await Promise.all([
        safeCount('orders', { createTime: _.gte(today) }),
        safeCount('users', { createTime: _.gte(today) })
    ])

    return {
        success: true,
        data: {
            totalTeachers: teacherCount,
            totalOrders: orderCount,
            todayOrders: todayOrders,
            totalUsers: userCount,
            todayUsers: todayUsers,
            pendingFeedbacks: feedbackCount
        }
    }
}

// ==================== 老师管理 ====================
async function handleGetTeachers(data) {
    const { page = 1, pageSize = 20, keyword = '' } = data
    const skip = (page - 1) * pageSize

    let query = {}
    if (keyword) {
        query.name = db.RegExp({ regexp: keyword, options: 'i' })
    }

    const [countRes, listRes] = await Promise.all([
        db.collection('teachers').where(query).count(),
        db.collection('teachers')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()
    ])

    return {
        success: true,
        data: {
            list: listRes.data,
            total: countRes.total,
            page,
            pageSize
        }
    }
}

async function handleAddTeacher(data) {
    const {
        name, gender, avatar, title, price, tags, introduction,
        education, experience, serviceTime, serviceArea, isRecommended
    } = data

    if (!name) {
        return { success: false, error: '姓名不能为空' }
    }

    const teacher = {
        name,
        gender: gender || 'male',
        avatar: avatar || '',
        title: title || '',
        rating: 5.0,
        orderCount: 0,
        tags: tags || [],
        price: price || 0,
        introduction: introduction || '',
        education: education || '',
        experience: experience || '',
        serviceTime: serviceTime || '',
        serviceArea: serviceArea || '',
        photos: [],
        isRecommended: isRecommended || false,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
    }

    const res = await db.collection('teachers').add({ data: teacher })
    return { success: true, data: { _id: res._id } }
}

async function handleUpdateTeacher(data) {
    const { _id, ...updateData } = data

    if (!_id) {
        return { success: false, error: 'ID不能为空' }
    }

    updateData.updateTime = db.serverDate()
    await db.collection('teachers').doc(_id).update({ data: updateData })
    return { success: true }
}

async function handleDeleteTeacher(data) {
    const { _id } = data

    if (!_id) {
        return { success: false, error: 'ID不能为空' }
    }

    await db.collection('teachers').doc(_id).remove()
    return { success: true }
}

// ==================== 轮播图管理 ====================
async function handleGetBanners(data) {
    const { page = 1, pageSize = 20 } = data
    const skip = (page - 1) * pageSize

    const [countRes, listRes] = await Promise.all([
        db.collection('banners').count(),
        db.collection('banners')
            .orderBy('order', 'asc')
            .skip(skip)
            .limit(pageSize)
            .get()
    ])

    return {
        success: true,
        data: {
            list: listRes.data,
            total: countRes.total,
            page,
            pageSize
        }
    }
}

async function handleAddBanner(data) {
    const { title, url, link, order, isActive } = data

    if (!title || !url) {
        return { success: false, error: '标题和图片地址不能为空' }
    }

    const banner = {
        title,
        url,
        link: link || '',
        order: order || 1,
        isActive: isActive !== false,
        createTime: db.serverDate()
    }

    const res = await db.collection('banners').add({ data: banner })
    return { success: true, data: { _id: res._id } }
}

async function handleUpdateBanner(data) {
    const { _id, ...updateData } = data

    if (!_id) {
        return { success: false, error: 'ID不能为空' }
    }

    await db.collection('banners').doc(_id).update({ data: updateData })
    return { success: true }
}

async function handleDeleteBanner(data) {
    const { _id } = data

    if (!_id) {
        return { success: false, error: 'ID不能为空' }
    }

    await db.collection('banners').doc(_id).remove()
    return { success: true }
}

// ==================== 订单管理 ====================
async function handleGetOrders(data) {
    const { page = 1, pageSize = 20, status, keyword } = data
    const skip = (page - 1) * pageSize

    let query = {}
    if (status && status !== 'all') {
        query.status = status
    }
    if (keyword) {
        query.orderNo = db.RegExp({ regexp: keyword, options: 'i' })
    }

    const [countRes, listRes] = await Promise.all([
        db.collection('orders').where(query).count(),
        db.collection('orders')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()
    ])

    return {
        success: true,
        data: {
            list: listRes.data,
            total: countRes.total,
            page,
            pageSize
        }
    }
}

async function handleUpdateOrderStatus(data) {
    const { _id, status } = data

    if (!_id || !status) {
        return { success: false, error: 'ID和状态不能为空' }
    }

    await db.collection('orders').doc(_id).update({
        data: {
            status,
            updateTime: db.serverDate()
        }
    })
    return { success: true }
}

// ==================== 用户管理 ====================
async function handleGetUsers(data) {
    const { page = 1, pageSize = 20, role, keyword } = data
    const skip = (page - 1) * pageSize

    let query = {}
    if (role && role !== 'all') {
        query.currentRole = role
    }
    if (keyword) {
        query.nickName = db.RegExp({ regexp: keyword, options: 'i' })
    }

    const [countRes, listRes] = await Promise.all([
        db.collection('users').where(query).count(),
        db.collection('users')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()
    ])

    return {
        success: true,
        data: {
            list: listRes.data,
            total: countRes.total,
            page,
            pageSize
        }
    }
}

// ==================== 反馈管理 ====================
async function handleGetFeedbacks(data) {
    const { page = 1, pageSize = 20, status } = data
    const skip = (page - 1) * pageSize

    let query = {}
    if (status && status !== 'all') {
        query.status = status
    }

    const [countRes, listRes] = await Promise.all([
        db.collection('feedbacks').where(query).count(),
        db.collection('feedbacks')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()
    ])

    return {
        success: true,
        data: {
            list: listRes.data,
            total: countRes.total,
            page,
            pageSize
        }
    }
}

async function handleUpdateFeedbackStatus(data) {
    const { _id, status } = data

    if (!_id || !status) {
        return { success: false, error: 'ID和状态不能为空' }
    }

    await db.collection('feedbacks').doc(_id).update({
        data: {
            status,
            updateTime: db.serverDate()
        }
    })
    return { success: true }
}
