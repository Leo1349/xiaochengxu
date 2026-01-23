const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const { category, page = 1, pageSize = 10 } = event
    const skip = (page - 1) * pageSize

    try {
        let query = {}
        if (category && category !== 'all') {
            query.category = category
        }

        // 先计算总数
        const countResult = await db.collection('case').where(query).count()
        const total = countResult.total

        // 查询数据
        const result = await db.collection('case')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()

        let list = result.data

        // 收集所有需要转换的 cloud:// 图片 ID
        let fileIds = []

        // 遍历列表收集 fileId
        list.forEach(item => {
            // 检查封面
            if (item.cover && item.cover.startsWith('cloud://')) {
                fileIds.push(item.cover)
            }
            // 检查详情图片
            if (item.images && Array.isArray(item.images)) {
                item.images.forEach(img => {
                    if (img && img.startsWith('cloud://')) {
                        fileIds.push(img)
                    }
                })
            }
        })

        // 去重
        fileIds = [...new Set(fileIds)]

        // 批量获取临时链接
        if (fileIds.length > 0) {
            const tempUrlResult = await cloud.getTempFileURL({
                fileList: fileIds,
                maxAge: 60 * 60 * 24 // 24小时有效期
            })

            const urlMap = {}
            tempUrlResult.fileList.forEach(item => {
                if (item.status === 0) {
                    urlMap[item.fileID] = item.tempFileURL
                }
            })

            // 替换原始数据中的 cloud:// 链接
            list = list.map(item => {
                let newItem = { ...item }

                // 替换封面
                if (newItem.cover && newItem.cover.startsWith('cloud://') && urlMap[newItem.cover]) {
                    newItem.cover = urlMap[newItem.cover]
                }

                // 替换详情图片
                if (newItem.images && Array.isArray(newItem.images)) {
                    newItem.images = newItem.images.map(img => {
                        if (img && img.startsWith('cloud://') && urlMap[img]) {
                            return urlMap[img]
                        }
                        return img
                    })
                }

                return newItem
            })
        }

        return {
            success: true,
            data: {
                list,
                total,
                page,
                pageSize,
                hasMore: skip + list.length < total
            }
        }

    } catch (err) {
        console.error('获取案例列表失败', err)
        return {
            success: false,
            error: err
        }
    }
}
