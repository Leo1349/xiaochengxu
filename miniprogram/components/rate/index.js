// components/rate/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前评分值
    value: {
      type: Number,
      value: 0
    },
    
    // 是否只读
    readonly: {
      type: Boolean,
      value: false
    },
    
    // 星星总数
    count: {
      type: Number,
      value: 5
    },
    
    // 星星大小
    size: {
      type: Number,
      value: 40
    },
    
    // 星星间距
    gutter: {
      type: Number,
      value: 8
    },
    
    // 选中颜色
    activeColor: {
      type: String,
      value: '#FFD700'
    },
    
    // 未选中颜色
    inactiveColor: {
      type: String,
      value: '#DDDDDD'
    },
    
    // 是否允许半星
    allowHalf: {
      type: Boolean,
      value: false
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    
    // 是否可以滑动选择
    touchable: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    stars: [],
    innerValue: 0
  },

  /**
   * 数据监听器
   */
  observers: {
    'value, count': function(value, count) {
      this.initStars(value, count)
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      this.initStars(this.properties.value, this.properties.count)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化星星
    initStars: function(value, count) {
      const stars = []
      for (let i = 1; i <= count; i++) {
        let status = 'empty'
        if (i <= Math.floor(value)) {
          status = 'full'
        } else if (this.properties.allowHalf && i - 0.5 <= value) {
          status = 'half'
        }
        stars.push({
          index: i,
          status: status
        })
      }
      
      this.setData({
        stars: stars,
        innerValue: value
      })
    },

    // 点击星星
    onStarTap: function(e) {
      if (this.properties.readonly || this.properties.disabled) {
        return
      }
      
      const index = e.currentTarget.dataset.index
      const value = index
      
      this.updateValue(value)
    },

    // 半星点击
    onHalfTap: function(e) {
      if (this.properties.readonly || this.properties.disabled || !this.properties.allowHalf) {
        return
      }
      
      const index = e.currentTarget.dataset.index
      const value = index - 0.5
      
      this.updateValue(value)
    },

    // 更新值
    updateValue: function(value) {
      if (value === this.data.innerValue) {
        // 再次点击同一个评分，取消选中
        value = 0
      }
      
      this.setData({
        innerValue: value
      })
      
      this.initStars(value, this.properties.count)
      
      // 触发事件
      this.triggerEvent('change', { value: value })
    },

    // 触摸移动
    onTouchMove: function(e) {
      if (this.properties.readonly || this.properties.disabled || !this.properties.touchable) {
        return
      }
      
      const touch = e.touches[0]
      const query = this.createSelectorQuery()
      
      query.select('.rate-container').boundingClientRect((rect) => {
        if (!rect) return
        
        const x = touch.clientX - rect.left
        const starWidth = this.properties.size + this.properties.gutter
        let value = Math.ceil(x / starWidth)
        
        if (this.properties.allowHalf) {
          const halfWidth = starWidth / 2
          const remainder = x % starWidth
          if (remainder < halfWidth) {
            value = value - 0.5
          }
        }
        
        value = Math.max(0, Math.min(value, this.properties.count))
        
        if (value !== this.data.innerValue) {
          this.setData({
            innerValue: value
          })
          this.initStars(value, this.properties.count)
          this.triggerEvent('change', { value: value })
        }
      }).exec()
    }
  }
})
