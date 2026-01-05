# Implementation Plan - Fix Review Page Icon

## Goal

Fix the issue where the "Close" icon on the "Order Detail" review modal is too large and potentially ugly.

## User Review Required

- [ ] None. Fixing a UI bug (missing styles).

## Proposed Changes

### 1. Generate New Icon

- **Close Icon**: `close.png` (Simple, modern gray 'X', 64x64).
  - Target: `miniprogram/images/icons/close.png` (Overwrite existing or create new).

### 2. Code Updates

- **File**: `miniprogram/pages/order-detail/index.wxss`
  - Add missing styles for `.review-modal`, `.modal-header`, and `.close-icon`.
  - Ensure the close icon is small (e.g., 40x40rpx) and positioned correctly.

### 3. Verification

- Manual verification via walkthrough (since I can't run the app, I rely on code correctness and user feedback).
