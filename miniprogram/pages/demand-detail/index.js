// pages/demand-detail/index.js
// 预约详情页面
const app = getApp()

Page({
    data: {
        demand: null,
        loading: true
    },

    onLoad: function (options) {
        if (options.id) {
            this.loadDemandDetail(options.id)
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' })
            setTimeout(() => wx.navigateBack(), 1500)
        }
    },

    // 加载预约详情
    loadDemandDetail: function (id) {
        const db = wx.cloud.database()
        db.collection('demands').doc(id).get()
            .then(res => {
                const demand = res.data
                demand.statusText = this.getStatusText(demand.status)
                demand.createTimeText = this.formatTime(demand.createTime)

                // 如果有图片，获取临时链接
                if (demand.mediaList && demand.mediaList.length > 0) {
                    this.refreshImageUrls(demand)
                } else {
                    this.setData({ demand, loading: false })
                }
            })
            .catch(err => {
                console.error('获取预约详情失败', err)
                wx.showToast({ title: '加载失败', icon: 'none' })
                this.setData({ loading: false })
            })
    },

    // 刷新图片临时链接
    refreshImageUrls: function (demand) {
        const fileIds = demand.mediaList
            .map(m => m.fileID || m.fileId || m.fileid)
            .filter(id => id && id.startsWith('cloud://'))

        if (fileIds.length > 0) {
            wx.cloud.getTempFileURL({
                fileList: fileIds,
                success: res => {
                    const urlMap = new Map()
                    res.fileList.forEach(file => {
                        if (file.tempFileURL) {
                            urlMap.set(file.fileID, file.tempFileURL)
                        }
                    })

                    demand.mediaList = demand.mediaList.map(media => {
                        const id = media.fileID || media.fileId || media.fileid
                        if (id && urlMap.has(id)) {
                            return { ...media, tempUrl: urlMap.get(id) }
                        }
                        return media
                    })

                    this.setData({ demand, loading: false })
                },
                fail: err => {
                    console.error('获取图片链接失败', err)
                    this.setData({ demand, loading: false })
                }
            })
        } else {
            this.setData({ demand, loading: false })
        }
    },

    // 格式化时间
    formatTime: function (date) {
        if (!date) return ''
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

    // 预览图片
    previewImage: function (e) {
        const current = e.currentTarget.dataset.url
        const urls = this.data.demand.mediaList
            .map(m => m.tempUrl || m.url || m.fileID)
            .filter(u => u)

        wx.previewImage({
            current: current,
            urls: urls
        })
    },

    // 取消预约
    cancelDemand: function () {
        wx.showModal({
            title: '提示',
            content: '确定要取消该预约吗？',
            success: (res) => {
                if (res.confirm) {
                    const db = wx.cloud.database()
                    db.collection('demands').doc(this.data.demand._id).update({
                        data: {
                            status: 'cancelled',
                            updateTime: db.serverDate()
                        }
                    }).then(() => {
                        wx.showToast({ title: '已取消', icon: 'success' })
                        this.setData({
                            'demand.status': 'cancelled',
                            'demand.statusText': '已取消'
                        })
                    }).catch(err => {
                        console.error('取消失败', err)
                        wx.showToast({ title: '操作失败', icon: 'none' })
                    })
                }
            }
        })
    },

    // 联系客服
    contactService: function () {
        wx.navigateTo({
            url: '/pages/customer-service/index'
        })
    }
})
