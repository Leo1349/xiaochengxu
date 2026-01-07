const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 为了演示，这里硬编码管理员密码
// 实际生产环境建议使用云环境的环境变量或数据库存储
const ADMIN_PASSWORD = 'admin_password_123'

exports.main = async (event, context) => {
    const { type, data } = event
    const wxContext = cloud.getWXContext()

    // 1. 管理员登录
    if (type === 'login') {
        const { password } = data
        if (password === ADMIN_PASSWORD) {
            return {
                success: true,
                data: {
                    token: 'admin_token_' + Date.now() // 简单模拟token
                }
            }
        } else {
            return {
                success: false,
                error: '密码错误'
            }
        }
    }

    // 2. 获取订单列表
    if (type === 'getOrderList') {
        const { page = 1, pageSize = 20, status } = data
        const skip = (page - 1) * pageSize

        let query = {}
        if (status && status !== 'all') {
            query.status = status
        }

        try {
            const totalResult = await db.collection('orders').where(query).count()
            const total = totalResult.total

            const listResult = await db.collection('orders')
                .where(query)
                .orderBy('createTime', 'desc')
                .skip(skip)
                .limit(pageSize)
                .get()

            return {
                success: true,
                data: {
                    list: listResult.data,
                    total: total,
                    page: page,
                    pageSize: pageSize
                }
            }
        } catch (err) {
            return {
                success: false,
                error: err.message
            }
        }
    }

    // 3. 更新订单状态
    if (type === 'updateOrderStatus') {
        const { orderId, status } = data

        try {
            await db.collection('orders').doc(orderId).update({
                data: {
                    status: status,
                    updateTime: db.serverDate()
                }
            })

            return {
                success: true
            }
        } catch (err) {
            return {
                success: false,
                error: err.message
            }
        }
    }

    return {
        success: false,
        error: 'Unknown type'
    }
}
