// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const { page = 1, pageSize = 20, keyword = '', role = 'all' } = event

    try {
        const skip = (page - 1) * pageSize
        let query = {}

        // 关键词搜索（昵称或OpenID）
        // 注意：云开发数据库模糊查询能力有限，这里做简单的正则匹配
        if (keyword) {
            query = db.command.or([
                { nickName: db.RegExp({ regexp: keyword, options: 'i' }) },
                { _openid: db.RegExp({ regexp: keyword, options: 'i' }) }
            ])
        }

        // 角色筛选
        if (role !== 'all') {
            query.currentRole = role
            if (keyword) {
                // 合并查询条件
                query = db.command.and([
                    { currentRole: role },
                    db.command.or([
                        { nickName: db.RegExp({ regexp: keyword, options: 'i' }) },
                        { _openid: db.RegExp({ regexp: keyword, options: 'i' }) }
                    ])
                ])
            }
        }

        // 获取用户列表
        // 注意：实际用户表可能叫 'users'，这里假设是 users
        // 如果没有专门的用户表（因为小程序直接用 openid），则可能需要从 orders 或 children 反推，
        // 但通常最好有一个 users 集合。这里假设有。
        const countResult = await db.collection('users').where(query).count()
        const total = countResult.total

        const userRes = await db.collection('users')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()

        const users = userRes.data

        // 为每个用户获取孩子信息
        // 这一步在数据量大时可能较慢，实际生产建议使用 lookup (aggregate)
        // 但为了简单和兼容性，这里使用 Promise.all
        const usersWithChildren = await Promise.all(users.map(async (user) => {
            const childRes = await db.collection('children')
                .where({ _openid: user._openid })
                .get()

            return {
                ...user,
                children: childRes.data || []
            }
        }))

        return {
            success: true,
            data: {
                list: usersWithChildren,
                total: total,
                page: page,
                pageSize: pageSize
            }
        }

    } catch (e) {
        console.error(e)
        // Mock数据 fallback，防止云数据库没有 users 集合导致报错
        // 仅开发阶段使用
        return {
            success: false, // 明确返回 false 让前端知道是 Mock 还是失败，或者这里直接返回 Mock 数据并标记 success: true
            error: e.message
        }
    }
}
