const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const { id } = event

    try {
        const result = await db.collection('case').doc(id).get()
        let data = result.data

        // 收集 fileId
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

            // 替换
            if (data.cover && data.cover.startsWith('cloud://') && urlMap[data.cover]) {
                data.cover = urlMap[data.cover]
            }
            if (data.images && Array.isArray(data.images)) {
                data.images = data.images.map(img => {
                    if (img && img.startsWith('cloud://') && urlMap[img]) {
                        return urlMap[img]
                    }
                    return img
                })
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
            error: err
        }
    }
}
