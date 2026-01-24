const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const { id } = event

    try {
        const result = await db.collection('case').doc(id).get()
        let data = result.data

        // 如果案例中的老师头像为空、不存在、或者是已过期的临时链接，尝试从 teachers 集合获取
        if (data.teacher && data.teacher.id) {
            // 检测是否需要重新获取头像：
            // 1. 头像为空
            // 2. 头像是旧的临时链接（包含 tcb.qcloud.la 但不是 cloud:// 格式）
            const avatar = data.teacher.avatar || ''
            const isExpiredTempUrl = avatar.includes('tcb.qcloud.la') && !avatar.startsWith('cloud://')
            const needFetchAvatar = !avatar || isExpiredTempUrl

            if (needFetchAvatar) {
                try {
                    const teacherRes = await db.collection('teachers').doc(data.teacher.id).get()
                    if (teacherRes.data && teacherRes.data.avatar) {
                        data.teacher.avatar = teacherRes.data.avatar
                        console.log('从 teachers 集合获取头像:', data.teacher.avatar)
                    }
                } catch (e) {
                    console.warn('获取老师信息失败:', e.message)
                }
            }
        }

        // 收集 fileId（封面、图片、老师头像）
        let fileIds = []
        if (data.cover && data.cover.startsWith('cloud://')) {
            fileIds.push(data.cover)
        }
        if (data.images && Array.isArray(data.images)) {
            data.images.forEach(img => {
                if (img && img.startsWith('cloud://')) {
                    fileIds.push(img)
                }
            })
        }
        // 老师头像
        if (data.teacher && data.teacher.avatar && data.teacher.avatar.startsWith('cloud://')) {
            fileIds.push(data.teacher.avatar)
        }

        // 去重
        fileIds = [...new Set(fileIds)]

        // 获取临时链接
        if (fileIds.length > 0) {
            const tempUrlResult = await cloud.getTempFileURL({
                fileList: fileIds,
                maxAge: 60 * 60 * 24 // 1天有效期
            })

            const urlMap = {}
            tempUrlResult.fileList.forEach(item => {
                if (item.status === 0) {
                    urlMap[item.fileID] = item.tempFileURL
                }
            })

            // 替换封面
            if (data.cover && data.cover.startsWith('cloud://') && urlMap[data.cover]) {
                data.cover = urlMap[data.cover]
            }
            // 替换图片
            if (data.images && Array.isArray(data.images)) {
                data.images = data.images.map(img => {
                    if (img && img.startsWith('cloud://') && urlMap[img]) {
                        return urlMap[img]
                    }
                    return img
                })
            }
            // 替换老师头像
            if (data.teacher && data.teacher.avatar && urlMap[data.teacher.avatar]) {
                data.teacher.avatar = urlMap[data.teacher.avatar]
            }
        }

        return {
            success: true,
            data: data
        }

    } catch (err) {
        console.error('获取案例详情失败', err)
        return {
            success: false,
            error: err.message || err
        }
    }
}
