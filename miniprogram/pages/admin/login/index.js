Page({
    data: {
        password: '',
        loading: false
    },

    onInput(e) {
        this.setData({
            password: e.detail.value
        })
    },

    onLogin() {
        if (!this.data.password) {
            wx.showToast({
                title: '请输入密码',
                icon: 'none'
            })
            return
        }

        this.setData({ loading: true })

        wx.cloud.callFunction({
            name: 'adminFunctions',
            data: {
                type: 'login',
                data: {
                    password: this.data.password
                }
            },
            success: res => {
                this.setData({ loading: false })
                if (res.result.success) {
                    wx.setStorageSync('adminToken', res.result.data.token)
                    wx.showToast({
                        title: '登录成功',
                        icon: 'success'
                    })
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/admin/order-list/index'
                        })
                    }, 1500)
                } else {
                    wx.showToast({
                        title: res.result.error || '登录失败',
                        icon: 'none'
                    })
                }
            },
            fail: err => {
                this.setData({ loading: false })
                wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                })
                console.error(err)
            }
        })
    }
})
