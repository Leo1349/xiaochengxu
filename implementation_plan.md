# 小程序上线详细计划 (Implementation Plan)

## 目标

完成小程序 "智伴家" 的上线准备工作，确保符合微信审核规范，并顺利发布。同时开发手机端管理后台，便于运营查看订单。

## ⚠️ 用户审核 (User Review Required)
>
> [!IMPORTANT]
> **隐私协议 (Privacy Protocol)**: 微信平台要求极为严格。必须在小程序后台设置好《用户隐私保护指引》，并且在小程序端实现 **隐私授权弹窗**。
> **管理员密码**: 管理后台将使用简单的密码保护，请在上线前确定一个访问密码。

## 拟定修改 (Proposed Changes)

### 1. 新增隐私授权组件

为了应对微信的隐私规范，我们需要添加一个通用的隐私弹窗组件。

#### [NEW] `components/privacy-popup/`

- `index.wxml`: 弹窗 UI，包含“同意”和“拒绝”按钮。
- `index.js`: 使用 `wx.getPrivacySetting` 和 `wx.onNeedPrivacyAuthorization` 监听隐私授权需求。

### 2. 开发手机端管理后台 (Admin Panel)

#### [NEW] Cloud Function: `adminFunctions`

- **目的**: 专门处理管理员相关的逻辑，避免污染普通用户接口。
- **功能**:
  - `login`: 验证管理员密码 (配置在云环境变量中)。
  - `getOrderList`: 获取所有用户的订单数据 (支持分页)。
  - `updateOrderStatus`: 修改订单状态 (如: 确认接单、已完成)。

#### [NEW] `pages/admin/login/index`

- **界面**: 简单的输入框，输入访问密码。
- **逻辑**: 调用 `adminFunctions/login` 验证。验证通过后缓存 token 或标记，跳转到列表页。

#### [NEW] `pages/admin/order-list/index`

- **界面**:
  - 顶部 Tab: 全部 / 待接单 / 进行中 / 已完成
  - 列表项: 显示订单号、客户姓名、预约时间、金额、状态。
  - 操作: 点击进入详情，或直接点击“接单”按钮。

#### [NEW] `pages/admin/order-detail/index`

- **界面**: 类似用户端的订单详情，但增加“管理员操作区” (修改状态、添加备注)。

### 3. 全局配置

#### [MODIFY] `app.json`

- 引入隐私组件。
- 注册新的管理员页面路由。

## 验证计划 (Verification Plan)

1. **隐私弹窗**: 清除缓存后测试是否弹出。
2. **管理后台**:
   - 访问 `/pages/admin/login/index`。
   - 输入错误密码 -> 提示错误。
   - 输入正确密码 -> 进入列表页。
   - 列表页是否能看到刚才测试提交的订单。
