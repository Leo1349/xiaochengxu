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

    // 处理 Banner 数据：如果有 fileId，优先使用 fileId 作为 url (小程序支持 cloud://协议)
    const banners = bannerResult.data.map(item => ({
      ...item,
      url: item.fileId || item.url
    }))

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