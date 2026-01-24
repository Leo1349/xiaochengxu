// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const { action, id, data } = event
    const collection = db.collection('service_types')

    try {
        // Ensure collection exists (for first run)
        try { await db.createCollection('service_types') } catch (e) { }

        switch (action) {
            case 'list':
                // Check if collection is empty
                const countRes = await collection.count()
                if (countRes.total === 0) {
                    // Seed default data
                    const defaultTypes = [
                        { name: '学科辅导', icon: '/images/icons/goods.png', description: '专业老师一对一辅导，提升学习成绩', subTypes: ['语文', '数学', '英语', '物理', '化学', '生物'], order: 1 },
                        { name: '兴趣培养', icon: '/images/icons/examples.png', description: '发现孩子兴趣，培养特长技能', subTypes: ['绘画', '音乐', '书法', '舞蹈', '棋类', '编程'], order: 2 },
                        { name: '习惯养成', icon: '/images/icons/business.png', description: '帮助孩子养成良好的学习和生活习惯', subTypes: ['时间管理', '作业习惯', '阅读习惯', '自律能力'], order: 3 },
                        { name: '心理疏导', icon: '/images/icons/message.png', description: '关注孩子心理健康，解决成长烦恼', subTypes: ['情绪管理', '社交能力', '自信培养', '压力疏导'], order: 4 },
                        { name: '升学规划', icon: '/images/icons/service.png', description: '科学规划升学路径，助力孩子未来', subTypes: ['小升初', '中考规划', '高考规划', '留学咨询'], order: 5 },
                        { name: '特殊陪伴', icon: '/images/icons/service.png', description: '特殊时期的专业陪伴服务', subTypes: ['考前陪伴', '假期托管', '作业陪伴', '上下学接送'], order: 6 }
                    ]

                    for (const type of defaultTypes) {
                        try {
                            await collection.add({
                                data: {
                                    ...type,
                                    createTime: db.serverDate(),
                                    updateTime: db.serverDate()
                                }
                            })
                        } catch (e) { }
                    }
                }

                const listRes = await collection.orderBy('order', 'asc').get()
                return {
                    success: true,
                    data: { list: listRes.data }
                }

            case 'add':
                if (!data || !data.name) return { success: false, error: '名称不能为空' }
                const addRes = await collection.add({
                    data: {
                        ...data,
                        createTime: db.serverDate(),
                        updateTime: db.serverDate()
                    }
                })
                return { success: true, data: { id: addRes._id } }

            case 'update':
                if (!id) return { success: false, error: 'ID不能为空' }
                delete data._id // Cannot update _id
                await collection.doc(id).update({
                    data: {
                        ...data,
                        updateTime: db.serverDate()
                    }
                })
                return { success: true }

            case 'delete':
                if (!id) return { success: false, error: 'ID不能为空' }
                await collection.doc(id).remove()
                return { success: true }

            default:
                return { success: false, error: '无效的操作' }
        }
    } catch (e) {
        console.error(e)
        return { success: false, error: e.message }
    }
}
