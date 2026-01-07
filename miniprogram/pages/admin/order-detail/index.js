const app = getApp()
const db = wx.cloud.database()

Page({
    data: {
        orderId: null,
        order: null,
        statusMap: {
            'pending': '待接单',
            'confirmed': '已接单',
            'ongoing': '服务中',
            'completed': '已完成',
            'cancelled': '已取消'
        }
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ orderId: options.id })
            this.loadOrderDetail(options.id)
        }
    },

    loadOrderDetail(id) {
        wx.showLoading({ title: '加载中' })
        db.collection('orders').doc(id).get().then(res => {
            const order = res.data
            order.statusText = this.data.statusMap[order.status]
            order.createTimeStr = this.formatTime(order.createTime)

            this.setData({
                order: order
            })
            wx.hideLoading()
        }).catch(err => {
            console.error(err)
            wx.hideLoading()
            wx.showToast({ title: '加载失败', icon: 'none' })
        })
    },

    formatTime(isoString) {
        if (!isoString) return ''
        const date = new Date(isoString)
        const m = (date.getMonth() + 1).toString().padStart(2, '0')
        const d = date.getDate().toString().padStart(2, '0')
        const h = date.getHours().toString().padStart(2, '0')
        const min = date.getMinutes().toString().padStart(2, '0')
        return `${m}-${d} ${h}:${min}`
    },

    updateStatus(e) {
        const status = e.currentTarget.dataset.status
        const statusText = this.data.statusMap[status]

        wx.showModal({
            title: '提示',
            content: `确认将订单状态更新为“${statusText}”吗？`,
            success: (res) => {
                if (res.confirm) {
                    this.doUpdate(status)
                }
            }
        })
    },

    doUpdate(status) {
        wx.showLoading({ title: '处理中' })
        wx.cloud.callFunction({
            name: 'adminFunctions',
            data: {
                type: 'updateOrderStatus',
                data: {
                    orderId: this.data.orderId,
                    status: status
                }
            },
            success: res => {
                wx.hideLoading()
                if (res.result.success) {
                    wx.showToast({ title: '操作成功' })
                    this.loadOrderDetail(this.data.orderId)
                } else {
                    wx.showToast({ title: '操作失败', icon: 'none' })
                }
            },
            fail: () => {
                wx.hideLoading()
                wx.showToast({ title: '网络错误', icon: 'none' })
            }
        })
    }
})
