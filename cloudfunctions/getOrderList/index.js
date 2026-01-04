const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { status, page = 1, pageSize = 10, role = 'parent' } = event
  
  try {
    const ordersCollection = db.collection('orders')
    const _ = db.command
    
    // 构建查询条件
    let query = {}
    
    // 根据角色筛选
    if (role === 'teacher') {
      // 如果是老师，查询该老师的订单（这里假设老师也有openid，或者通过teacherId关联）
      // 实际项目中可能需要更复杂的权限控制，这里简化为查询所有订单（演示用）
      // 或者根据 teacherId 查询
      // query.teacherId = ... 
    } else {
      // 如果是家长，查询自己的订单
      query._openid = openid
    }
    
    // 根据状态筛选
    if (status && status !== 'all') {
      query.status = status
    }
    
    // 计算分页
    const skip = (page - 1) * pageSize
    
    // 查询总数
    const countResult = await ordersCollection.where(query).count()
    const total = countResult.total
    
    // 查询列表
    const listResult = await ordersCollection.where(query)
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
      
    return {
      success: true,
      data: {
        list: listResult.data,
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: total > page * pageSize
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}