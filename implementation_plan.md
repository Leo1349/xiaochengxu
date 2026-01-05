# Implementation Plan - Revamp Mine Page Icons

## Goal

Replace the generic and repetitive icons on the "Mine" (User Profile) page with a new set of distinct, high-quality, and visually appealing icons.

## User Review Required

- [ ] Confirm preference for "Colored" vs "Monochrome" icons. (I will proceed with **Colored/Modern Flat** style to improve aesthetics as requested).

## Proposed Changes

### 1. Generate New Icons

Location: `miniprogram/images/mine/` (New directory to keep organized)

**Quick Entry Row (Order Status):**

- **Pending**: `order-pending.png` (Clipboard/Clock - Soft Orange)
- **Processing**: `order-processing.png` (Clipboard/Gear - Soft Blue)
- **Completed**: `order-completed.png` (Clipboard/Check - Soft Green)
- **All Orders**: `order-all.png` (List Stack - Soft Purple)

**Menu List (Services & Tools):**

- **Child Info**: `menu-child.png` (Cute Child/Face - Warm Color)
- **Success Cases**: `menu-case.png` (Trophy/Star - Yellow/Gold)
- **My Resume**: `menu-resume.png` (Document/Profile - Blue)
- **Rebate Center**: `menu-rebate.png` (Coin/Wallet - Red/Gold)
- **Feedback**: `menu-feedback.png` (Speech Bubble/Pen - Cyan)
- **Contact Service**: `menu-service.png` (Headset - Blue)
- **Settings**: `menu-settings.png` (Gear - Gray/Blue)
- **Switch Role**: `action-switch.png` (Swap Arrows - Blue)

### 2. Code Updates

- **File**: `miniprogram/pages/mine/index.js`
  - Update `parentMenuList` and `teacherMenuList` to use the new icon paths.
- **File**: `miniprogram/pages/mine/index.wxml`
  - Update hardcoded `src` attributes in the "Quick Entry" section.
  - Update "Switch Role" icon.

## Verification

- Manual verification via walkthrough to ensure all icons are loaded and unique.
