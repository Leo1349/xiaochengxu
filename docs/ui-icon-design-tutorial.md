# 柔和精致风格 UI 图标设计教程

本教程基于 Google Stitch、Icons8、Dribbble 等专业平台的设计理念，结合智伴家小程序的 Soft/Pastel + Luxury 美学风格编写。

---

## 一、设计理念

### 1.1 柔和精致风格特点

- **色彩柔和**：使用低饱和度粉彩色，避免刺眼的高饱和色
- **线条圆润**：采用圆角、弧形元素，营造温暖亲切感
- **细节精致**：注重每个像素的打磨，追求极致品质感
- **情感传达**：通过视觉传达安全、可信赖、专业的感觉

### 1.2 核心色彩方案

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色（选中态） | 暖杏色 | `#FF8066` |
| 辅助色 | 蜜桃橙 | `#FFAB91` |
| 强调色 | 森林绿 | `#2E7D6B` |
| 默认态 | 暖灰 | `#A8A5A2` |
| 背景填充 | 淡粉 | `#FFE8E4` |

---

## 二、图标设计原则

### 2.1 清晰性 (Clarity)

- 图标应在最小尺寸（24×24px）下保持可识别
- 使用简洁的几何形状，避免过于复杂的细节
- 确保图标含义一目了然

### 2.2 一致性 (Consistency)

保持整套图标风格统一：

- **线条粗细**：统一使用 2px 描边
- **圆角半径**：统一使用 4px 圆角
- **视觉重量**：所有图标占据相同的视觉空间
- **设计风格**：同一套图标使用相同的设计语言

### 2.3 可扩展性 (Scalability)

- 使用矢量格式（SVG）设计，确保无损缩放
- 在不同尺寸下测试（24px、48px、96px）
- 避免过细的线条，防止缩小后模糊

### 2.4 可访问性 (Accessibility)

- 确保与背景有足够对比度
- 为图标配备文字标签
- 不仅依赖颜色传达信息

---

## 三、图标尺寸规范

### 3.1 标准尺寸

| 用途 | 设计尺寸 | 输出尺寸 | 安全区域 |
|------|----------|----------|----------|
| TabBar图标 | 48×48px | 81×81px(@2x) | 4px内边距 |
| 导航图标 | 48×48px | 88×88rpx | 4px内边距 |
| 功能图标 | 24×24px | 48×48rpx | 2px内边距 |
| 服务图标 | 64×64px | 80×80rpx | 6px内边距 |

### 3.2 网格系统

- 使用 24×24 或 48×48 的网格
- 图标内容居中对齐
- 保持一致的安全边距

---

## 四、柔和风格绘制技巧

### 4.1 线条处理

```
✓ 推荐：圆润端点 (round cap)
✓ 推荐：圆润连接 (round join)
✗ 避免：尖锐端点 (butt cap)
✗ 避免：尖锐连接 (miter join)
```

### 4.2 填充与描边

- **默认态**：描边 2px，颜色 `#A8A5A2`
- **选中态**：填充 + 描边，颜色 `#FF8066`
- **强调效果**：渐变填充 `#FF8066 → #FFAB91`

### 4.3 阴影与层次

柔和风格可添加微妙的阴影：

```css
/* 图标柔和阴影 */
filter: drop-shadow(0 2px 4px rgba(255, 128, 102, 0.2));
```

### 4.4 动画提示

选中态可添加微妙的缩放或弹跳动画：

```css
/* 选中动画 */
transform: scale(1.05);
transition: transform 0.2s ease;
```

---

## 五、图标类型设计指南

### 5.1 TabBar 图标

**要求**：需要两个状态（默认/选中）

| 图标 | 默认态 | 选中态 |
|------|--------|--------|
| 首页 | 线框房屋 | 填充房屋 + 暖杏色 |
| 服务 | 线框网格 | 填充网格 + 暖杏色 |
| 消息 | 线框气泡 | 填充气泡 + 暖杏色 |
| 我的 | 线框人像 | 填充人像 + 暖杏色 |

### 5.2 导航菜单图标

- 使用统一的设计语言
- 颜色可根据类别区分
- 建议搭配圆角矩形背景

### 5.3 服务类型图标

可采用更丰富的视觉表现：

- 添加渐变填充
- 使用柔和的双色调
- 可加入装饰性元素

---

## 六、导出规范

### 6.1 文件格式

- **开发用**：PNG（@2x, @3x）或 SVG
- **设计稿**：保留原始 AI/Figma/Sketch 文件

### 6.2 命名规范

```
[用途]_[名称]_[状态].png
例如：
- home_v3.png（默认态）
- home_active_v3.png（选中态）
- nav_orders.png
- service_subject.png
```

### 6.3 文件大小限制

- 微信小程序 TabBar 图标不得超过 40KB
- 建议使用 TinyPNG 压缩后再使用

---

## 七、设计工具推荐

### 7.1 在线工具

- **Google Stitch** (stitch.withgoogle.com) - AI生成UI
- **Icons8** (icons8.com) - 免费图标库
- **IconScout** (iconscout.com) - 图标资源
- **Figma** (figma.com) - 矢量设计

### 7.2 AI生成工具

- 使用 AI 图像生成工具时，提示词参考：

```
"Soft pastel UI icon, [描述], minimal design, 
warm peach color #FF8066, rounded corners, 
2px stroke, clean vector style, 
white background, 48x48 pixels"
```

---

## 八、本项目图标清单

### 需要设计的图标

#### TabBar 图标（4组 × 2状态 = 8个）

1. 首页 home_v3 / home_active_v3
2. 服务 service_v3 / service_active_v3
3. 消息 message_v3 / message_active_v3
4. 我的 mine_v3 / mine_active_v3

#### 导航菜单图标

- nav_find_tutor.png（找陪伴师）
- nav_orders.png（我的订单）
- nav_child.png（孩子信息）
- nav_cases.png（案例）

#### 服务类型图标

- service_subject.png（学科辅导）
- service_psych.png（心理关怀）
- service_habit.png（习惯养成）
- service_interest.png（兴趣培养）

#### 我的页面图标（mine_v3目录）

- menu_case.png / menu_child.png
- menu_feedback.png / menu_rebate.png
- menu_resume.png / menu_service.png
- menu_settings.png
- order_all/pending/processing/completed.png

#### 其他功能图标

- search_icon.png
- notice_icon.png
- switch_role.png

---

## 九、参考资源

- UI设计规范：Material Design Icons Guidelines
- 色彩参考：Coolors.co、Color Hunt
- 设计灵感：Dribbble、Behance
- 图标库：Heroicons、Feather Icons、Lucide

---

*本教程基于专业UI设计最佳实践编写，适用于智伴家小程序柔和精致风格设计。*
