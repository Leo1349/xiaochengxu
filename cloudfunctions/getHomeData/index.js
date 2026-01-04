const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 并行获取 Banner 和 推荐老师列表
    const bannerPromise = db.collection('banners').get()
    const teacherPromise = db.collection('teachers')
      .where({
        isRecommended: true
      })
      .limit(10) // 限制返回数量
      .get()

    const [bannerResult, teacherResult] = await Promise.all([bannerPromise, teacherPromise])

    return {
      success: true,
      data: {
        banners: bannerResult.data,
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