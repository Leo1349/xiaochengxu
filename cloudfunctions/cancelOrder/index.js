/**
 * 取消订单云函数
 * 支持取消待确认/已确认状态的订单
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { orderId, reason } = event

    if (!orderId) {
        return { success: false, error: '订单ID不能为空' }
    }

    try {
        const ordersCollection = db.collection('orders')

        // 查询订单
        const orderRes = await ordersCollection.doc(orderId).get()

        if (!orderRes.data) {
            return { success: false, error: '订单不存在' }
        }

        const order = orderRes.data

        // 权限校验：只有订单创建者可以取消
        if (order._openid !== openid) {
            return { success: false, error: '无权取消此订单' }
        }

        // 状态校验：只有待确认或已确认状态可以取消
        const cancellableStatuses = ['pending', 'confirmed']
        if (!cancellableStatuses.includes(order.status)) {
            return { success: false, error: '当前订单状态不可取消' }
        }

        // 执行取消
        await ordersCollection.doc(orderId).update({
            data: {
                status: 'cancelled',
                cancelReason: reason || '用户取消',
                cancelTime: db.serverDate(),
                updateTime: db.serverDate(),
                statusHistory: db.command.push({
                    status: 'cancelled',
                    time: db.serverDate(),
                    operator: openid,
                    remark: reason || '用户取消'
                })
            }
        })

        return {
            success: true,
            data: { orderId: orderId }
        }
    } catch (e) {
        console.error('取消订单失败:', e)
        return {
            success: false,
            error: e.message || '取消订单失败'
        }
    }
}
