const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const {
    teacherId,
    teacherName,
    teacherAvatar,
    teacherGender, // Add gender
    serviceId,
    serviceName,
    childId,
    childName,
    serviceDate,
    serviceTime,
    serviceDuration,
    address,
    remark,
    totalPrice,
    discountPrice,
    finalPrice
  } = event

  try {
    // 0. 确保 orders 集合存在
    try { await db.createCollection('orders') } catch (e) { }

    const ordersCollection = db.collection('orders')

    // 生成订单号
    const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000)

    const orderData = {
      _openid: openid,
      orderNo: orderNo,
      teacherId,
      teacherName,
      teacherAvatar,
      teacherGender, // Save gender
      serviceId,
      serviceName,
      childId,
      childName,
      serviceDate,
      serviceTime,
      serviceDuration,
      address,
      remark,
      totalPrice,
      discountPrice,
      finalPrice,
      status: 'pending', // pending, confirmed, ongoing, completed, cancelled
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const res = await ordersCollection.add({
      data: orderData
    })

    return {
      success: true,
      data: {
        orderId: res._id,
        orderNo: orderNo
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}