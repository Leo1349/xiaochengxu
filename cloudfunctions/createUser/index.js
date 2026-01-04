const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { userInfo } = event

  try {
    // 0. 确保 users 集合存在
    try { await db.createCollection('users') } catch (e) { }

    const usersCollection = db.collection('users')
    
    // 1. 查询用户是否存在
    const userRes = await usersCollection.where({
      _openid: openid
    }).get()

    if (userRes.data.length > 0) {
      // 用户已存在，更新最后登录时间
      const user = userRes.data[0]
      await usersCollection.doc(user._id).update({
        data: {
          lastLoginTime: db.serverDate(),
          // 可选：更新用户信息（如果头像昵称变了）
          // nickName: userInfo.nickName,
          // avatarUrl: userInfo.avatarUrl
        }
      })
      return {
        success: true,
        data: user
      }
    } else {
      // 用户不存在，创建新用户
      const newUser = {
        _openid: openid,
        ...userInfo,
        currentRole: 'parent', // 默认角色
        createTime: db.serverDate(),
        lastLoginTime: db.serverDate()
      }
      
      const addRes = await usersCollection.add({
        data: newUser
      })
      
      return {
        success: true,
        data: {
          ...newUser,
          _id: addRes._id
        }
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}