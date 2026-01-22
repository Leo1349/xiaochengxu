/**
 * 图片工具函数
 * 用于处理云存储图片链接的检测和刷新
 */
import { api } from '../services/api'

/**
 * 检查图片 URL 是否是云存储临时链接
 * @param {string} url - 图片 URL
 * @returns {boolean} 是否是云存储临时链接
 */
export function isCloudTempUrl(url) {
    if (!url) return false
    return (
        url.includes('.tcb.qcloud.la') ||
        url.includes('.tcloudbaseapp.com') ||
        url.includes('cos.ap-')
    )
}

/**
 * 检查图片 URL 是否可访问（通过尝试加载）
 * @param {string} url - 图片 URL
 * @returns {Promise<boolean>} 图片是否可访问
 */
export async function checkImageValid(url) {
    if (!url) return false
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        // 设置超时，避免长时间等待
        setTimeout(() => resolve(false), 5000)
        img.src = url
    })
}

/**
 * 刷新单个图片链接
 * @param {Object} item - 包含图片信息的对象
 * @param {string} urlField - URL 字段名，默认 'url'
 * @param {string} fileIdField - FileID 字段名，默认 'fileId'
 * @returns {Promise<Object>} 刷新后的对象
 */
export async function refreshImageIfNeeded(item, urlField = 'url', fileIdField = 'fileId') {
    if (!item || !item[fileIdField]) return item

    const res = await api.refreshImageUrl(item[fileIdField])
    if (res.success && res.data?.[0]?.url) {
        return { ...item, [urlField]: res.data[0].url }
    }
    return item
}

/**
 * 批量刷新图片链接
 * 只刷新包含 fileId 且 URL 是云存储临时链接的项目
 * @param {Array} items - 包含图片信息的对象数组
 * @param {string} urlField - URL 字段名，默认 'url'
 * @param {string} fileIdField - FileID 字段名，默认 'fileId'
 * @returns {Promise<Array>} 刷新后的对象数组
 */
export async function refreshImagesIfNeeded(items, urlField = 'url', fileIdField = 'fileId') {
    if (!items || items.length === 0) return items

    // 筛选需要刷新的项目（有 fileId 且是云存储链接）
    const needRefresh = items.filter(item =>
        item[fileIdField] && isCloudTempUrl(item[urlField])
    )

    if (needRefresh.length === 0) return items

    // 批量获取新链接
    const fileIds = needRefresh.map(item => item[fileIdField])
    const res = await api.refreshImageUrls(fileIds)

    if (res.success && res.data) {
        // 构建 fileId -> url 映射
        const urlMap = new Map(res.data.map(d => [d.fileId, d.url]))

        // 更新每个项目的 URL
        return items.map(item => {
            if (item[fileIdField] && urlMap.has(item[fileIdField])) {
                return { ...item, [urlField]: urlMap.get(item[fileIdField]) }
            }
            return item
        })
    }

    return items
}

/**
 * 创建一个带自动刷新功能的图片错误处理器
 * @param {Function} onRefresh - 刷新成功后的回调函数，接收新 URL 作为参数
 * @param {string} fileId - 图片的 FileID
 * @returns {Function} 图片 onError 事件处理器
 */
export function createImageErrorHandler(onRefresh, fileId) {
    let hasRetried = false

    return async () => {
        // 避免重复刷新
        if (hasRetried || !fileId) return
        hasRetried = true

        const res = await api.refreshImageUrl(fileId)
        if (res.success && res.data?.[0]?.url) {
            onRefresh(res.data[0].url)
        }
    }
}
