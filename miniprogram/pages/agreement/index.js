// pages/agreement/index.js
Page({
    data: {
        title: '',
        updateTime: '2025年10月20日',
        content: []
    },

    onLoad: function (options) {
        const type = options.type
        if (type === 'user') {
            this.initUserAgreement()
        } else if (type === 'privacy') {
            this.initPrivacyPolicy()
        }
    },

    initUserAgreement: function () {
        this.setData({
            title: '智伴优程用户服务协议',
            content: [
                {
                    title: '一、总则',
                    paragraphs: [
                        '欢迎您使用智伴优程（以下简称“本平台”）。本协议是您与智伴优程平台之间关于使用本平台服务所订立的协议。',
                        '请您在注册成成为本平台用户前，务必仔细阅读本协议。一旦您注册成为用户，即表示您已接受本协议的所有条款。'
                    ]
                },
                {
                    title: '二、服务内容',
                    paragraphs: [
                        '本平台致力于为家长提供专业的陪伴师信息服务，包括但不限于学科辅导、兴趣培养、习惯养成和心理疏导等。',
                        '平台作为信息服务提供方，将尽力审核陪伴师信息的真实性，但不对服务过程中的所有风险承担责任。'
                    ]
                },
                {
                    title: '三、用户权利与义务',
                    paragraphs: [
                        '用户有权在平台上浏览信息、预约服务、发布评价等。',
                        '用户应保证注册信息的真实性，并妥善保管账号密码。',
                        '用户在使用服务过程中，应遵守法律法规，尊重陪伴师，按时支付服务费用。'
                    ]
                },
                {
                    title: '四、免责声明',
                    paragraphs: [
                        '因不可抗力（如网络故障、自然灾害等）导致的服务中断，平台不承担责任。',
                        '平台对用户自行发布的言论和行为不承担法律责任。'
                    ]
                }
            ]
        })
        wx.setNavigationBarTitle({ title: '用户服务协议' })
    },

    initPrivacyPolicy: function () {
        this.setData({
            title: '智伴优程隐私保护政策',
            content: [
                {
                    title: '一、前言',
                    paragraphs: [
                        '智伴优程（以下简称“我们”）非常重视您的隐私。本政策旨在说明我们在您使用服务时如何收集、使用、存储和保护您的个人信息。'
                    ]
                },
                {
                    title: '二、信息的收集',
                    paragraphs: [
                        '我们可能会收集您的姓名、电话号码、孩子的基本信息（如年龄、年级、就读学校等），以便为您提供更精准的匹配服务。',
                        '我们在您使用微信一键登录时，会获取您的微信公开信息（昵称、头像等）。'
                    ]
                },
                {
                    title: '三、信息的使用',
                    paragraphs: [
                        '您的信息将仅用于平台内的服务匹配、订单通知和客户服务。',
                        '除非法律规定或经您授权，我们不会向第三方公开或透露您的个人隐私信息。'
                    ]
                },
                {
                    title: '四、信息的保护',
                    paragraphs: [
                        '我们采用严格的数据安全措施，防止用户信息泄露、丢失或被滥用。',
                        '只有经过授权的工作人员才能访问您的个人信息。'
                    ]
                },
                {
                    title: '五、未成年人保护',
                    paragraphs: [
                        '鉴于本平台的特殊性，我们会格外注意保护未成年人的信息安全。任何关于孩子信息的收集均需征得监护人的同意。'
                    ]
                }
            ]
        })
        wx.setNavigationBarTitle({ title: '隐私保护政策' })
    },

    goBack: function () {
        wx.navigateBack()
    }
})
