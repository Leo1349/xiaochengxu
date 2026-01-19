# 智伴优程（微信小程序）任务清单与执行计划

> 日期：2026-01-05
>
> 目标：让项目在微信开发者工具中可稳定运行（首页/老师详情/订单列表等），并且云函数 + 云数据库数据链路可用。

## 现状快照（基于仓库代码）

- 小程序已启用云能力：`miniprogram/app.js` 调用了 `wx.cloud.init()`，但未指定 `env`（默认使用第一个云环境）。
- 首页数据链路：`miniprogram/pages/index/index.js` 调用云函数 `getHomeData`，从云数据库读取 `banners/teachers`。
- 已提供初始化数据能力：云函数 `seedDB` 会创建/填充 `teachers`、`banners` 两个集合（仅当集合为空时写入）。
- 注意：`utils/api.js` 走外部 HTTP API（`https://api.zhibanjia.com`），但当前核心页面主要走云函数；可后续统一数据源策略。

---

## A. 需要你手动完成的任务（在微信开发者工具 / 云开发控制台）

### A1. 创建/选择云开发环境（必须）

- 在微信开发者工具开启云开发，创建一个环境（拿到环境 ID）。
- 建议把环境 ID 填到 `miniprogram/app.js` 的 `wx.cloud.init({ env: 'xxx' })`（可选，但利于多环境切换）。

### A2. 部署云函数（必须）

- 至少需要部署：`getHomeData`、`getTeacherDetail`、`getOrderList`、`createOrder`、`createUser`、`login`、`seedDB`。
- 部署方式：微信开发者工具 -> 云开发 -> 云函数 -> 右键上传部署（或使用你已有脚本，但当前仓库是 `.sh`，Windows 下建议用 PowerShell）。

### A3. 初始化云数据库（必须）

- 在云函数部署后，手动运行一次 `seedDB`（云开发控制台 -> 云函数 -> 运行）。
- 预期效果：云数据库出现集合 `teachers`、`banners` 且写入了示例数据。

### A4. 配置数据库权限（推荐）

- 开发阶段可临时放宽（仅用于开发调试）。
- 上线前务必收紧：至少限制写入只能通过云函数（避免前端直写）。

### A5. 资源检查（必须）

- 确认 TabBar 图标存在：`miniprogram/images/icons/*`（仓库已包含）。
- 确认首页轮播与头像图片存在：`miniprogram/images/ai_example*.png`、`miniprogram/images/cloud_dev.png`、`miniprogram/images/avatar.png`（仓库已包含）。

---

## B. 我会在代码中直接完成的任务（本计划将自动执行）

### B1. 修复 `seedDB` 里 Banner 图片路径（已执行）

- 让初始化后的 `banners` 指向仓库实际存在的图片，避免首页轮播图 404。

### B2. 补一个 Windows 下的一键安装云函数依赖脚本（将执行）

- 新增 `tools/install-cloudfunctions-deps.ps1`：遍历 `cloudfunctions/*` 执行 `npm install`。

### B3. 执行依赖安装与基础校验（将执行）

- 运行脚本，确保云函数依赖（尤其 `wx-server-sdk`）本地就绪。

### B4. 自动提交前的 Git 配置（已补齐脚本）

- 新增脚本：`tools/setup-git-config.ps1`（默认写入本仓库的本地 git config，不影响全局）。
- 用法示例（推荐，本地 repo 级别）：
 	- `powershell -NoProfile -ExecutionPolicy Bypass -File tools/setup-git-config.ps1 -Name "你的名字" -Email "you@example.com"`
- `tools/git-auto-commit.ps1` 现在会在缺少 `user.name/email` 时直接阻止提交并提示如何配置。

---

## C. 建议的验收清单（你在开发者工具里验证）

- 首页：轮播图能显示，推荐陪伴师列表能加载（来自云函数 `getHomeData`）。
- 陪伴师详情：进入详情页能加载数据（来自 `getTeacherDetail`）。
- 订单列表：能打开并展示列表（来自 `getOrderList`，若未初始化订单数据可先显示空态）。
- 登录页：能正常获取 openid（若页面走 `login` 云函数）。
