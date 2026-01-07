Component({
    data: {
        show: false,
        innerShow: false,
    },
    lifetimes: {
        attached: function () {
            const version = wx.getAppBaseInfo().SDKVersion
            if (this.compareVersion(version, '2.32.3') >= 0) {
                wx.getPrivacySetting({
                    success: res => {
                        if (res.needAuthorization) {
                            this.setData({
                                show: true,
                                innerShow: true
                            })
                        }
                    }
                })
            }
        }
    },
    methods: {
        handleAgree(e) {
            if (e.detail.buttonId === 'agree-btn') {
                this.setData({
                    innerShow: false
                })
                // 必须调用 resolve 才能继续
                if (this.resolvePrivacyAuthorization) {
                    this.resolvePrivacyAuthorization({
                        buttonId: 'agree-btn',
                        event: 'agree'
                    })
                }
            }
            this.triggerEvent('agree')
        },
        handleDisagree(e) {
            this.setData({
                innerShow: false
            })
            if (this.resolvePrivacyAuthorization) {
                this.resolvePrivacyAuthorization({
                    event: 'disagree'
                })
            }
            this.triggerEvent('disagree')
        },
        compareVersion(v1, v2) {
            v1 = v1.split('.')
            v2 = v2.split('.')
            const len = Math.max(v1.length, v2.length)
            while (v1.length < len) {
                v1.push('0')
            }
            while (v2.length < len) {
                v2.push('0')
            }
            for (let i = 0; i < len; i++) {
                const num1 = parseInt(v1[i])
                const num2 = parseInt(v2[i])
                if (num1 > num2) {
                    return 1
                } else if (num1 < num2) {
                    return -1
                }
            }
            return 0
        }
    },
    pageLifetimes: {
        show() {
            if (wx.onNeedPrivacyAuthorization) {
                wx.onNeedPrivacyAuthorization(resolve => {
                    this.resolvePrivacyAuthorization = resolve
                    this.setData({
                        show: true,
                        innerShow: true
                    })
                })
            }
        }
    }
})
