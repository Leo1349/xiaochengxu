const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

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
      { id: 1, name: '学科辅导', price: teacher.data.price, unit: teacher.data.priceUnit, description: '小学全科、初中数学英语辅导' },
      { id: 2, name: '作业陪伴', price: Math.floor(teacher.data.price * 0.8), unit: teacher.data.priceUnit, description: '陪伴孩子完成作业，培养良好学习习惯' },
      { id: 3, name: '兴趣培养', price: Math.floor(teacher.data.price * 0.9), unit: teacher.data.priceUnit, description: '绘画、书法等兴趣爱好培养' }
    ]

    return {
      success: true,
      data: {
        teacher: teacher.data,
        reviews: reviews,
        services: services,
        cases: [] // 暂无案例数据
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}