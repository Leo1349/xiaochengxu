# 智伴家 - 微信小程序

## 项目介绍

智伴家是一个家庭教育陪伴服务平台，连接家长、陪伴师和平台三方，为孩子提供个性化的学习辅导和成长陪伴服务。

## 功能模块

### 1. 首页模块
- 轮播 Banner 展示
- 服务分类导航（作业辅导、学科辅导、兴趣培养、全科陪伴）
- 推荐陪伴师列表
- 成功案例展示
- 平台介绍

### 2. 服务大厅
- 分类筛选
- 智能排序（综合、评分、价格）
- 筛选面板（性别、年龄、学历、价格区间）
- 陪伴师列表展示

### 3. 消息中心
- 系统通知
- 订单消息
- 群聊消息列表

### 4. 个人中心
- 用户信息展示
- 角色切换（家长/陪伴师）
- 常用功能入口
  - 我的订单
  - 孩子信息（家长）
  - 我的简历（陪伴师）
  - 返现记录
  - 设置

### 5. 订单流程
- 订单确认页
- 订单列表
- 订单详情
- 评价功能

### 6. 陪伴师模块
- 陪伴师详情
- 服务项目
- 用户评价

### 7. 案例模块
- 案例列表
- 案例详情

### 8. 其他功能
- 搜索
- 三方群聊
- 客服中心
- 意见反馈
- 设置
- 返现提现

## 技术栈

- 微信小程序原生框架
- 微信云开发（预留接口）
- WXML/WXSS/JS

## 目录结构

```
miniprogram/
├── app.js                 # 小程序入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── components/            # 自定义组件
│   ├── rate/              # 星级评价组件
│   ├── tabbar/            # 自定义 TabBar
│   └── cloudTipModal/     # 云开发提示
├── images/                # 图片资源
│   └── icons/             # 图标文件
├── pages/                 # 页面
│   ├── index/             # 首页
│   ├── service/           # 服务大厅
│   ├── message/           # 消息中心
│   ├── mine/              # 个人中心
│   ├── login/             # 登录
│   ├── register/          # 注册
│   ├── teacher-detail/    # 陪伴师详情
│   ├── order-confirm/     # 订单确认
│   ├── order-list/        # 订单列表
│   ├── order-detail/      # 订单详情
│   ├── child-info/        # 孩子信息管理
│   ├── teacher-resume/    # 陪伴师简历
│   ├── case-list/         # 案例列表
│   ├── case-detail/       # 案例详情
│   ├── chat/              # 三方群聊
│   ├── search/            # 搜索
│   ├── customer-service/  # 客服中心
│   ├── feedback/          # 意见反馈
│   ├── settings/          # 设置
│   └── rebate/            # 返现记录
└── utils/                 # 工具函数
    ├── util.js            # 通用工具
    └── api.js             # API 封装
```

## 注意事项

1. **图标资源**：项目使用的图标需要放置在 `/images/icons/` 目录下，包括：
   - 底部导航图标：home.png, home-active.png, service.png, service-active.png, message.png, message-active.png, mine.png, mine-active.png
   - 功能图标：search.png, arrow-right.png, star.png, filter.png 等

2. **数据存储**：当前版本使用本地存储（wx.setStorageSync）模拟数据，正式版本需要对接云数据库或后端 API。

3. **支付功能**：根据需求，支付功能已排除，订单流程中不包含支付环节。

4. **云开发**：已预留云开发接口，可在 `cloudfunctions/` 目录中添加云函数。

## 开发说明

1. 使用微信开发者工具打开项目
2. 配置 AppID
3. 开启云开发（如需要）
4. 添加所需图标资源
5. 编译运行

## 版本记录

- v1.0.0: 初始版本，完成所有基础功能页面
