/**
 * 提交用户反馈云函数
 * 支持文字和图片反馈
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { type, content, images, contact } = event

    // 参数校验
    if (!content || content.trim().length === 0) {
        return { success: false, error: '反馈内容不能为空' }
    }

    if (content.length > 1000) {
        return { success: false, error: '反馈内容不能超过1000字' }
    }

    try {
        // 确保集合存在
        try { await db.createCollection('feedbacks') } catch (e) { }

        const feedbacksCollection = db.collection('feedbacks')

        const feedback = {
            _openid: openid,
            type: type || 'suggestion', // suggestion, bug, complaint, other
            content: content.trim(),
            images: images || [],
            contact: contact || '',
            status: 'pending', // pending, processing, resolved
            createTime: db.serverDate(),
            updateTime: db.serverDate()
        }

        const res = await feedbacksCollection.add({ data: feedback })

        return {
            success: true,
            data: {
                feedbackId: res._id,
                message: '感谢您的反馈，我们会尽快处理！'
            }
        }
    } catch (e) {
        console.error('提交反馈失败:', e)
        return {
            success: false,
            error: e.message || '提交反馈失败'
        }
    }
}
