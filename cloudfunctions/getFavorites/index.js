const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
    const { userId, type } = event // type: 'teacher' or 'case'

    if (!userId) {
        return { success: false, error: 'User ID is required' }
    }

    try {
        if (type === 'teacher') {
            // 获取收藏的老师 ID 列表
            const favoritesRes = await db.collection('favorite_teachers')
                .where({ userId: userId })
                .orderBy('createTime', 'desc')
                .get()

            if (favoritesRes.data.length === 0) {
                return { success: true, data: [] }
            }

            const favoriteList = favoritesRes.data
            const teacherIds = favoriteList.map(item => item.teacherId)

            // 获取老师详细信息
            const teachersRes = await db.collection('teachers')
                .where({
                    _id: _.in(teacherIds)
                })
                .get()

            const teachersMap = {}
            teachersRes.data.forEach(t => {
                teachersMap[t._id] = t
            })

            // 收集需要转换的 Cloud ID
            let fileIds = []
            const resultList = favoriteList.map(fav => {
                const teacher = teachersMap[fav.teacherId]
                if (!teacher) return null // 老师可能已被删除

                // 优先使用 teacher 集合中的最新数据，而不是 favorite 中的陈旧数据
                const item = {
                    ...fav,
                    name: teacher.name,
                    title: teacher.title,
                    tags: teacher.tags,
                    avatar: teacher.avatar,
                    _id: fav._id // 保留 favorite 记录的 ID 用于取消收藏
                }

                if (teacher.avatar && teacher.avatar.startsWith('cloud://')) {
                    fileIds.push(teacher.avatar)
                }
                return item
            }).filter(item => item !== null)

            // 获取临时链接
            if (fileIds.length > 0) {
                fileIds = [...new Set(fileIds)]
                const tempUrlRes = await cloud.getTempFileURL({
                    fileList: fileIds,
                    maxAge: 60 * 60 * 24
                })
                const urlMap = {}
                tempUrlRes.fileList.forEach(f => {
                    if (f.status === 0) urlMap[f.fileID] = f.tempFileURL
                })

                resultList.forEach(item => {
                    if (item.avatar && item.avatar.startsWith('cloud://') && urlMap[item.avatar]) {
                        item.avatar = urlMap[item.avatar]
                    }
                })
            }

            // 处理默认头像
            resultList.forEach(item => {
                if (!item.avatar || item.avatar === '/images/avatar.png' || item.avatar === '/images/icons/default-avatar.png' || item.avatar === '/images/default_teacher_avatar.png') {
                    // 由于拿不到 gender (除非 favorite 里存了或者 join 了)，这里假设 teacher 集合里有 gender
                    // 上面我们已经用 teachersMap 获取了最新 teacher 数据
                    const teacher = teachersMap[item.teacherId]
                    if (teacher) {
                        item.avatar = teacher.gender === 'male'
                            ? '/images/avatars/teacher-male-default.png'
                            : '/images/avatars/teacher-female-default.png';
                    }
                }
            })

            return { success: true, data: resultList }

        } else if (type === 'case') {
            // 获取收藏的案例列表
            const favoritesRes = await db.collection('favorite_cases')
                .where({ userId: userId })
                .orderBy('createTime', 'desc')
                .get()

            if (favoritesRes.data.length === 0) {
                return { success: true, data: [] }
            }

            const favoriteList = favoritesRes.data
            const caseIds = favoriteList.map(item => item.caseId)

            // 获取案例详细信息
            const casesRes = await db.collection('case')
                .where({
                    _id: _.in(caseIds)
                })
                .get()

            const casesMap = {}
            casesRes.data.forEach(c => {
                casesMap[c._id] = c
            })

            // 收集相关的 teacherId 以获取老师头像
            let teacherIds = []
            casesRes.data.forEach(c => {
                if (c.teacher && c.teacher.id) {
                    teacherIds.push(c.teacher.id)
                }
            })
            teacherIds = [...new Set(teacherIds)]

            let teachersMap = {}
            if (teacherIds.length > 0) {
                const teachersRes = await db.collection('teachers')
                    .where({ _id: _.in(teacherIds) })
                    .get()
                teachersRes.data.forEach(t => {
                    teachersMap[t._id] = t
                })
            }

            // 收集需要转换的 Cloud ID
            let fileIds = []
            const resultList = favoriteList.map(fav => {
                const caseItem = casesMap[fav.caseId]
                if (!caseItem) return null // 案例可能已被删除

                const teacher = caseItem.teacher && caseItem.teacher.id ? teachersMap[caseItem.teacher.id] : null

                const item = {
                    ...fav,
                    title: caseItem.title,
                    summary: caseItem.summary,
                    cover: caseItem.cover,
                    teacherName: teacher ? teacher.name : (caseItem.teacher ? caseItem.teacher.name : ''), // 优先用最新的老师名
                    teacherAvatar: teacher ? teacher.avatar : (caseItem.teacher ? caseItem.teacher.avatar : ''),
                    _id: fav._id
                }

                if (item.cover && item.cover.startsWith('cloud://')) {
                    fileIds.push(item.cover)
                }
                if (item.teacherAvatar && item.teacherAvatar.startsWith('cloud://')) {
                    fileIds.push(item.teacherAvatar)
                }

                return item
            }).filter(item => item !== null)

            // 获取临时链接
            if (fileIds.length > 0) {
                fileIds = [...new Set(fileIds)]
                const tempUrlRes = await cloud.getTempFileURL({
                    fileList: fileIds,
                    maxAge: 60 * 60 * 24
                })
                const urlMap = {}
                tempUrlRes.fileList.forEach(f => {
                    if (f.status === 0) urlMap[f.fileID] = f.tempFileURL
                })

                resultList.forEach(item => {
                    if (item.cover && item.cover.startsWith('cloud://') && urlMap[item.cover]) {
                        item.cover = urlMap[item.cover]
                    }
                    if (item.teacherAvatar && item.teacherAvatar.startsWith('cloud://') && urlMap[item.teacherAvatar]) {
                        item.teacherAvatar = urlMap[item.teacherAvatar]
                    }
                })
            }

            // 处理老师默认头像
            resultList.forEach(item => {
                // ... (可以使用同样的默认头像逻辑，如果 teacherAvatar 为空)
                // 暂时简单处理：如果不为空且有效则用，否则前端会显示默认
            })

            return { success: true, data: resultList }
        }

        return { success: false, error: 'Invalid type' }

    } catch (e) {
        console.error('getFavorites error', e)
        return { success: false, error: e.message }
    }
}
