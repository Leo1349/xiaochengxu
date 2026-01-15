/**
 * 获取消息列表云函数
 * 支持分类查询：系统消息、订单消息、聊天消息
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { type, page = 1, pageSize = 20 } = event

    try {
        // 确保集合存在
        try { await db.createCollection('messages') } catch (e) { }

        const messagesCollection = db.collection('messages')
        const _ = db.command

        // 构建查询条件
        let query = {
            _openid: openid
        }

        // 按类型筛选
        if (type && type !== 'all') {
            query.type = type
        }

        const skip = (page - 1) * pageSize

        // 查询总数
        const countResult = await messagesCollection.where(query).count()
        const total = countResult.total

        // 查询未读数
        const unreadResult = await messagesCollection.where({
            _openid: openid,
            isRead: false
        }).count()

        // 查询列表
        const listResult = await messagesCollection.where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()

        // 按类型统计未读数
        const unreadByType = {
            all: unreadResult.total,
            system: 0,
            order: 0,
            chat: 0
        }

        // 查询各类型未读数
        const systemUnread = await messagesCollection.where({
            _openid: openid,
            type: 'system',
            isRead: false
        }).count()
        unreadByType.system = systemUnread.total

        const orderUnread = await messagesCollection.where({
            _openid: openid,
            type: 'order',
            isRead: false
        }).count()
        unreadByType.order = orderUnread.total

        const chatUnread = await messagesCollection.where({
            _openid: openid,
            type: 'chat',
            isRead: false
        }).count()
        unreadByType.chat = chatUnread.total

        return {
            success: true,
            data: {
                list: listResult.data,
                total: total,
                unreadCount: unreadByType,
                page: page,
                pageSize: pageSize,
                hasMore: total > page * pageSize
            }
        }
    } catch (e) {
        console.error('获取消息列表失败:', e)
        return {
            success: false,
            error: e.message || '获取消息列表失败'
        }
    }
}
