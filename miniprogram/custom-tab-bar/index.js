/**
 * 自定义TabBar组件
 * 实现毛玻璃效果的底部导航栏
 */
Component({
    data: {
        selected: 0,
        color: '#A8A5A2',
        selectedColor: '#FF8066',
        list: [
            {
                pagePath: '/pages/index/index',
                text: '首页',
                iconPath: '/images/icons_v3/home_v3.png',
                selectedIconPath: '/images/icons_v3/home_active_v3.png'
            },
            {
                pagePath: '/pages/service/index',
                text: '服务',
                iconPath: '/images/icons_v3/service_v3.png',
                selectedIconPath: '/images/icons_v3/service_active_v3.png'
            },
            {
                pagePath: '/pages/message/index',
                text: '消息',
                iconPath: '/images/icons_v3/message_v3.png',
                selectedIconPath: '/images/icons_v3/message_active_v3.png',
                showDot: false // 消息未读红点
            },
            {
                pagePath: '/pages/mine/index',
                text: '我的',
                iconPath: '/images/icons_v3/mine_v3.png',
                selectedIconPath: '/images/icons_v3/mine_active_v3.png'
            }
        ]
    },

    methods: {
        /**
         * 切换Tab页
         */
        switchTab(e) {
            const data = e.currentTarget.dataset;
            const url = data.path;

            wx.switchTab({ url });
        },

        /**
         * 设置消息未读红点显示状态
         * @param {boolean} show 是否显示红点
         */
        setMessageDot(show) {
            const list = this.data.list;
            // 消息Tab的索引为2
            list[2].showDot = show;
            this.setData({ list });
        }
    }
});
