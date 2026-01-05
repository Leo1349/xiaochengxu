# Implementation Plan - Icon Replacement

## Goal

Replace the existing TabBar icons in the WeChat Mini Program with new, high-quality icons downloaded from the internet. Ensure a git commit is made before applying changes.

## User Review Required

- [ ] Confirm if specific style is desired (I will aim for "modern/clean blue" based on existing theme).

## Proposed Changes

### Icons to Replace

Location: `miniprogram/images/icons/`

**Home Tab**

- `home.png` -> [New Home Icon]
- `home-active.png` -> [New Home Active Icon]

**Service Tab**

- `service.png` -> [New Service Icon]
- `service-active.png` -> [New Service Active Icon]

**Message Tab**

- `message.png` -> [New Message Icon]
- `message-active.png` -> [New Message Active Icon]

**Mine Tab**

- `mine.png` -> [New User Icon]
- `mine-active.png` -> [New User Active Icon]

### Process

1. **Commit Current State**: `git add .` && `git commit -m "Backup before icon replacement"`
2. **Find Icons**: Search for a consistent set of 4 icons (Home, Service, Message, User) in both inactive (gray/outline) and active (blue/filled) states.
3. **Download**: Save new icons to `miniprogram/images/icons/`, overwriting the old ones.
4. **Verify**: Check if file names match exactly to avoid modifying `app.json` (unless necessary).

## Verification Plan

### Manual Verification

- View the files in the directory to check they are valid images.
- (Optionally) Ask user to preview in IDE.
