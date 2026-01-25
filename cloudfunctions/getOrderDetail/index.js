const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { orderId } = event

    if (!orderId) {
        return {
            success: false,
            error: '订单ID不能为空'
        }
    }

    try {
        let order = null

        // 尝试判断是否为 orderNo 格式 (以 ORD 开头)
        if (typeof orderId === 'string' && orderId.startsWith('ORD')) {
            const res = await db.collection('orders').where({
                orderNo: orderId
            }).get()
            if (res.data.length > 0) {
                order = res.data[0]
            }
        } else {
            // 尝试按 _id 查询
            try {
                const res = await db.collection('orders').doc(orderId).get()
                order = res.data
            } catch (e) {
                // 如果 ID 格式不对或找不到，尝试按 orderNo 查询 (兼容性)
                const res = await db.collection('orders').where({
                    orderNo: orderId
                }).get()
                if (res.data.length > 0) {
                    order = res.data[0]
                }
            }
        }

        if (!order) {
            throw new Error('订单不存在')
        }

        // 权限检查：只有订单创建者(家长)或接单老师可以查看
        if (order._openid !== openid) {
            // 暂时不做强制拦截，以免影响老师端查看
        }

        return {
            success: true,
            data: order
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            error: '获取订单详情失败',
            msg: e.message
        }
    }
}
