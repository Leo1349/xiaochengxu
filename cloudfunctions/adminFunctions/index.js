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

            // ==================== 案例管理 ====================
            case 'getCases':
                result = await handleGetCases(data)
                break
            case 'addCase':
                result = await handleAddCase(data)
                break
            case 'updateCase':
                result = await handleUpdateCase(data)
                break
            case 'deleteCase':
                result = await handleDeleteCase(data)
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

    let bannerList = listRes.data

    // 自动刷新有 fileId 的云存储图片链接
    const fileIdsToRefresh = bannerList
        .map(item => {
            // 如果只有 cloud:// 开头的 url 但没有 fileId，尝试提取
            if (!item.fileId && item.url && item.url.startsWith('cloud://')) {
                return item.url
            }
            return item.fileId
        })
        .filter(id => id) // 过滤掉空值

    if (fileIdsToRefresh.length > 0) {
        try {
            const refreshRes = await cloud.getTempFileURL({
                fileList: fileIdsToRefresh
            })

            if (refreshRes.fileList) {
                // 构建 fileId -> 新 URL 映射
                const urlMap = new Map()
                refreshRes.fileList.forEach(file => {
                    if (file.tempFileURL) {
                        urlMap.set(file.fileID, file.tempFileURL)
                    }
                })

                // 更新 banner 列表中的 URL
                bannerList = bannerList.map(item => {
                    // 尝试匹配 fileId 或 url (对于旧数据)
                    const id = item.fileId || (item.url && item.url.startsWith('cloud://') ? item.url : null)
                    if (id && urlMap.has(id)) {
                        return { ...item, url: urlMap.get(id) }
                    }
                    return item
                })
            }
        } catch (err) {
            console.warn('刷新云存储链接失败:', err.message)
            // 刷新失败不影响返回原数据
        }
    }

    return {
        success: true,
        data: {
            list: bannerList,
            total: countRes.total,
            page,
            pageSize
        }
    }
}

async function handleAddBanner(data) {
    const { title, url, fileId, link, order, isActive } = data

    if (!title || !url) {
        return { success: false, error: '标题和图片地址不能为空' }
    }

    const banner = {
        title,
        url,
        fileId: fileId || '',  // 保存 fileId 用于刷新过期链接
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

// ==================== 案例管理 ====================
async function handleGetCases(data) {
    const { page = 1, pageSize = 20, category, keyword } = data
    const skip = (page - 1) * pageSize

    let query = {}
    if (category && category !== 'all') {
        query.category = category
    }
    if (keyword) {
        query.title = db.RegExp({ regexp: keyword, options: 'i' })
    }

    try {
        const [countRes, listRes] = await Promise.all([
            db.collection('case').where(query).count(),
            db.collection('case')
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
    } catch (err) {
        // 集合不存在时返回空数据，而不是报错
        if (err.code === 502005 || (err.message && err.message.indexOf('not exist') > -1)) {
            return {
                success: true,
                data: {
                    list: [],
                    total: 0,
                    page,
                    pageSize
                }
            }
        }
        throw err
    }
}

async function handleAddCase(data) {
    const {
        title, category, categoryName, cover,
        teacherId, teacherName, teacherAvatar, teacherTitle, // 老师信息
        studentGrade, studentAge, studentGender, // 学生信息
        serviceType, serviceDuration, serviceFrequency, // 服务信息
        contentBackground, contentProblem, contentSolution, contentResult, // 详细内容
        images
    } = data

    if (!title || !category || !cover) {
        return { success: false, error: '标题、分类和封面不能为空' }
    }

    // 确保集合存在
    try { await db.createCollection('case') } catch (e) { }

    // 构造案例数据结构
    const caseData = {
        title,
        category,
        categoryName: categoryName || category, // 简单处理
        cover,

        teacher: {
            id: teacherId,
            name: teacherName || '',
            avatar: teacherAvatar || '',
            title: teacherTitle || ''
        },

        student: {
            grade: studentGrade || '',
            age: Number(studentAge) || 0,
            gender: studentGender || '男'
        },

        serviceInfo: {
            type: serviceType || '',
            duration: serviceDuration || '',
            frequency: serviceFrequency || ''
        },

        content: {
            background: contentBackground || '',
            problem: contentProblem || '',
            solution: contentSolution || '',
            result: contentResult || ''
        },

        images: images || [],

        viewCount: 0,
        likeCount: 0,
        shareCount: 0,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
    }

    const res = await db.collection('case').add({ data: caseData })
    return { success: true, data: { _id: res._id } }
}

async function handleUpdateCase(data) {
    const { _id, ...rawData } = data

    if (!_id) {
        return { success: false, error: 'ID不能为空' }
    }

    // 重组更新数据
    const updateData = {}

    if (rawData.title) updateData.title = rawData.title
    if (rawData.category) updateData.category = rawData.category
    if (rawData.categoryName) updateData.categoryName = rawData.categoryName
    if (rawData.cover) updateData.cover = rawData.cover

    // 老师信息更新
    if (rawData.teacherId || rawData.teacherName) {
        updateData.teacher = {
            id: rawData.teacherId,
            name: rawData.teacherName,
            avatar: rawData.teacherAvatar,
            title: rawData.teacherTitle
        }
    }

    // 学生信息更新
    if (rawData.studentGrade !== undefined) {
        updateData.student = {
            grade: rawData.studentGrade,
            age: Number(rawData.studentAge),
            gender: rawData.studentGender
        }
    }

    // 服务信息更新
    if (rawData.serviceType !== undefined) {
        updateData.serviceInfo = {
            type: rawData.serviceType,
            duration: rawData.serviceDuration,
            frequency: rawData.serviceFrequency
        }
    }

    // 内容更新
    if (rawData.contentBackground !== undefined) {
        updateData.content = {
            background: rawData.contentBackground,
            problem: rawData.contentProblem,
            solution: rawData.contentSolution,
            result: rawData.contentResult
        }
    }

    if (rawData.images) updateData.images = rawData.images

    updateData.updateTime = db.serverDate()

    await db.collection('case').doc(_id).update({ data: updateData })
    return { success: true }
}

async function handleDeleteCase(data) {
    const { _id } = data

    if (!_id) {
        return { success: false, error: 'ID不能为空' }
    }

    await db.collection('case').doc(_id).remove()
    return { success: true }
}
