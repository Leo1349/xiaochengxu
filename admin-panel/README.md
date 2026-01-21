# 后端管理平台部署指南

本文档说明如何在新电脑上部署后端管理平台 (`admin-panel`)。

---

## 系统要求

- **Node.js**: v18+ (推荐 v20)
- **npm**: v9+
- **Git**: 用于克隆代码

---

## 快速部署步骤

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd xiaochengxu
```

### 2. 安装依赖

```bash
cd admin-panel
npm install
```

> 如果 npm 下载慢，可使用淘宝镜像：
>
> ```bash
> npm install --registry https://registry.npmmirror.com
> ```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 <http://localhost:5173/>

---

## 登录账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 超级管理员 |
| operator | operator123 | 普通管理员 |

---

## 项目结构

```
admin-panel/
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx    # 后台布局组件
│   ├── pages/
│   │   ├── Login.jsx          # 登录页
│   │   ├── Dashboard.jsx      # 仪表盘
│   │   ├── Teachers.jsx       # 老师管理
│   │   ├── Banners.jsx        # 轮播图管理
│   │   ├── Orders.jsx         # 订单管理
│   │   ├── Users.jsx          # 用户管理
│   │   └── Feedbacks.jsx      # 反馈管理
│   ├── services/
│   │   └── api.js             # API 服务层
│   ├── config/
│   │   └── cloud.js           # 云开发配置
│   ├── App.jsx                # 主应用
│   ├── main.jsx               # 入口文件
│   └── index.css              # 全局样式
├── package.json
└── vite.config.js
```

---

## 依赖说明

| 依赖 | 版本 | 用途 |
|------|------|------|
| react | ^18.x | 前端框架 |
| react-dom | ^18.x | React DOM 渲染 |
| react-router-dom | ^6.x | 路由管理 |
| antd | ^5.x | UI 组件库 |
| @ant-design/icons | ^5.x | 图标库 |
| axios | ^1.x | HTTP 请求 |
| vite | ^5.x | 构建工具 |

---

## 切换到生产模式

当云函数部署成功后，修改 `src/services/api.js`：

```javascript
// 将开发模式改为 false
const DEV_MODE = false

// 配置您的云环境地址
const CLOUD_CONFIG = {
    baseURL: 'https://your-env-id.service.tcloudbase.com',
    functionName: 'adminFunctions'
}
```

---

## 构建生产版本

```bash
npm run build
```

构建结果在 `dist/` 目录，可部署到任意静态服务器。

---

## 常见问题

### Q: npm install 失败？

使用淘宝镜像：`npm install --registry https://registry.npmmirror.com`

### Q: 启动后页面空白？

检查 Node.js 版本是否 >= 18

### Q: 登录后看不到数据？

当前是开发模式，显示的是模拟数据。切换到生产模式需要先部署云函数。
