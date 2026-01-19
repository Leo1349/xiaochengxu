# 智伴优程小程序 UI 重构实施方案

> **日期**：2026-01-12  
> **目标**：采用 TDesign 设计风格对小程序所有页面进行 UI/样式重构

---

## 背景说明

当前小程序共有 22 个页面，现有样式较为基础。需要按照 TDesign（腾讯开源设计系统）的设计规范进行全面升级，使界面更加简洁、专业、现代。

### TDesign 设计特点

- 清晰的视觉层次
- 简洁的交互设计
- 统一的组件规范
- 专业的配色方案

### 设计规格

- **屏幕适配**：模拟 iPhone 15 Pro (393×852px)
- **圆角规范**：遵循 TDesign 圆角体系 (4px/8px/12px/16px)
- **主色调**：TDesign 企业蓝 `#0052D9`

---

## 提议的修改

### 第一阶段：设计系统基础

#### [MODIFY] [app.wxss](file:///e:/Users/Administrator/Desktop/xiaochengxu/miniprogram/app.wxss)

重构全局样式，建立 TDesign 风格的设计令牌：

```css
/* TDesign 设计令牌 */
/* 主题色 */
--td-brand-color: #0052D9;
--td-brand-color-light: #ECF2FE;
--td-brand-color-hover: #0957E3;
--td-brand-color-active: #004BC7;

/* 功能色 */
--td-success-color: #00A870;
--td-warning-color: #ED7B2F;
--td-error-color: #E34D59;

/* 中性色 */
--td-text-color-primary: #181818;
--td-text-color-secondary: #5F5F5F;
--td-text-color-placeholder: #BBBBBB;
--td-bg-color-page: #F5F5F5;
--td-bg-color-container: #FFFFFF;

/* 字体规范 */
--td-font-size-xs: 20rpx;
--td-font-size-s: 24rpx;
--td-font-size-base: 28rpx;
--td-font-size-m: 32rpx;
--td-font-size-l: 36rpx;
--td-font-size-xl: 40rpx;

/* 圆角规范 */
--td-radius-small: 8rpx;
--td-radius-default: 12rpx;
--td-radius-medium: 16rpx;
--td-radius-large: 24rpx;
--td-radius-round: 999rpx;

/* 阴影规范 */
--td-shadow-1: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
--td-shadow-2: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
--td-shadow-3: 0 16rpx 48rpx rgba(0, 0, 0, 0.16);

/* 间距规范 */
--td-spacer-xs: 8rpx;
--td-spacer-s: 16rpx;
--td-spacer-m: 24rpx;
--td-spacer-l: 32rpx;
--td-spacer-xl: 48rpx;
```

---

### 第二阶段：核心页面重构

#### [MODIFY] [index.wxss](file:///e:/Users/Administrator/Desktop/xiaochengxu/miniprogram/pages/index/index.wxss)

- 搜索栏：使用 TDesign 搜索框样式，圆角 `24rpx`，背景色 `#F3F3F3`
- 轮播图：圆角 `16rpx`，添加柔和阴影
- 功能入口：卡片化设计，悬浮效果
- 陪伴师卡片：重新设计信息层级，突出价格和评分

#### [MODIFY] [mine/index.wxss](file:///e:/Users/Administrator/Desktop/xiaochengxu/miniprogram/pages/mine/index.wxss)

- 用户头部：渐变背景改为 TDesign 品牌蓝
- 统计卡片：使用分隔线设计，数字突出
- 菜单列表：右箭头使用 TDesign 图标风格

#### [MODIFY] [teacher-detail/index.wxss](file:///e:/Users/Administrator/Desktop/xiaochengxu/miniprogram/pages/teacher-detail/index.wxss)

- 头部信息：卡片浮层设计
- Tab 切换：下划线指示器，使用 TDesign 样式
- 服务卡片：价格标签突出，预约按钮醒目

#### [MODIFY] [order-list/index.wxss](file:///e:/Users/Administrator/Desktop/xiaochengxu/miniprogram/pages/order-list/index.wxss)

- 状态标签：使用 TDesign 状态色
- 订单卡片：分区明确，操作按钮对齐

---

### 第三阶段及后续

其他页面（登录、注册、订单详情、消息、聊天等）将延续相同的设计规范进行统一重构。

---

## 验证方案

### 视觉验收

1. 在微信开发者工具中选择 iPhone 15 Pro 模拟器
2. 逐页检查各页面的视觉效果
3. 确认颜色、字体、圆角是否符合 TDesign 规范

### 用户测试（手动）

请在以下页面进行视觉检查：

1. **首页**：检查搜索栏、轮播图、功能入口、陪伴师列表是否符合新设计
2. **个人中心**：检查用户信息、统计数据、菜单列表样式
3. **老师详情**：检查 Tab 切换、服务卡片、底部操作栏
4. **订单列表**：检查状态标签、订单卡片样式

---

## 风险与注意事项

> [!WARNING]
> 由于涉及全局样式修改，需要确保：
>
> - 修改后所有页面正常显示
> - 不影响现有功能的正常使用
> - 图片资源与新样式匹配

---

## 实施计划

由于页面数量较多（22个），建议分批次进行：

1. **第一批**：`app.wxss` + 首页 + 个人中心
2. **第二批**：老师详情 + 订单列表 + 订单详情
3. **第三批**：登录/注册 + 搜索 + 消息
4. **第四批**：其余功能页面
5. **第五批**：管理后台页面

每批完成后进行阶段性验收，确保质量。
