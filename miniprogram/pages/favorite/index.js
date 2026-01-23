// pages/favorite/index.js
const app = getApp()

Page({
    data: {
        activeTab: 'teacher', // teacher 或 case
        teacherList: [],
        caseList: [],
        loading: false
    },

    onLoad: function (options) {
        if (options.tab) {
            this.setData({ activeTab: options.tab })
        }
        this.loadFavorites()
    },

    onShow: function () {
        this.loadFavorites()
    },

    onPullDownRefresh: function () {
        this.loadFavorites()
        wx.stopPullDownRefresh()
    },

    // 切换Tab
    switchTab: function (e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ activeTab: tab })
        this.loadFavorites()
    },

    // 加载收藏列表
    loadFavorites: function () {
        this.setData({ loading: true })

        const userInfo = wx.getStorageSync('userInfo')

        if (!userInfo || !userInfo._id) {
            this.setData({
                loading: false,
                teacherList: [],
                caseList: []
            })
            return
        }

        if (this.data.activeTab === 'teacher') {
            this.loadFavoriteTeachers(userInfo._id)
        } else {
            this.loadFavoriteCases(userInfo._id)
        }
    },

    // 加载收藏老师
    loadFavoriteTeachers: function (userId) {
        const db = wx.cloud.database()

        db.collection('favorite_teachers')
            .where({ userId: userId })
            .orderBy('createTime', 'desc')
            .get()
            .then(res => {
                this.setData({
                    teacherList: res.data || [],
                    loading: false
                })
            })
            .catch(err => {
                console.error('加载收藏老师失败', err)
                // 如果集合不存在，显示空列表而不是报错
                this.setData({
                    loading: false,
                    teacherList: []
                })
            })
    },

    // 加载收藏案例
    loadFavoriteCases: function (userId) {
        const db = wx.cloud.database()

        db.collection('favorite_cases')
            .where({ userId: userId })
            .orderBy('createTime', 'desc')
            .get()
            .then(res => {
                this.setData({
                    caseList: res.data || [],
                    loading: false
                })
            })
            .catch(err => {
                console.error('加载收藏案例失败', err)
                // 如果集合不存在，显示空列表而不是报错
                this.setData({
                    loading: false,
                    caseList: []
                })
            })
    },

    // 查看老师详情
    viewTeacherDetail: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/teacher-detail/index?id=' + id
        })
    },

    // 查看案例详情
    viewCaseDetail: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/case-detail/index?id=' + id
        })
    },

    // 取消收藏老师
    removeFavoriteTeacher: function (e) {
        const id = e.currentTarget.dataset.id
        const that = this

        wx.showModal({
            title: '提示',
            content: '确定要取消收藏该老师吗？',
            success: function (res) {
                if (res.confirm) {
                    const db = wx.cloud.database()
                    db.collection('favorite_teachers').doc(id).remove()
                        .then(() => {
                            wx.showToast({ title: '已取消收藏', icon: 'success' })
                            that.loadFavorites()
                        })
                        .catch(err => {
                            console.error('取消收藏失败', err)
                            wx.showToast({ title: '操作失败', icon: 'none' })
                        })
                }
            }
        })
    },

    // 取消收藏案例
    removeFavoriteCase: function (e) {
        const id = e.currentTarget.dataset.id
        const that = this

        wx.showModal({
            title: '提示',
            content: '确定要取消收藏该案例吗？',
            success: function (res) {
                if (res.confirm) {
                    const db = wx.cloud.database()
                    db.collection('favorite_cases').doc(id).remove()
                        .then(() => {
                            wx.showToast({ title: '已取消收藏', icon: 'success' })
                            that.loadFavorites()
                        })
                        .catch(err => {
                            console.error('取消收藏失败', err)
                            wx.showToast({ title: '操作失败', icon: 'none' })
                        })
                }
            }
        })
    },

    // 跳转到首页
    goToHomePage: function () {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },

    // 跳转到案例列表
    goToCaseList: function () {
        wx.navigateTo({
            url: '/pages/case-list/index'
        })
    },

    // 分享
    onShareAppMessage: function () {
        return {
            title: '智伴优程 - 我的收藏',
            path: '/pages/index/index'
        }
    }
})
