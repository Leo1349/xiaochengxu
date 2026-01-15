/**
 * 更新用户信息云函数
 * 支持更新昵称、头像、手机号等基本信息
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { nickName, avatarUrl, phone, role, address } = event

    try {
        // 确保集合存在
        try { await db.createCollection('users') } catch (e) { }

        const usersCollection = db.collection('users')

        // 查找用户
        const userRes = await usersCollection.where({ _openid: openid }).get()

        // 构建更新数据
        const updateData = {
            updateTime: db.serverDate()
        }

        if (nickName !== undefined) updateData.nickName = nickName
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
        if (phone !== undefined) updateData.phone = phone
        if (role !== undefined) updateData.role = role
        if (address !== undefined) updateData.address = address

        if (userRes.data.length === 0) {
            // 用户不存在，创建新用户
            const newUser = {
                _openid: openid,
                nickName: nickName || '微信用户',
                avatarUrl: avatarUrl || '',
                phone: phone || '',
                role: role || 'parent',
                address: address || '',
                createTime: db.serverDate(),
                updateTime: db.serverDate()
            }

            await usersCollection.add({ data: newUser })

            return {
                success: true,
                data: { created: true, user: newUser }
            }
        } else {
            // 更新现有用户
            await usersCollection.where({ _openid: openid }).update({
                data: updateData
            })

            return {
                success: true,
                data: { updated: true }
            }
        }
    } catch (e) {
        console.error('更新用户信息失败:', e)
        return {
            success: false,
            error: e.message || '更新用户信息失败'
        }
    }
}
