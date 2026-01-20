const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 模拟数据 - 老师列表
// NOTE: gender 字段用于确定默认头像（male/female）
// 如果 avatar 为空，前端会根据 gender 显示默认头像
const teachers = [
  {
    name: '张老师',
    gender: 'male',
    avatar: '/images/avatars/teacher-male-default.png',
    title: '专业陪伴师',
    rating: 4.9,
    orderCount: 128,
    tags: ['学科辅导', '耐心细致', '经验丰富'],
    price: 150,
    priceUnit: '小时',
    introduction: '5年教育经验，擅长小学全科辅导，曾任某知名培训机构主讲老师。对待孩子有爱心、有耐心，善于发现孩子的优点并加以引导。',
    education: '北京师范大学 教育学硕士',
    experience: '5年教育行业经验',
    certificates: ['教师资格证', '心理咨询师证'],
    serviceTime: '周一至周五 14:00-20:00，周末全天',
    serviceArea: '北京市海淀区、朝阳区',
    photos: [
      '/images/ai_example1.png',
      '/images/ai_example2.png',
      '/images/cloud_dev.png'
    ],
    isRecommended: true
  },
  {
    name: '李老师',
    gender: 'female',
    avatar: '/images/avatars/teacher-female-default.png',
    title: '资深家教',
    rating: 4.8,
    orderCount: 96,
    tags: ['英语专精', '口语流利', '亲和力强'],
    price: 180,
    priceUnit: '小时',
    introduction: '英语专业八级，拥有丰富的少儿英语教学经验。',
    education: '上海外国语大学 英语专业',
    experience: '3年家教经验',
    certificates: ['英语专八', 'TESOL证书'],
    serviceTime: '周末全天',
    serviceArea: '上海市浦东新区',
    photos: [],
    isRecommended: true
  },
  {
    name: '王老师',
    gender: 'female',
    avatar: '/images/avatars/teacher-female-default.png',
    title: '金牌陪伴师',
    rating: 5.0,
    orderCount: 210,
    tags: ['全能型', '心理辅导', '习惯培养'],
    price: 200,
    priceUnit: '小时',
    introduction: '擅长与孩子沟通，不仅关注学习成绩，更注重心理健康和习惯培养。',
    education: '华东师范大学 心理学专业',
    experience: '8年教育及心理咨询经验',
    certificates: ['国家二级心理咨询师'],
    serviceTime: '工作日晚间',
    serviceArea: '广州市天河区',
    photos: [],
    isRecommended: false
  }
]

// 模拟数据 - Banner
const banners = [
  {
    id: 1,
    url: '/images/ai_example1.png',
    link: ''
  },
  {
    id: 2,
    url: '/images/ai_example2.png',
    link: ''
  },
  {
    id: 3,
    url: '/images/cloud_dev.png',
    link: ''
  }
]

exports.main = async (event, context) => {
  try {
    // 0. 尝试创建集合（如果不存在）
    try { await db.createCollection('teachers') } catch (e) { console.log('teachers collection might already exist') }
    try { await db.createCollection('banners') } catch (e) { console.log('banners collection might already exist') }

    // 1. 初始化老师数据
    const teachersCollection = db.collection('teachers')
    // 先清空（可选，这里为了演示简单直接添加，实际生产慎用）
    // await teachersCollection.where({}).remove() 

    // 检查是否已有数据，避免重复添加
    const countResult = await teachersCollection.count()
    if (countResult.total === 0) {
      for (const teacher of teachers) {
        await teachersCollection.add({
          data: {
            ...teacher,
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        })
      }
    }

    // 2. 初始化 Banner 数据
    const bannersCollection = db.collection('banners')
    const bannerCount = await bannersCollection.count()
    if (bannerCount.total === 0) {
      for (const banner of banners) {
        await bannersCollection.add({
          data: {
            ...banner,
            createTime: db.serverDate()
          }
        })
      }
    }

    return {
      success: true,
      message: 'Database seeded successfully',
      initTeacherCount: teachers.length,
      initBannerCount: banners.length
    }
  } catch (e) {
    return {
      success: false,
      message: 'Database seed failed',
      error: e
    }
  }
}