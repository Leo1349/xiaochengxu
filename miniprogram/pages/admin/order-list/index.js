Page({
    data: {
        currentTab: 'all',
        orderList: [],
        page: 1,
        pageSize: 10,
        loading: false,
        hasMore: true,
        statusMap: {
            'pending': '待接单',
            'confirmed': '已接单',
            'ongoing': '服务中',
            'completed': '已完成',
            'cancelled': '已取消'
        }
    },

    onLoad() {
        this.checkLogin()
    },

    onShow() {
        if (this.data.orderList.length > 0) {
            // 如果已经有数据，静默刷新第一页
            this.loadData(true)
        }
    },

    checkLogin() {
        const token = wx.getStorageSync('adminToken')
        if (!token) {
            wx.redirectTo({
                url: '/pages/admin/login/index'
            })
            return
        }
        this.loadData(true)
    },

    switchTab(e) {
        const status = e.currentTarget.dataset.status
        if (this.data.currentTab === status) return

        this.setData({
            currentTab: status,
            orderList: [],
            hasMore: true
        })
        this.loadData(true)
    },

    loadData(refresh = false) {
        if (this.data.loading) return
        if (!refresh && !this.data.hasMore) return

        this.setData({ loading: true })
        const page = refresh ? 1 : this.data.page + 1

        wx.cloud.callFunction({
            name: 'adminFunctions',
            data: {
                type: 'getOrderList',
                data: {
                    page: page,
                    pageSize: this.data.pageSize,
                    status: this.data.currentTab
                }
            },
            success: res => {
                if (res.result.success) {
                    const list = res.result.data.list.map(item => {
                        return {
                            ...item,
                            statusText: this.data.statusMap[item.status] || item.status,
                            createTimeStr: this.formatTime(item.createTime)
                        }
                    })

                    this.setData({
                        orderList: refresh ? list : this.data.orderList.concat(list),
                        page: page,
                        hasMore: list.length === this.data.pageSize,
                        loading: false
                    })
                } else {
                    wx.showToast({ title: '加载失败', icon: 'none' })
                    this.setData({ loading: false })
                }
            },
            fail: err => {
                console.error(err)
                wx.showToast({ title: '网络错误', icon: 'none' })
                this.setData({ loading: false })
            }
        })
    },

    onLoadMore() {
        this.loadData()
    },

    onPullDownRefresh() {
        this.loadData(true)
        wx.stopPullDownRefresh()
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

    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/admin/order-detail/index?id=${id}`
        })
    },

    onQuickAccept(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '提示',
            content: '确认接单吗？',
            success: (res) => {
                if (res.confirm) {
                    this.updateStatus(id, 'confirmed')
                }
            }
        })
    },

    updateStatus(id, status) {
        wx.showLoading({ title: '处理中' })
        wx.cloud.callFunction({
            name: 'adminFunctions',
            data: {
                type: 'updateOrderStatus',
                data: {
                    orderId: id,
                    status: status
                }
            },
            success: res => {
                wx.hideLoading()
                if (res.result.success) {
                    wx.showToast({ title: '操作成功' })
                    this.loadData(true)
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
