/**
 * 标记消息已读云函数
 * 支持单条标记或全部标记
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { messageId, markAll = false, type } = event

    try {
        const messagesCollection = db.collection('messages')
        const _ = db.command

        if (markAll) {
            // 标记全部已读
            let query = { _openid: openid, isRead: false }
            if (type && type !== 'all') {
                query.type = type
            }

            await messagesCollection.where(query).update({
                data: {
                    isRead: true,
                    readTime: db.serverDate()
                }
            })

            return {
                success: true,
                data: { markedAll: true }
            }
        } else {
            // 标记单条已读
            if (!messageId) {
                return { success: false, error: '消息ID不能为空' }
            }

            await messagesCollection.doc(messageId).update({
                data: {
                    isRead: true,
                    readTime: db.serverDate()
                }
            })

            return {
                success: true,
                data: { messageId: messageId }
            }
        }
    } catch (e) {
        console.error('标记消息失败:', e)
        return {
            success: false,
            error: e.message || '标记消息失败'
        }
    }
}
