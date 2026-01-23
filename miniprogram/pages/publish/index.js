// pages/publish/index.js
const app = getApp()

Page({
    data: {
        // 服务项目
        serviceOptions: ['学科辅导', '兴趣培养', '习惯养成', '心理疏导', '升学规划', '特殊陪伴'],
        serviceIndex: -1,

        // 服务内容
        content: '',

        // 图片/视频
        mediaList: [],

        // 服务地址
        address: '',
        addressInputMode: false, // false: 选择模式, true: 输入模式

        // 服务时间
        timeArray: [[], []],
        timeIndex: [0, 0],
        selectedTime: '',
        timeInputMode: false, // false: 选择模式, true: 输入模式

        // 其他表单数据
        formData: {
            age: '',
            gender: '',
            hobby: '',
            content_detail: '',
            frequency: '',
            address_detail: '',
            requirements: ''
        }
    },

    onLoad: function (options) {
        this.initTimePicker()
    },

    onShow: function () {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 2
            })
        }
    },

    // 初始化时间选择器
    initTimePicker: function () {
        const days = ['今天', '明天', '后天']
        const hours = []
        for (let i = 7; i <= 22; i++) {
            hours.push(i + ':00')
            hours.push(i + ':30')
        }

        this.setData({
            timeArray: [days, hours]
        })
    },

    // 服务项目选择
    onServiceChange: function (e) {
        this.setData({
            serviceIndex: e.detail.value
        })
    },

    // 服务内容输入
    onContentInput: function (e) {
        this.setData({
            content: e.detail.value
        })
    },

    // 选择图片/视频
    chooseMedia: function () {
        wx.chooseMedia({
            count: 9 - this.data.mediaList.length,
            mediaType: ['image', 'video'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFiles = res.tempFiles.map(file => ({
                    url: file.tempFilePath,
                    type: file.fileType
                }))

                this.setData({
                    mediaList: this.data.mediaList.concat(tempFiles)
                })
            }
        })
    },

    // 删除图片/视频
    deleteMedia: function (e) {
        const index = e.currentTarget.dataset.index
        const list = this.data.mediaList
        list.splice(index, 1)
        this.setData({
            mediaList: list
        })
    },

    // 预览图片
    previewImage: function (e) {
        const current = e.currentTarget.dataset.url
        const urls = this.data.mediaList
            .filter(item => item.type === 'image')
            .map(item => item.url)

        wx.previewImage({
            current: current,
            urls: urls
        })
    },

    // 选择地址
    chooseAddress: function () {
        wx.chooseLocation({
            success: (res) => {
                this.setData({
                    address: res.name || res.address,
                    ['formData.address_detail']: res.address
                })
            },
            fail: (err) => {
                console.error('选择地址失败', err)
                if (err.errMsg.indexOf('auth') > -1) {
                    wx.showToast({
                        title: '请授权位置信息',
                        icon: 'none'
                    })
                }
            }
        })
    },

    // 切换地址输入模式
    toggleAddressMode: function () {
        this.setData({
            addressInputMode: !this.data.addressInputMode
        })
    },

    // 手动输入地址
    onAddressInput: function (e) {
        this.setData({
            address: e.detail.value,
            ['formData.address_detail']: e.detail.value
        })
    },

    // 切换时间输入模式
    toggleTimeMode: function () {
        this.setData({
            timeInputMode: !this.data.timeInputMode
        })
    },

    // 手动输入时间
    onTimeInput: function (e) {
        this.setData({
            selectedTime: e.detail.value
        })
    },

    // 时间选择改变
    onTimeChange: function (e) {
        const index = e.detail.value
        const day = this.data.timeArray[0][index[0]]
        const time = this.data.timeArray[1][index[1]]

        this.setData({
            timeIndex: index,
            selectedTime: `${day} ${time}`
        })
    },

    onTimeColumnChange: function (e) {
        // 可以在这里处理列变化逻辑，例如今天过去的时间不可选
        // 暂时简化处理
    },

    // 上传单个文件到云存储
    uploadFileToCloud: function (filePath) {
        return new Promise((resolve, reject) => {
            // 生成唯一文件名
            const timestamp = Date.now()
            const random = Math.random().toString(36).substr(2, 8)
            const ext = filePath.split('.').pop() || 'jpg'
            const cloudPath = `demands/${timestamp}_${random}.${ext}`

            wx.cloud.uploadFile({
                cloudPath: cloudPath,
                filePath: filePath,
                success: (res) => {
                    resolve(res.fileID)
                },
                fail: (err) => {
                    console.error('上传文件失败', err)
                    reject(err)
                }
            })
        })
    },

    // 批量上传文件
    uploadAllFiles: async function (mediaList) {
        if (!mediaList || mediaList.length === 0) {
            return []
        }

        const uploadedList = []
        for (const item of mediaList) {
            try {
                const fileID = await this.uploadFileToCloud(item.url)
                uploadedList.push({
                    fileID: fileID,
                    type: item.type
                })
            } catch (err) {
                console.error('上传失败，跳过该文件', err)
                // 继续上传其他文件
            }
        }
        return uploadedList
    },

    // 提交表单
    submitForm: async function (e) {
        const values = e.detail.value

        // 校验必填项
        if (this.data.serviceIndex === -1) {
            this.showToast('请选择服务项目')
            return
        }
        if (!values.content) {
            this.showToast('请填写服务内容')
            return
        }

        wx.showLoading({ title: '提交中...' })

        try {
            // NOTE: 先上传图片/视频到云存储，获取云文件ID后再保存到数据库
            let uploadedMedia = []
            if (this.data.mediaList.length > 0) {
                wx.showLoading({ title: '上传图片中...' })
                uploadedMedia = await this.uploadAllFiles(this.data.mediaList)
            }

            // 提交到 demands 集合
            wx.showLoading({ title: '保存中...' })
            const db = wx.cloud.database()
            await db.collection('demands').add({
                data: {
                    ...this.data.formData,
                    serviceType: this.data.serviceOptions[this.data.serviceIndex],
                    content: this.data.content,
                    mediaList: uploadedMedia, // 使用云存储文件ID
                    address: this.data.address,
                    selectedTime: this.data.selectedTime,
                    createTime: db.serverDate(),
                    status: 'pending' // 待处理
                }
            })

            wx.hideLoading()
            wx.showToast({
                title: '预约申请已提交',
                icon: 'success',
                duration: 2000
            })

            setTimeout(() => {
                // 重置页面
                this.setData({
                    serviceIndex: -1,
                    content: '',
                    mediaList: [],
                    address: '',
                    selectedTime: '',
                    formData: {
                        age: '', gender: '', hobby: '', content_detail: '', frequency: '', address_detail: '', requirements: ''
                    }
                })
                // 可选跳转到订单列表或需求列表
            }, 2000)
        } catch (err) {
            wx.hideLoading()
            console.error('提交失败', err)
            wx.showToast({ title: '提交失败，请重试', icon: 'none' })
        }
    },

    showToast(msg) {
        wx.showToast({
            title: msg,
            icon: 'none'
        })
    },

    // 分享
    onShareAppMessage: function () {
        return {
            title: '一键下单 - 智伴优程',
            path: '/pages/publish/index'
        }
    }
})
