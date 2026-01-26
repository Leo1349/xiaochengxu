// pages/feedback-list/index.js
const app = getApp()

Page({
    data: {
        feedbacks: [],
        loading: false,
        page: 1,
        pageSize: 10,
        hasMore: true,
        statusMap: {
            pending: '待处理',
            processing: '处理中',
            resolved: '已解决'
        },
        typeMap: {
            suggestion: '功能建议',
            bug: '问题反馈',
            complaint: '投诉举报',
            other: '其他'
        }
    },

    onLoad: function (options) {
        this.loadFeedbacks(true)
    },

    onPullDownRefresh: function () {
        this.setData({ page: 1, hasMore: true })
        this.loadFeedbacks(true).then(() => {
            wx.stopPullDownRefresh()
        })
    },

    onReachBottom: function () {
        if (this.data.hasMore && !this.data.loading) {
            this.setData({ page: this.data.page + 1 })
            this.loadFeedbacks()
        }
    },

    loadFeedbacks: async function (reset = false) {
        if (this.data.loading) return
        this.setData({ loading: true })

        try {
            const res = await wx.cloud.callFunction({
                name: 'getUserFeedbacks',
                data: {
                    page: this.data.page,
                    pageSize: this.data.pageSize
                }
            })

            if (res.result.success) {
                const list = res.result.data.list.map(item => {
                    // 格式化时间
                    let timeFormatted = ''
                    if (typeof item.createTime === 'string') {
                        timeFormatted = item.createTime
                    } else if (item.createTime && item.createTime.$date) {
                        // 处理云开发时间对象
                        const date = new Date(item.createTime.$date)
                        timeFormatted = this.formatTime(date)
                    } else {
                        timeFormatted = this.formatTime(new Date())
                    }
                    return {
                        ...item,
                        timeFormatted
                    }
                })

                const total = res.result.data.total
                const newFeedbacks = reset ? list : this.data.feedbacks.concat(list)

                this.setData({
                    feedbacks: newFeedbacks,
                    hasMore: newFeedbacks.length < total
                })
            }
        } catch (err) {
            console.error('加载反馈失败', err)
            wx.showToast({ title: '加载失败', icon: 'none' })
        } finally {
            this.setData({ loading: false })
        }
    },

    formatTime: function (date) {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hour = date.getHours().toString().padStart(2, '0')
        const minute = date.getMinutes().toString().padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}`
    },

    previewImage: function (e) {
        const { urls, current } = e.currentTarget.dataset
        wx.previewImage({
            current,
            urls
        })
    }
})
