/**
 * 管理孩子信息云函数
 * 支持添加、更新、删除孩子信息
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { action, childId, childData } = event

    try {
        // 确保集合存在
        try { await db.createCollection('children') } catch (e) { }

        const childrenCollection = db.collection('children')

        switch (action) {
            case 'add':
                // 添加孩子
                if (!childData || !childData.name) {
                    return { success: false, error: '孩子姓名不能为空' }
                }

                const newChild = {
                    _openid: openid,
                    name: childData.name,
                    gender: childData.gender || 'unknown',
                    birthday: childData.birthday || '',
                    age: childData.age || 0,
                    grade: childData.grade || '',
                    school: childData.school || '',
                    interests: childData.interests || [],
                    remark: childData.remark || '',
                    createTime: db.serverDate(),
                    updateTime: db.serverDate()
                }

                const addRes = await childrenCollection.add({ data: newChild })

                return {
                    success: true,
                    data: { childId: addRes._id, action: 'added' }
                }

            case 'update':
                // 更新孩子信息
                if (!childId) {
                    return { success: false, error: '孩子ID不能为空' }
                }

                // 验证权限
                const childRes = await childrenCollection.doc(childId).get()
                if (!childRes.data || childRes.data._openid !== openid) {
                    return { success: false, error: '无权操作此记录' }
                }

                const updateData = { updateTime: db.serverDate() }
                if (childData.name) updateData.name = childData.name
                if (childData.gender) updateData.gender = childData.gender
                if (childData.birthday) updateData.birthday = childData.birthday
                if (childData.age !== undefined) updateData.age = childData.age
                if (childData.grade) updateData.grade = childData.grade
                if (childData.school) updateData.school = childData.school
                if (childData.interests) updateData.interests = childData.interests
                if (childData.remark !== undefined) updateData.remark = childData.remark

                await childrenCollection.doc(childId).update({ data: updateData })

                return {
                    success: true,
                    data: { childId: childId, action: 'updated' }
                }

            case 'delete':
                // 删除孩子
                if (!childId) {
                    return { success: false, error: '孩子ID不能为空' }
                }

                // 验证权限
                const delChildRes = await childrenCollection.doc(childId).get()
                if (!delChildRes.data || delChildRes.data._openid !== openid) {
                    return { success: false, error: '无权操作此记录' }
                }

                await childrenCollection.doc(childId).remove()

                return {
                    success: true,
                    data: { childId: childId, action: 'deleted' }
                }

            case 'list':
                // 获取孩子列表
                const listRes = await childrenCollection.where({ _openid: openid })
                    .orderBy('createTime', 'desc')
                    .get()

                return {
                    success: true,
                    data: { list: listRes.data }
                }

            default:
                return { success: false, error: '无效的操作类型' }
        }
    } catch (e) {
        console.error('管理孩子信息失败:', e)
        return {
            success: false,
            error: e.message || '操作失败'
        }
    }
}
