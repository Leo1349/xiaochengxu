// components/tabbar/index.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前选中的tab索引
    current: {
      type: Number,
      value: 0
    },
    
    // 当前角色
    role: {
      type: String,
      value: 'parent' // parent 或 teacher
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 家长端TabBar配置
    parentTabs: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/images/icons/home.png',
        selectedIconPath: '/images/icons/home-active.png'
      },
      {
        pagePath: '/pages/service/index',
        text: '服务',
        iconPath: '/images/icons/service.png',
        selectedIconPath: '/images/icons/service-active.png'
      },
      {
        pagePath: '/pages/message/index',
        text: '消息',
        iconPath: '/images/icons/message.png',
        selectedIconPath: '/images/icons/message-active.png',
        showBadge: false,
        badgeCount: 0
      },
      {
        pagePath: '/pages/mine/index',
        text: '我的',
        iconPath: '/images/icons/mine.png',
        selectedIconPath: '/images/icons/mine-active.png'
      }
    ],
    
    // 陪伴师端TabBar配置
    teacherTabs: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/images/icons/home.png',
        selectedIconPath: '/images/icons/home-active.png'
      },
      {
        pagePath: '/pages/order-list/index',
        text: '订单',
        iconPath: '/images/icons/order.png',
        selectedIconPath: '/images/icons/order-active.png',
        showBadge: false,
        badgeCount: 0
      },
      {
        pagePath: '/pages/message/index',
        text: '消息',
        iconPath: '/images/icons/message.png',
        selectedIconPath: '/images/icons/message-active.png',
        showBadge: false,
        badgeCount: 0
      },
      {
        pagePath: '/pages/mine/index',
        text: '我的',
        iconPath: '/images/icons/mine.png',
        selectedIconPath: '/images/icons/mine-active.png'
      }
    ],
    
    // 当前显示的tabs
    tabs: [],
    
    // 主题色
    activeColor: '#4A90E2',
    inactiveColor: '#999999'
  },

  /**
   * 数据监听器
   */
  observers: {
    'role': function(role) {
      this.updateTabs(role)
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      this.updateTabs(this.properties.role)
      this.getUnreadCount()
    }
  },

  /**
   * 组件所在页面的生命周期
   */
  pageLifetimes: {
    show: function() {
      this.getUnreadCount()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 更新tabs
    updateTabs: function(role) {
      const tabs = role === 'teacher' ? [...this.data.teacherTabs] : [...this.data.parentTabs]
      this.setData({
        tabs: tabs
      })
    },

    // 获取未读消息数
    getUnreadCount: function() {
      // 模拟获取未读数
      const unreadCount = wx.getStorageSync('unreadCount') || 0
      
      const tabs = this.data.tabs.map(tab => {
        if (tab.text === '消息') {
          tab.showBadge = unreadCount > 0
          tab.badgeCount = unreadCount > 99 ? '99+' : unreadCount
        }
        return tab
      })
      
      this.setData({
        tabs: tabs
      })
    },

    // 点击tab
    onTabTap: function(e) {
      const index = e.currentTarget.dataset.index
      const tab = this.data.tabs[index]
      
      if (index === this.properties.current) {
        // 已经在当前页面，不做跳转
        return
      }
      
      // 切换页面
      wx.switchTab({
        url: tab.pagePath,
        fail: () => {
          // 如果switchTab失败，尝试navigateTo
          wx.navigateTo({
            url: tab.pagePath
          })
        }
      })
      
      // 触发切换事件
      this.triggerEvent('change', {
        index: index,
        pagePath: tab.pagePath
      })
    },

    // 设置未读数
    setBadge: function(tabIndex, count) {
      const tabs = this.data.tabs
      if (tabs[tabIndex]) {
        tabs[tabIndex].showBadge = count > 0
        tabs[tabIndex].badgeCount = count > 99 ? '99+' : count
        this.setData({
          tabs: tabs
        })
      }
    },

    // 清除未读数
    clearBadge: function(tabIndex) {
      this.setBadge(tabIndex, 0)
    }
  }
})
