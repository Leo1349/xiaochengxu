// cloudfunctions/getUserFeedbacks/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    const { page = 1, pageSize = 20 } = event
    const skip = (page - 1) * pageSize

    try {
        const countRes = await db.collection('feedbacks')
            .where({ _openid: openid })
            .count()

        const listRes = await db.collection('feedbacks')
            .where({ _openid: openid })
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()

        let feedbackList = listRes.data

        // 收集图片 links
        const fileIdsToRefresh = []
        feedbackList.forEach(item => {
            if (item.images && Array.isArray(item.images)) {
                item.images.forEach(img => {
                    if (img && img.startsWith('cloud://')) {
                        fileIdsToRefresh.push(img)
                    }
                })
            }
        })

        // 转换图片链接
        const uniqueFileIds = [...new Set(fileIdsToRefresh)]
        if (uniqueFileIds.length > 0) {
            try {
                const refreshRes = await cloud.getTempFileURL({
                    fileList: uniqueFileIds
                })
                if (refreshRes.fileList) {
                    const urlMap = new Map()
                    refreshRes.fileList.forEach(file => {
                        if (file.tempFileURL && file.status === 0) {
                            urlMap.set(file.fileID, file.tempFileURL)
                        }
                    })

                    feedbackList = feedbackList.map(item => {
                        const newItem = { ...item }
                        if (newItem.images && Array.isArray(newItem.images)) {
                            newItem.images = newItem.images.map(img => {
                                if (img && img.startsWith('cloud://') && urlMap.has(img)) {
                                    return urlMap.get(img)
                                }
                                return img
                            })
                        }
                        return newItem
                    })
                }
            } catch (err) {
                console.warn('刷新图片链接失败', err)
            }
        }

        return {
            success: true,
            data: {
                list: feedbackList,
                total: countRes.total,
                page,
                pageSize
            }
        }

    } catch (err) {
        if (err.message && err.message.indexOf('not exist') > -1) {
            return {
                success: true,
                data: { list: [], total: 0 }
            }
        }
        return {
            success: false,
            error: err.message
        }
    }
}
