const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    try {
        // Parallel fetch config and active FAQs
        const configPromise = db.collection('configs').doc('customer_service').get()
            .then(res => res.data)
            .catch(() => null) // Default to null if not found

        const faqPromise = db.collection('faqs')
            .where({
                isActive: true
            })
            .orderBy('order', 'asc')
            .get()
            .then(res => res.data)
            .catch(() => [])

        const [config, faqs] = await Promise.all([configPromise, faqPromise])

        // Format config if exists, otherwise provide defaults
        const serviceInfo = config ? {
            phone: config.phone || '400-123-4567',
            workTime: config.serviceHours || '周一至周日 9:00-21:00',
            email: config.email || 'service@zhibanjia.com',
            wechat: config.wechat || 'zhibanjia_kefu'
        } : {
            phone: '400-123-4567',
            workTime: '周一至周日 9:00-21:00',
            email: 'service@zhibanjia.com',
            wechat: 'zhibanjia_kefu'
        }

        // Format FAQs (map _id to id)
        const faqList = faqs.map(item => ({
            id: item._id,
            question: item.question,
            answer: item.answer,
            expanded: false
        }))

        return {
            success: true,
            data: {
                serviceInfo,
                faqList
            }
        }
    } catch (e) {
        return {
            success: false,
            error: e
        }
    }
}
