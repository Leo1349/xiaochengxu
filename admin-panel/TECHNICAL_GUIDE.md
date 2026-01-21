# 智伴优程管理后台 - 技术实现文档

本文档详细说明了管理后台系统的架构设计、技术选型和实现细节。

---

## 📋 目录

1. [系统概述](#系统概述)
2. [技术架构](#技术架构)
3. [技术栈](#技术栈)
4. [项目结构](#项目结构)
5. [核心功能实现](#核心功能实现)
6. [数据流设计](#数据流设计)
7. [云函数设计](#云函数设计)
8. [部署说明](#部署说明)

---

## 系统概述

管理后台是一个基于 **React + Vite** 构建的单页应用（SPA），用于管理小程序的后台数据，包括：

- 👨‍🏫 老师管理（增删改查、推荐设置）
- 🖼️ 轮播图管理（首页 Banner 配置）
- 📦 订单管理（状态跟踪、订单处理）
- 👥 用户管理（用户列表、信息查看）
- 💬 反馈管理（用户反馈处理）
- 📊 数据统计（仪表盘数据概览）

---

## 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         管理后台前端                              │
│                     (React + Vite + Ant Design)                  │
│                       http://localhost:5173                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP 请求
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         代理服务层                                │
│                     (Express + Node.js)                          │
│                       http://localhost:3001                      │
│                                                                  │
│  功能：                                                          │
│  1. 获取并缓存微信 access_token                                   │
│  2. 代理转发云函数调用请求                                         │
│  3. 处理 CORS 跨域                                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS 请求
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      微信云开发平台                               │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   云函数        │    │   云数据库       │                     │
│  │ adminFunctions  │───▶│   (MongoDB)     │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                              │                                   │
│                              ▼                                   │
│                    ┌─────────────────┐                          │
│                    │  数据集合        │                          │
│                    │  - teachers     │                          │
│                    │  - orders       │                          │
│                    │  - users        │                          │
│                    │  - banners      │                          │
│                    │  - feedbacks    │                          │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.x | UI 框架，函数组件 + Hooks |
| React Router | ^6.x | 客户端路由管理 |
| Ant Design | ^5.x | UI 组件库（表格、表单、弹窗等） |
| Axios | ^1.x | HTTP 请求库 |
| Vite | ^5.x | 构建工具，开发服务器 |

### 代理服务

| 技术 | 用途 |
|------|------|
| Express | Web 服务框架 |
| Axios | 调用微信 API |
| dotenv | 环境变量管理 |
| cors | 跨域支持 |

### 云端

| 服务 | 用途 |
|------|------|
| 微信云开发 | 云函数运行环境 |
| 云数据库 | MongoDB 数据存储 |
| 云函数 | 无服务器后端逻辑 |

---

## 项目结构

```
admin-panel/
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx     # 后台布局组件（侧边栏 + 顶部栏）
│   │
│   ├── pages/
│   │   ├── Login.jsx           # 登录页面
│   │   ├── Dashboard.jsx       # 仪表盘（数据统计卡片）
│   │   ├── Teachers.jsx        # 老师管理（CRUD 表格）
│   │   ├── Banners.jsx         # 轮播图管理
│   │   ├── Orders.jsx          # 订单管理
│   │   ├── Users.jsx           # 用户管理
│   │   └── Feedbacks.jsx       # 反馈管理
│   │
│   ├── services/
│   │   └── api.js              # API 服务层（统一接口调用）
│   │
│   ├── config/
│   │   └── cloud.js            # 云开发配置
│   │
│   ├── App.jsx                 # 主应用（路由配置）
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局样式
│
├── server/                      # 代理服务
│   ├── index.js                # 代理服务主文件
│   ├── package.json            # 依赖配置
│   ├── .env                    # 环境变量（敏感信息）
│   └── .env.example            # 环境变量模板
│
├── package.json
└── vite.config.js
```

---

## 核心功能实现

### 1. 登录认证

```jsx
// Login.jsx - 登录逻辑
const handleLogin = async () => {
    const res = await api.login(username, password)
    if (res.success) {
        localStorage.setItem('adminToken', res.data.token)
        localStorage.setItem('adminUser', JSON.stringify(res.data))
        navigate('/dashboard')
    }
}
```

登录验证在云函数中进行，支持两个预设账号：

- `admin` / `admin123` - 超级管理员
- `operator` / `operator123` - 普通管理员

### 2. 布局组件

```jsx
// AdminLayout.jsx - 使用 Ant Design Layout
<Layout>
    <Sider>
        <Menu items={menuItems} />  {/* 侧边导航 */}
    </Sider>
    <Layout>
        <Header>{/* 顶部栏：用户信息、退出登录 */}</Header>
        <Content>
            <Outlet />  {/* 子路由渲染区域 */}
        </Content>
    </Layout>
</Layout>
```

### 3. 数据表格管理

以老师管理为例：

```jsx
// Teachers.jsx
function Teachers() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    
    // 获取列表
    const fetchData = async () => {
        setLoading(true)
        const res = await api.getTeachers({ page, pageSize, keyword })
        if (res.success) {
            setData(res.data.list)
            setTotal(res.data.total)
        }
        setLoading(false)
    }
    
    // 表格列配置
    const columns = [
        { title: '姓名', dataIndex: 'name' },
        { title: '价格', dataIndex: 'price', render: v => `¥${v}/小时` },
        { title: '操作', render: (_, record) => (
            <>
                <Button onClick={() => handleEdit(record)}>编辑</Button>
                <Button onClick={() => handleDelete(record._id)}>删除</Button>
            </>
        )}
    ]
    
    return (
        <Table 
            dataSource={data} 
            columns={columns}
            loading={loading}
            pagination={{ total, current: page, pageSize }}
        />
    )
}
```

### 4. API 服务层设计

```javascript
// api.js - 三种模式支持
const DEV_MODE = false      // 开发模式（模拟数据）
const PROXY_MODE = true     // 代理模式（通过本地代理调用云函数）

async function callCloudFunction(type, data = {}) {
    if (DEV_MODE) {
        return mockResponse(type, data)  // 返回模拟数据
    }
    
    if (PROXY_MODE) {
        // 通过代理服务调用
        const response = await axios.post('http://localhost:3001/api/cloud', { type, data })
        return response.data
    }
    
    // 生产模式：直接调用云函数 HTTP 触发器
    // ...
}

// 导出 API 接口
export const api = {
    login: (username, password) => callCloudFunction('login', { username, password }),
    getStats: () => callCloudFunction('getStats'),
    getTeachers: (params) => callCloudFunction('getTeachers', params),
    addTeacher: (data) => callCloudFunction('addTeacher', data),
    // ...更多接口
}
```

---

## 数据流设计

### 请求流程

```
1. 用户操作 → 触发事件（如点击按钮）
2. 调用 api.xxx() 方法
3. callCloudFunction() 封装请求
4. axios.post() 发送到代理服务
5. 代理服务获取 access_token
6. 代理服务调用微信云函数 API
7. 云函数处理业务逻辑
8. 云函数访问云数据库
9. 返回结果逐层回传
10. 更新 React 状态 → UI 重新渲染
```

### 状态管理

采用 React 内置 Hooks 管理状态：

| Hook | 用途 |
|------|------|
| `useState` | 组件内部状态 |
| `useEffect` | 副作用处理（数据获取） |
| `useNavigate` | 路由跳转 |

---

## 云函数设计

### adminFunctions

单一云函数处理所有管理后台请求，通过 `type` 参数路由：

```javascript
// cloudfunctions/adminFunctions/index.js
exports.main = async (event, context) => {
    const { type, data } = event
    
    switch (type) {
        case 'login':
            return handleLogin(data)
        case 'getStats':
            return await handleGetStats()
        case 'getTeachers':
            return await handleGetTeachers(data)
        // ... 其他 case
    }
}
```

### 数据库操作示例

```javascript
// 分页查询
async function handleGetTeachers(data) {
    const { page = 1, pageSize = 20, keyword = '' } = data
    const skip = (page - 1) * pageSize
    
    let query = {}
    if (keyword) {
        query.name = db.RegExp({ regexp: keyword, options: 'i' })
    }
    
    const [countRes, listRes] = await Promise.all([
        db.collection('teachers').where(query).count(),
        db.collection('teachers')
            .where(query)
            .orderBy('createTime', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()
    ])
    
    return {
        success: true,
        data: {
            list: listRes.data,
            total: countRes.total,
            page,
            pageSize
        }
    }
}
```

---

## 部署说明

### 本地开发

```bash
# 1. 安装依赖
cd admin-panel
npm install

cd server
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 AppSecret 和云环境 ID

# 3. 启动代理服务
npm start

# 4. 启动前端（新终端）
cd ..
npm run dev

# 5. 访问 http://localhost:5173
```

### 生产部署

1. 构建前端：

   ```bash
   npm run build
   ```

2. 将 `dist/` 目录部署到静态服务器

3. 将代理服务部署到云服务器或使用云托管

4. 在微信开发者工具中部署 `adminFunctions` 云函数

---

## 安全注意事项

| 项目 | 说明 |
|------|------|
| AppSecret | 敏感信息，仅存储在服务端 `.env`，已加入 `.gitignore` |
| access_token | 由代理服务自动管理，前端不可见 |
| 登录验证 | 预设账号存储在云函数中，生产环境建议改用数据库 |
| CORS | 代理服务配置了跨域支持，生产环境应限制来源域名 |

---

## 扩展建议

1. **权限控制** - 根据用户角色限制可访问的功能模块
2. **操作日志** - 记录管理员的增删改操作
3. **数据验证** - 前后端都进行数据格式校验
4. **图片上传** - 集成云存储实现图片上传功能
5. **数据导出** - 支持导出 Excel 报表

---

*最后更新：2026-01-22*
