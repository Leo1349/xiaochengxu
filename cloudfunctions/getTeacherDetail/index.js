const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { id } = event

  if (!id) {
    return {
      success: false,
      message: 'Teacher ID is required'
    }
  }

  try {
    const teacher = await db.collection('teachers').doc(id).get()
    const teacherData = teacher.data
    const teacherName = teacherData.name

    // 从数据库查询与该老师关联的案例
    // 支持多种匹配方式：teacher.id、teacher.name、teacherId
    // NOTE: 集合名为 'case'（单数），与后台保持一致
    console.log('查询案例条件:', { teacherId: id, teacherName: teacherName })

    let casesRes = await db.collection('case')
      .where(_.or([
        { 'teacher.id': id },
        { 'teacher.name': teacherName },
        { teacherId: id }
      ]))
      .orderBy('createTime', 'desc')
      .limit(20)
      .get()

    console.log('查询案例结果:', casesRes.data?.length || 0, '条')

    let cases = casesRes.data || []

    // 处理案例图片的临时链接
    if (cases.length > 0) {
      const fileIdsToRefresh = []
      cases.forEach(item => {
        if (item.cover && item.cover.startsWith('cloud://')) {
          fileIdsToRefresh.push(item.cover)
        }
        if (item.images && Array.isArray(item.images)) {
          item.images.forEach(img => {
            if (img && img.startsWith('cloud://')) {
              fileIdsToRefresh.push(img)
            }
          })
        }
      })

      const uniqueFileIds = [...new Set(fileIdsToRefresh)]
      if (uniqueFileIds.length > 0) {
        try {
          const refreshRes = await cloud.getTempFileURL({ fileList: uniqueFileIds })
          if (refreshRes.fileList) {
            const urlMap = new Map()
            refreshRes.fileList.forEach(file => {
              if (file.tempFileURL && file.status === 0) {
                urlMap.set(file.fileID, file.tempFileURL)
              }
            })

            cases = cases.map(item => {
              const newItem = { ...item }
              if (newItem.cover && urlMap.has(newItem.cover)) {
                newItem.cover = urlMap.get(newItem.cover)
              }
              if (newItem.images && Array.isArray(newItem.images)) {
                newItem.images = newItem.images.map(img => urlMap.get(img) || img)
              }
              return newItem
            })
          }
        } catch (err) {
          console.warn('刷新案例图片链接失败:', err.message)
        }
      }
    }

    // 模拟获取评价数据（后续可从 reviews 集合获取）
    const reviews = [
      {
        id: 1,
        userName: '小明妈妈',
        userAvatar: '/images/avatar.png',
        rating: 5,
        content: '张老师非常有耐心，孩子很喜欢，学习成绩也有明显进步！',
        time: '2025-12-28',
        serviceName: '学科辅导'
      },
      {
        id: 2,
        userName: '乐乐爸爸',
        userAvatar: '/images/avatar.png',
        rating: 5,
        content: '老师很专业，对孩子很有方法，推荐！',
        time: '2025-12-25',
        serviceName: '作业陪伴'
      }
    ]

    // 模拟获取服务列表（后续可从 services 集合获取）
    const services = [
      { id: 1, name: '学科辅导', price: teacherData.price, unit: teacherData.priceUnit, description: '小学全科、初中数学英语辅导' },
      { id: 2, name: '作业陪伴', price: Math.floor(teacherData.price * 0.8), unit: teacherData.priceUnit, description: '陪伴孩子完成作业，培养良好学习习惯' },
      { id: 3, name: '兴趣培养', price: Math.floor(teacherData.price * 0.9), unit: teacherData.priceUnit, description: '绘画、书法等兴趣爱好培养' }
    ]

    return {
      success: true,
      data: {
        teacher: teacherData,
        reviews: reviews,
        services: services,
        cases: cases
      }
    }
  } catch (e) {
    console.error('getTeacherDetail error:', e)
    return {
      success: false,
      error: e.message || e
    }
  }
}