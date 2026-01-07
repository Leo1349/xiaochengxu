# 小程序上线任务清单

## 1. 代码与功能准备

- [x] **隐私合规 (Privacy Compliance)**
  - [x] 实现 `PrivacyPopup` 组件 (适配微信最新隐私协议要求)
  - [x] 在 `app.json` 或首页引入隐私弹窗
- [ ] **功能自查**
  - [ ] 检查 `app.js` 中的 `env` 环境ID是否为生产环境
  - [ ] 清理明显的 `console.log` 和调试代码

## 2. 管理后台开发 (Admin Panel)

- [x] **后端逻辑 (Admin Cloud Functions)**
  - [x] 创建 `cloudfunctions/adminFunctions`
  - [x] 实现 `login` (密码验证)
  - [x] 实现 `getOrderList` (查询所有订单)
  - [x] 实现 `updateOrderStatus`
- [/] **管理端界面 (Admin UI)**
  - [x] 创建 `pages/admin/login/index` (登录页)
  - [x] 创建 `pages/admin/order-list/index` (列表页)
  - [x] 创建 `pages/admin/order-detail/index` (详情页)
  - [x] 在 `app.json` 注册页面

## 3. 配置与后台

- [ ] **小程序后台配置**
  - [ ] 配置合法域名
  - [ ] 填写《用户隐私保护指引》
  - [ ] 确认服务类目

## 4. 发布流程

- [ ] 上传代码
- [ ] 提交审核
- [ ] 正式发布
