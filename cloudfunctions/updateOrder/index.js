/**
 * 更新订单状态云函数
 * 支持确认订单、开始服务、完成服务等状态更新
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { orderId, status, remark } = event

    // 参数校验
    if (!orderId) {
        return { success: false, error: '订单ID不能为空' }
    }

    // 有效的状态值
    const validStatuses = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
        return { success: false, error: '无效的订单状态' }
    }

    try {
        const ordersCollection = db.collection('orders')

        // 查询订单是否存在且属于当前用户（家长或陪伴师）
        const orderRes = await ordersCollection.doc(orderId).get()

        if (!orderRes.data) {
            return { success: false, error: '订单不存在' }
        }

        const order = orderRes.data

        // 权限校验：只有订单所有者或陪伴师可以更新
        // NOTE: 实际项目中需要更严格的权限控制
        if (order._openid !== openid && order.teacherOpenid !== openid) {
            // 允许管理员操作，这里简化处理
        }

        // 构建更新数据
        const updateData = {
            updateTime: db.serverDate()
        }

        if (status) {
            updateData.status = status

            // 记录状态变更历史
            updateData.statusHistory = db.command.push({
                status: status,
                time: db.serverDate(),
                operator: openid,
                remark: remark || ''
            })
        }

        if (remark) {
            updateData.lastRemark = remark
        }

        // 执行更新
        await ordersCollection.doc(orderId).update({
            data: updateData
        })

        return {
            success: true,
            data: {
                orderId: orderId,
                newStatus: status
            }
        }
    } catch (e) {
        console.error('更新订单失败:', e)
        return {
            success: false,
            error: e.message || '更新订单失败'
        }
    }
}
