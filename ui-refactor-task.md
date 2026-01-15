# UI Design System & Refactoring Task List

## 1. Design System Foundation (Hardcoded Hex Values)

- [x] **Global Styles (`app.wxss`)**: Define global variables, utility classes, and reset styles using hardcoded hex values.
  - [x] Colors: Brand (`#3D7EFF`), Background (`#F5F6F8`, `#FFFFFF`), Text (`#333333`, `#666666`, `#999999`)
  - [x] Typography: Font sizes, weights
  - [x] Spacing: Margins, paddings (4rpx grid)
  - [x] Components: Buttons, Cards, Inputs, Tags

## 2. Core Pages Refactoring

- [x] **Homepage (`pages/index/`)**: Search, Banner, Menu Grid, Teacher Cards.
- [x] **Personal Center (`pages/mine/`)**: User Profile, Stats, Menu List.
- [x] **Teacher Detail (`pages/teacher-detail/`)**: Header, Tabs, Info Blocks, Bottom Bar.
- [x] **Order List (`pages/order-list/`)**: Tabs, Order Cards, Status Tags.
- [x] **Order Detail (`pages/order-detail/`)**: Status Section, Info Lists, Steps.

## 3. Secondary Pages Refactoring

- [x] **Login (`pages/login/`)**: Logo, Form, Social Login.
- [x] **Register (`pages/register/`)**: Role Selection, Form Steps.
- [x] **Search (`pages/search/`)**: Search Bar, History, Results List.
- [x] **Message (`pages/message/`)**: List Items, Badges.
- [x] **Chat (`pages/chat/`)**: Bubbles, Input Area.
- [x] **Settings (`pages/settings/`)**: List Groups, Actions.
- [x] **Order Confirm (`pages/order-confirm/`)**: Address, Service Item, Coupon.

## 4. Functional Pages Refactoring

- [x] **Service (`pages/service/`)**: Filters, Grid/List.
- [x] **Child Info (`pages/child-info/`)**: Cards, Add Form.
- [x] **Feedback (`pages/feedback/`)**: Form, Textarea, Upload.
- [x] **Case List (`pages/case-list/`)**: Cards, Images.
- [x] **Case Detail (`pages/case-detail/`)**: Articles, Author Info.
- [x] **Rebate (`pages/rebate/`)**: Stats Card, List.
- [x] **Teacher Resume (`pages/teacher-resume/`)**: Form Sections, Upload.
- [x] **Customer Service (`pages/customer-service/`)**: Contact List, SEQ.
- [x] **Example (`pages/example/`)**: Component Demos.

## 5. Admin Backend Refactoring

- [x] **Admin Login (`pages/admin/login/`)**: Specialized Login Form.
- [x] **Order Management (`pages/admin/order-list/`)**: Admin List View.
- [x] **Order Details (`pages/admin/order-detail/`)**: Admin Detail View, Actions.

## 6. Verification

- [x] **Visual Check**: Ensure all pages adhere to "Concise, Fresh, Low Saturation" aesthetic.
- [x] **Constraint Check**: Verify no `var(--...)` usage remains in refactored files.
