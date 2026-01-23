const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 并行获取 Banner 和 推荐老师列表
    // Banner: 只获取 isActive 为 true 的，按 order 排序
    const bannerPromise = db.collection('banners')
      .where({
        isActive: true
      })
      .orderBy('order', 'asc')
      .get()
    const teacherPromise = db.collection('teachers')
      .where({
        isRecommended: true
      })
      .limit(10) // 限制返回数量
      .get()

    const [bannerResult, teacherResult] = await Promise.all([bannerPromise, teacherPromise])

    // 处理 Banner 数据：如果有 fileId，需要获取临时 URL
    let banners = bannerResult.data

    // 收集所有需要获取临时 URL 的 fileId
    const fileIds = banners
      .filter(item => item.fileId && item.fileId.startsWith('cloud://'))
      .map(item => item.fileId)

    // 如果有 fileId，批量获取临时 URL
    if (fileIds.length > 0) {
      try {
        const tempUrlResult = await cloud.getTempFileURL({
          fileList: fileIds
        })

        // 创建 fileId 到 tempUrl 的映射
        const urlMap = {}
        tempUrlResult.fileList.forEach(item => {
          if (item.status === 0 && item.tempFileURL) {
            urlMap[item.fileID] = item.tempFileURL
          }
        })

        // 更新 banner 的 url
        banners = banners.map(item => ({
          ...item,
          url: item.fileId && urlMap[item.fileId] ? urlMap[item.fileId] : item.url
        }))
      } catch (urlErr) {
        console.error('获取临时 URL 失败', urlErr)
        // 如果获取失败，继续使用原有的 url
      }
    }

    return {
      success: true,
      data: {
        banners: banners,
        recommendTeachers: teacherResult.data
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
