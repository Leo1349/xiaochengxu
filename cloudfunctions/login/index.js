const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type, code, userInfo } = event
  const openid = wxContext.OPENID

  try {
    let phoneNumber = null

    // 1. 如果是手机号快捷登录，获取手机号
    if (type === 'phone' && code) {
      try {
        const res = await cloud.openapi.phonenumber.getPhoneNumber({
          code: code
        })
        if (res.errCode === 0) {
          phoneNumber = res.phoneInfo.phoneNumber
        } else {
          console.warn('获取手机号失败 (可能是个人主体小程序无权限):', res.errMsg)
          // 不抛出错误，继续执行，允许无手机号登录
        }
      } catch (err) {
        console.warn('调用获取手机号接口异常:', err)
        // 不抛出错误，继续执行
      }
    }

    // 2. 查找用户是否存在
    const usersCollection = db.collection('users')
    const userRes = await usersCollection.where({
      _openid: openid
    }).get()

    let userData = null

    if (userRes.data.length > 0) {
      // 3a. 用户存在，更新信息
      const user = userRes.data[0]
      const updateData = {
        lastLoginTime: db.serverDate()
      }
      // 如果获取到了手机号，且用户原来没有或不一致，则更新
      if (phoneNumber && user.phone !== phoneNumber) {
        updateData.phone = phoneNumber
      }

      await usersCollection.doc(user._id).update({
        data: updateData
      })

      userData = { ...user, ...updateData }
    } else {
      // 3b. 用户不存在，创建新用户
      const newUser = {
        _openid: openid,
        nickName: userInfo?.nickName || '微信用户',
        avatarUrl: userInfo?.avatarUrl || '',
        phone: phoneNumber || '', // 如果有手机号则存入
        currentRole: 'parent',
        createTime: db.serverDate(),
        lastLoginTime: db.serverDate()
      }

      const addRes = await usersCollection.add({
        data: newUser
      })

      userData = { ...newUser, _id: addRes._id }
    }

    return {
      success: true,
      data: userData,
      token: 'cloud_token_' + openid // 简单模拟token
    }

  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message || '登录失败'
    }
  }
}