// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 知识库 - 简单的关键词匹配
// 实际生产中可以使用云数据库或第三方NLP服务
const knowledgeBase = [
    {
        keywords: ['电话', '联系方式', '手机'],
        answer: '我们的客服电话是：400-123-4567，工作时间为周一至周日 9:00-21:00。'
    },
    {
        keywords: ['预约', '下单', '怎么买'],
        answer: '您可以在首页浏览我们的陪伴师，选择心仪的老师后点击“立即预约”，填写相关信息并支付即可完成预约。'
    },
    {
        keywords: ['退款', '取消', '退钱'],
        answer: '如果您需要取消订单或申请退款，请在“我的-我的订单”中找到对应订单进行操作。服务开始前24小时可免费取消。'
    },
    {
        keywords: ['价格', '费用', '多少钱'],
        answer: '我们的服务价格透明，不同等级的陪伴师收费标准不同，具体价格请参考陪伴师详情页。'
    },
    {
        keywords: ['安全', '放心', '靠谱'],
        answer: '我们对所有陪伴师进行严格筛选和背景调查，并且提供全程保险保障，请您放心使用。'
    },
    {
        keywords: ['你好', '在吗', '有人吗', 'hello', 'hi'],
        answer: '您好！我是智伴优程智能客服，很高兴为您服务。请问有什么可以帮您？'
    },
    {
        keywords: ['人工', '转人工'],
        answer: '如需人工服务，请直接拨打我们的客服热线 400-123-4567，或留下您的联系方式，我们会尽快联系您。'
    }
]

// 默认回复
const defaultReply = '抱歉，我暂时无法理解这个问题。您可以尝试换一种问法，或者拨打客服电话 400-123-4567 进行咨询。'

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const { content } = event

    if (!content) {
        return {
            success: false,
            message: '内容不能为空'
        }
    }

    // 简单的关键词匹配逻辑
    let reply = defaultReply

    for (const item of knowledgeBase) {
        // 检查是否包含任一关键词
        const matched = item.keywords.some(keyword => content.includes(keyword))
        if (matched) {
            reply = item.answer
            break
        }
    }

    return {
        success: true,
        data: {
            reply: reply,
            time: new Date()
        }
    }
}
