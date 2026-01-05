# Implementation Plan - Revamp Message Page Icons

## Goal

Replace the generic and repetitive icons on the "Message" page with a new set of distinct, high-quality, and context-aware icons.

## User Review Required

- [ ] None. Proceeding with the established "Modern/Colorful Flat" style.

## Proposed Changes

### 1. Generate New Icons

Location: `miniprogram/images/message/` (New directory)

- **System Notification**: `msg-system.png` (Bell/Megaphone - Blue/Red accent)
- **Order Reminder**: `msg-order.png` (Clipboard/List - Orange accent)
- **Activity Notification**: `msg-activity.png` (Gift/Star - Red/Gold accent)
- **Service Update**: `msg-service.png` (Check/Flag - Green accent)
- **Empty State**: `msg-empty.png` (Illustration style empty box/envelope - Neutral Gray)

### 2. Code Updates

- **File**: `miniprogram/pages/message/index.js`
  - Update `mockMessages` to use the new icon paths.
- **File**: `miniprogram/pages/message/index.wxml`
  - Update the empty state image source.

## Verification

- Manual verification via walkthrough.
