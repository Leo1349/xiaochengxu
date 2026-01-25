# 智伴优程项目说明书

## 1. 项目简介

**智伴优程** 是一个连接家长、学生与优秀陪伴教师的综合性教育服务平台。项目采用现代化的前后端分离架构，前端包括微信小程序（C端用户使用）和 Web 管理后台（B端运营使用），后端完全依托于微信云开发（WeChat Cloud Base），实现了 Serverless 架构的高效与低成本运维。

### 核心价值

* **资源整合**：汇聚优质陪伴师资源，透明化展示教师资质与过往案例。
* **高效匹配**：通过需求发布与精准搜索，快速连接供需双方。
* **全流程闭环**：覆盖从咨询、下单、支付、服务履约到评价的完整业务流程。

## 2. 技术架构

### 2.1 架构设计

平台采用 **B/S (Browser/Server) + C/S (Client/Server)** 混合模式：

* **Client (用户端)**：微信小程序，运行于微信宿主环境，直接调用云开发 SDK 与云端通信。
* **Browser (管理端)**：React SPA 应用，通过 HTTP API 或 云开发 Web SDK 访问后端数据。
* **Server (服务端)**：Node.js 云函数集群，承载业务逻辑；云数据库（MongoDB 风格）存储业务数据；云存储托管非结构化数据（图片、文件）。

### 2.2 技术栈详情

