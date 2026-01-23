// pages/demand-list/index.js
// 我的预约列表页面 - 展示用户提交的预约需求
const app = getApp()

Page({
    data: {
        // 预约状态tabs
        tabs: [
            { id: 'all', name: '全部' },
            { id: 'pending', name: '待处理' },
            { id: 'matched', name: '已匹配' },
            { id: 'completed', name: '已完成' },
            { id: 'cancelled', name: '已取消' }
        ],

        // 当前选中的tab
        currentTab: 'all',

        // 预约列表
        demandList: [],

        // 分页
        page: 1,
        pageSize: 10,
        hasMore: true,

        loading: false
    },

    onLoad: function (options) {
        if (options.status) {
            this.setData({
                currentTab: options.status
            })
        }
        this.loadDemandList()
    },

    onShow: function () {
        // 每次显示页面时刷新数据
        this.setData({
            page: 1,
            demandList: []
        })
        this.loadDemandList()
    },

    onPullDownRefresh: function () {
        this.setData({
            page: 1,
            hasMore: true,
            demandList: []
        })
        this.loadDemandList()
        wx.stopPullDownRefresh()
    },

    onReachBottom: function () {
        if (this.data.hasMore && !this.data.loading) {
            this.loadMoreDemands()
        }
    },

    // 切换Tab
    switchTab: function (e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({
            currentTab: tab,
            page: 1,
            hasMore: true,
            demandList: []
        })
        this.loadDemandList()
    },

    // 加载预约列表
    loadDemandList: function () {
        this.setData({ loading: true })

        const db = wx.cloud.database()
        const _ = db.command

        // 构建查询条件
        let query = {}
        if (this.data.currentTab !== 'all') {
            query.status = this.data.currentTab
        }

        // 计算分页
        const skip = (this.data.page - 1) * this.data.pageSize

        // 查询当前用户的预约
        db.collection('demands')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(this.data.pageSize)
            .get()
            .then(res => {
                const list = res.data.map(item => ({
                    ...item,
                    statusText: this.getStatusText(item.status),
                    createTimeText: this.formatTime(item.createTime)
                }))

                this.setData({
                    demandList: this.data.page === 1 ? list : this.data.demandList.concat(list),
                    hasMore: list.length >= this.data.pageSize,
                    loading: false
                })
            })
            .catch(err => {
                console.error('获取预约列表失败', err)
                wx.showToast({ title: '加载失败', icon: 'none' })
                this.setData({ loading: false })
            })
    },

    // 格式化时间
    formatTime: function (date) {
        if (!date) return ''
        // 处理云数据库日期格式
        const d = typeof date === 'object' && date.$date ? new Date(date.$date) : new Date(date)
        const year = d.getFullYear()
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const day = d.getDate().toString().padStart(2, '0')
        const hour = d.getHours().toString().padStart(2, '0')
        const minute = d.getMinutes().toString().padStart(2, '0')
        return `${year}-${month}-${day} ${hour}:${minute}`
    },

    // 获取状态文本
    getStatusText: function (status) {
        const map = {
            'pending': '待处理',
            'matched': '已匹配',
            'completed': '已完成',
            'cancelled': '已取消'
        }
        return map[status] || '待处理'
    },

    // 加载更多
    loadMoreDemands: function () {
        this.setData({
            page: this.data.page + 1
        })
        this.loadDemandList()
    },

    // 查看预约详情
    viewDemandDetail: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/demand-detail/index?id=' + id
        })
    },

    // 取消预约
    cancelDemand: function (e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '提示',
            content: '确定要取消该预约吗？',
            success: (res) => {
                if (res.confirm) {
                    const db = wx.cloud.database()
                    db.collection('demands').doc(id).update({
                        data: {
                            status: 'cancelled',
                            updateTime: db.serverDate()
                        }
                    }).then(() => {
                        // 更新本地数据
                        const demandList = this.data.demandList.map(d => {
                            if (d._id === id) {
                                d.status = 'cancelled'
                                d.statusText = '已取消'
                            }
                            return d
                        })
                        this.setData({ demandList })

                        wx.showToast({
                            title: '预约已取消',
                            icon: 'success'
                        })
                    }).catch(err => {
                        console.error('取消预约失败', err)
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    })
                }
            }
        })
    }
})
