const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    try {
        // 1. Initialize configs collection with default data
        const configCheck = await db.collection('configs').doc('customer_service').get().catch(() => null)
        if (!configCheck) {
            await db.collection('configs').add({
                data: {
                    _id: 'customer_service',
                    serviceHours: '周一至周日 9:00-21:00',
                    phone: '400-123-4567',
                    wechat: 'zhibanjia_kefu',
                    email: 'service@zhibanjia.com',
                    updateTime: db.serverDate()
                }
            })
        }

        // 2. Initialize faqs collection if empty
        const faqCount = await db.collection('faqs').count()
        if (faqCount.total === 0) {
            const initialFaqs = [
                {
                    question: '如何预约陪伴师？',
                    answer: '您可以在首页搜索陪伴师，查看陪伴师详情后点击"立即预约"按钮，选择服务类型、时间和孩子信息后提交订单即可。',
                    order: 1,
                    isActive: true,
                    createTime: db.serverDate()
                },
                {
                    question: '如何取消订单？',
                    answer: '在"我的订单"中找到待确认或待服务的订单，点击"取消订单"按钮即可取消。请注意，服务开始前24小时内取消可能需要支付一定的取消费用。',
                    order: 2,
                    isActive: true,
                    createTime: db.serverDate()
                },
                {
                    question: '陪伴师的资质如何保证？',
                    answer: '所有陪伴师都经过平台严格的资质审核，包括身份验证、学历验证、资格证书验证等。我们还会进行背景调查，确保陪伴师的品行端正。',
                    order: 3,
                    isActive: true,
                    createTime: db.serverDate()
                }
            ]

            for (const faq of initialFaqs) {
                await db.collection('faqs').add({ data: faq })
            }
        }

        return { success: true, message: 'Initialization complete' }
    } catch (e) {
        return { success: false, error: e }
    }
}