| 层次 | 模块 | 关键技术 | 版本/说明 |
| :--- | :--- | :--- | :--- |
| **客户端** | **微信小程序** | **Native** | 原生 WXML, WXSS, JS 开发，无第三方多端框架 |
| | UI组件 | **Components** | 自定义组件 (评分, 弹窗等) |
| | 样式库 | **WXSS** | 自定义变量系统，统一主题色 (#4080FF) |
| **管理端** | **Web后台** | **React** | v19.2.0, 函数式组件, Hooks, Context API |
| | 构建工具 | **Vite** | v7.2.4, 极速冷启动与热更新 |
| | UI框架 | **Ant Design** | v6.2.1, 企业级后台设计语言 |
| | 路由管理 | **React Router** | v7.12.0, 声明式路由配置 |
| | HTTP请求 | **Axios** | v1.13.2, 封装统一拦截器 |
| **服务端** | **微信云开发** | **Cloud Functions** | Node.js 环境，Serverless 无服务器计算 |
| | 数据库 | **Cloud DB** | 文档型数据库 (JSON-like), 支持地理位置查询 |
| | 存储 | **Cloud Storage** | 对象存储，自带 CDN 加速 |

## 3. 详细目录结构

### 3.1 根目录

```
e:\xiaochengxu
├── admin-panel/                # [管理后台] React Web 项目源码
├── miniprogram/                # [小程序] 微信小程序原生源码
├── cloudfunctions/             # [云函数] 后端业务逻辑代码
├── project.config.json         # 微信开发者工具项目配置文件
└── README.md                   # 项目简要说明
```

### 3.2 小程序端 (`miniprogram`)

```
miniprogram/
├── components/                 # 公共组件库
│   ├── privacy-popup/          #   隐私协议弹窗 (微信合规必选)
│   └── rate/                   #   星级评分组件 (用于评价显示)
├── images/                     # 静态资源目录
│   ├── icons/                  #   通用图标 (导航、操作图标)
│   └── tabbar/                 #   底部导航栏图标
├── pages/                      # 页面路由 (按业务模块划分)
│   ├── index/                  #   [首页] 轮播图, 金刚区, 推荐列表
│   ├── service/                #   [服务] 服务类型展示
│   ├── publish/                #   [发布] 需求发布表单
│   ├── mine/                   #   [我的] 个人中心, 工具栏
│   ├── teacher-detail/         #   [名师详情] 教师简历, 相册, 评价
│   ├── case-list/              #   [成功案例] 案例列表页
│   ├── case-detail/            #   [案例详情] 案例深度解析
│   ├── order-confirm/          #   [下单] 订单确认与支付
│   ├── order-list/             #   [订单] 订单列表管理
│   ├── order-detail/           #   [订单详情] 订单状态查看
│   ├── chat/                   #   [消息] 即时通讯会话页
│   ├── login/                  #   [登录] 用户授权登录
│   ├── register/               #   [注册] (已废弃/保留)
│   ├── feedback/               #   [反馈] 意见反馈表单
│   ├── settings/               #   [设置] 个人信息修改
│   └── webview/                #   [H5容器] 加载外部链接
├── app.json                    # 全局配置 (路由表, 窗口表现, TabBar)
├── app.wxss                    # 全局样式 (CSS变量, 公共类)
└── app.js                      # 全局逻辑 (生命周期, 全局数据)
```

### 3.3 管理后台 (`admin-panel/src`)

```
admin-panel/src/
├── assets/                     # 静态资源 (Logo, 全局样式图)
├── components/                 # React 公共组件
│   └── AdminLayout.jsx         #   后台主体布局 (侧边栏, 顶栏)
├── pages/                      # 路由页面组件
│   ├── Dashboard.jsx           #   [控制台] 数据概览 (新增用户, 订单统计)
│   ├── Teachers.jsx            #   [名师管理] 教师增删改查, 审核
│   ├── Orders.jsx              #   [订单管理] 订单状态流转, 退款处理
│   ├── Users.jsx               #   [用户管理] 用户列表, 权限查看
│   ├── Banners.jsx             #   [轮播图] 首页轮播图配置
│   ├── Cases.jsx               #   [案例管理] 成功案例发布与编辑
│   ├── Demands.jsx             #   [需求管理] 用户发布需求的后台审核
│   ├── Feedbacks.jsx           #   [反馈管理] 处理用户意见反馈
│   ├── ServiceTypes.jsx        #   [服务管理] 配置服务类型与价格
│   ├── CustomerService.jsx     #   [客服配置] 系统客服参数设置
│   └── Login.jsx               #   [登录页] 管理员鉴权
├── App.jsx                     # 应用入口, 路由配置, 权限校验
├── App.css                     # 应用级样式
└── main.jsx                    # React 渲染入口
```

### 3.4 云函数 (`cloudfunctions`)

```
### 3.4 云函数 (`cloudfunctions`)
**核心与基础**
*   `login/`: [用户登录] 核心鉴权，换取 OpenID，静默注册。
*   `createUser/`: [新建用户] 辅助创建用户记录（通常由 login 自动触发）。
*   `updateUserInfo/`: [更新用户] 修改用户昵称、头像等基础信息。
*   `adminFunctions/`: [**后台聚合**] 管理后台所有业务接口的入口（鉴权、教师/订单/案例/轮播图管理的 CRUD）。

**订单与支付体系**
*   `createOrder/`: [创建订单] 生成订单号，初始化订单状态。
*   `getOrderList/`: [订单列表] 用户查询自己的订单历史。
*   `updateOrder/`: [更新订单] 订单状态流转（支付、完成等）。
*   `cancelOrder/`: [取消订单] 用户主动取消未支付订单。

**内容与展示**
*   `getHomeData/`: [首页数据] 聚合获取轮播图 (Banners) 和推荐教师列表。
*   `getServiceData/`: [服务数据] 获取服务类型列表。
*   `getTeacherDetail/`: [教师详情] 查询单位教师的详细档案及评价。
*   `getCaseList/`: [案例列表] 分页查询成功案例。
*   `getCaseDetail/`: [案例详情] 查询单个成功案例的详细内容。

**功能与互动**
*   `getMessageList/`: [消息列表] 获取 IM 聊天记录。
*   `replyMessage/`: [回复消息] 发送聊天消息。
*   `markMessageRead/`: [消息已读] 更新消息阅读状态。
*   `getFavorites/`: [我的收藏] 获取用户收藏的教师或案例。
*   `submitFeedback/`: [提交反馈] 用户提交意见反馈。
*   `manageChild/`: [孩子管理] 用户添加、编辑学员（孩子）信息。
*   `manageServiceTypes/`: [服务类型管理] (可能用于动态配置服务项)。

**工具与辅助**
*   `seedDB/`: [数据库种子] 初始化数据库测试数据。
*   `initCustomerService/`: [初始化客服] 客服会话相关初始化。
*   `quickstartFunctions/`: [快速开始] (微信云开发模板自带，可移除)。
*   `getUserList/`: [用户列表] (旧接口/备用) 获取用户列表，现主要由 `adminFunctions` 接管。
```

## 4. 功能模块详解

### 4.1 核心业务模块

#### (1) 教师资源系统

* **功能描述**：展示教师的详细履历、教育背景、服务照片及过往评价。
* **关联页面**：`pages/index` (推荐), `pages/teacher-detail` (详情), `admin/Teachers` (管理)。
* **数据流**：小程序 -> `getTeacherDetail` -> `db.collection('teachers')`。

#### (2) 订单交易系统

* **功能描述**：实现“选择服务 -> 预览订单 -> 确认下单 -> 甚至流转”的完整链路。
* **关联页面**：`pages/order-confirm`, `pages/order-list`, `admin/Orders`。
* **逻辑控制**：
  * **创建**：云函数 `createOrder` 生成唯一单号，设定状态 `pending`。
  * **管理**：管理员在后台可修改订单状态（如：已确认、服务中、已完成）。

#### (3) 内容发布系统 (CMS)

* **功能描述**：运营人员通过后台动态配置小程序内容，无需发版。
* **子模块**：
  * **轮播图 (Banners)**：首页顶部广告位管理。
  * **成功案例 (Cases)**：图文并茂的教育成功故事，支持分类检索。
  * **服务类型 (ServiceTypes)**：定义服务的名称、标签、价格区间。

#### (4) 需求撮合系统

* **功能描述**：家长发布个性化需求，后台审核并联系匹配。
* **关联页面**：`pages/publish` (发布), `pages/mine` (我的需求), `admin/Demands` (撮合)。
* **数据结构**：包含学生年级、科目、期望时间、特殊要求等字段。

### 4.2 基础服务模块

#### (1) 用户与鉴权

* 基于微信 OAuth 2.0 体系。
* `login` 云函数自动获取 `OPENID`，若数据库无此用户则自动创建，实现“静默注册”。
* 用户信息存储于 `users` 集合，包含身份角色 (`user`/`admin`)。

#### (2) 文件存储服务

* 所有图片（教师头像、案例封面、轮播图）均托管于微信云存储。
* **自动处理**：管理后台在读取云存储链接 (`cloud://...`) 时，会自动换取临时 HTTP 访问链接 (`http://...`) 以便于在 Web 端展示。

## 5. 启动与开发指南

### 5.1 开发环境要求

* **Node.js**: v18.0 或更高版本 (前端构建需要)。
* **微信开发者工具**: 最新稳定版 (调试小程序与云开发)。
* **Git**: 代码版本控制。

### 5.2 小程序端启动

1. 打开微信开发者工具 -> "导入项目"。
2. 选择项目根目录 `e:\xiaochengxu`。
3. **关键设置**:
    * 小程序根目录 (project.config.json): `miniprogram/`
    * 云函数根目录: `cloudfunctions/`
4. 在工具栏选择正确的 **云环境 ID**。
5. 点击 "编译"，预览效果。

### 5.3 管理后台启动

1. 命令行进入目录：

    ```bash
    cd admin-panel
    ```

2. 安装 npm 依赖：

    ```bash
    npm install
    ```

3. 启动本地开发服务器：

    ```bash
    npm run dev
    ```

4. 访问控制台输出的本地地址 (例如 `http://localhost:5173`)。
    * *默认管理员账号请查看 `cloudfunctions/adminFunctions/index.js` 中的 `ADMINS` 配置。*

### 5.4 云函数部署
>
> **重要**：本地修改云函数代码后，必须部署到云端才能生效。

1. 在微信开发者工具 -> "云开发" -> "云函数" 列表查看当前函数。
2. 在左侧文件树右键点击具体函数文件夹 (如 `login`)。
3. 选择 **"上传并部署：云端安装依赖 (不上传 node_modules)"**。
4. 等待提示 "上传成功"。

## 6. 特殊配置说明

* **图片临时链接刷新**：后台 `adminFunctions` 包含自动将 `cloud://` 协议转换为 `https://` 链接的逻辑，确保 Web 端能正常显示图片。
* **跨域配置 (CORS)**：若自行部署 HTTP API 触发器，需注意 `adminFunctions` 中已配置 `Access-Control-Allow-Origin: *`。
