# 云开发 HTTP API 配置指南

## 一、开启云开发 HTTP API

1. 登录 [微信云开发控制台](https://cloud.weixin.qq.com/)
2. 进入您的云开发环境
3. 点击「设置」→「安全配置」
4. 开启「HTTP API」开关

## 二、配置云函数触发器

为 `adminFunctions` 添加 HTTP 触发器：

1. 在云开发控制台选择「云函数」
2. 找到 `adminFunctions` 云函数
3. 点击「触发器」标签
4. 添加 HTTP 触发器

触发后会生成类似如下的访问地址：

```
https://{env-id}.service.tcloudbase.com/adminFunctions
```

## 三、更新前端配置

编辑 `admin-panel/src/services/api.js`：

```javascript
// 1. 将 DEV_MODE 改为 false
const DEV_MODE = false

// 2. 配置云函数地址
const CLOUD_CONFIG = {
    baseURL: 'https://您的环境ID.service.tcloudbase.com',
    functionName: 'adminFunctions'
}
```

## 四、部署云函数

在微信开发者工具中：

1. 右键点击 `cloudfunctions/adminFunctions`
2. 选择「上传并部署：云端安装依赖」

## 五、测试

1. 启动管理后台：`cd admin-panel && npm run dev`
2. 访问 <http://localhost:5173/>
3. 登录后测试各项功能

> **注意**：首次使用真实 API 时，请确保云数据库中已有相应的集合（teachers、banners、orders、users、feedbacks）。可以通过调用 `seedDB` 云函数初始化测试数据。
