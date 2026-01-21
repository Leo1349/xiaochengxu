/**
 * 管理后台云函数
 * 支持所有后台管理操作：老师、轮播图、订单、用户、反馈等
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

exports.main = async (event, context) => {
    const { type, data = {} } = event

    try {
        switch (type) {
            // ==================== 登录 ====================
            case 'login':
                return handleLogin(data)

            // ==================== 统计 ====================
            case 'getStats':
                return await handleGetStats()

            // ==================== 老师管理 ====================
            case 'getTeachers':
                return await handleGetTeachers(data)
            case 'addTeacher':
                return await handleAddTeacher(data)
            case 'updateTeacher':
                return await handleUpdateTeacher(data)
            case 'deleteTeacher':
                return await handleDeleteTeacher(data)

            // ==================== 轮播图管理 ====================
            case 'getBanners':
                return await handleGetBanners(data)
            case 'addBanner':
                return await handleAddBanner(data)
            case 'updateBanner':
                return await handleUpdateBanner(data)
            case 'deleteBanner':
                return await handleDeleteBanner(data)

            // ==================== 订单管理 ====================
            case 'getOrders':
                return await handleGetOrders(data)
            case 'updateOrderStatus':
                return await handleUpdateOrderStatus(data)

            // ==================== 用户管理 ====================
            case 'getUsers':
                return await handleGetUsers(data)

            // ==================== 反馈管理 ====================
            case 'getFeedbacks':
                return await handleGetFeedbacks(data)
            case 'updateFeedbackStatus':
                return await handleUpdateFeedbackStatus(data)

            default:
                return { success: false, error: '未知操作类型' }
        }
    } catch (err) {
        console.error('adminFunctions error:', err)
        return { success: false, error: err.message || '操作失败' }
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
    const [teacherCount, orderCount, userCount, feedbackCount] = await Promise.all([
        db.collection('teachers').count(),
        db.collection('orders').count(),
        db.collection('users').count(),
        db.collection('feedbacks').where({ status: 'pending' }).count()
    ])

    // 获取今日数据
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayOrders, todayUsers] = await Promise.all([
        db.collection('orders').where({ createTime: _.gte(today) }).count(),
        db.collection('users').where({ createTime: _.gte(today) }).count()
    ])

    return {
        success: true,
        data: {
            totalTeachers: teacherCount.total,
            totalOrders: orderCount.total,
            todayOrders: todayOrders.total,
            totalUsers: userCount.total,
            todayUsers: todayUsers.total,
            pendingFeedbacks: feedbackCount.total
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
    const { name, gender, title, price, tags, introduction, isRecommended } = data

    if (!name) {
        return { success: false, error: '姓名不能为空' }
    }

    const teacher = {
        name,
        gender: gender || 'male',
        avatar: '',
        title: title || '',
        rating: 5.0,
        orderCount: 0,
        tags: tags || [],
        price: price || 0,
        introduction: introduction || '',
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
