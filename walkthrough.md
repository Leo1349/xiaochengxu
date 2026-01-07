# Home Page Icon Revamp Walkthrough

## Goal

To improve the visual aesthetic of the Home page and provide a professional default avatar for teachers.

## Changes

1. **Generated Assets**: Created 14 high-quality, modern, flat-style icons and 1 avatar.
    - **Default Avatar**: Mature, professional female cartoon character.
    - **Quick Nav**: Find Tutor, My Orders, Child Info, Success Cases, Resume, Rebate.
    - **Service Types**: Subject Tutoring, Interest Cultivation, Habit Formation, Psychological Counseling.
    - **UI Utilities**: Search, Switch Role, Notice.
2. **Updated `index.js`**:
    - Mapped `menuList` to new icons.
    - Mapped `teacherMenuList` to new icons.
    - Mapped `serviceTypes` to new icons.
    - Updated logic to use `default_teacher_avatar.png` when no avatar is present.
3. **Updated `index.wxml`**:
    - Replaced static icons in the Header (Search, Switch Role) and Notice Bar.

## Visual Verification

### Default Avatar

![Default Teacher Avatar](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/default_teacher_avatar_1767663086880.png)

### Quick Nav Icons

| Find Tutor | Orders | Child Info | Success Cases | Resume | Rebate |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ![Find Tutor](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/nav_find_tutor_1767663109591.png) | ![Orders](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/nav_orders_1767663128034.png) | ![Child](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/nav_child_1767663158646.png) | ![Cases](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/nav_cases_1767663178049.png) | ![Resume](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/nav_resume_1767663193530.png) | ![Rebate](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/nav_rebate_1767663210464.png) |

### Service Type Icons

| Subject | Interest | Habit | Psych |
| :---: | :---: | :---: | :---: |
| ![Subject](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/service_subject_1767663237893.png) | ![Interest](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/service_interest_1767663268037.png) | ![Habit](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/service_habit_1767663284669.png) | ![Psych](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/service_psych_1767663305010.png) |

### UI Utility Icons

| Search | Switch Role | Notice |
| :---: | :---: | :---: |
| ![Search](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/search_icon_1767663334788.png) | ![Switch](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/switch_role_1767663353557.png) | ![Notice](C:/Users/Administrator/.gemini/antigravity/brain/66398ce1-6295-4ccc-8d0c-a4e462072d27/notice_icon_1767663370123.png) |

---

# TabBar Icon Size Fix Walkthrough

## Issue Noticed

The `miniprogram/app.json` configuration for tabBar icons pointed to files that exceeded the 40KB specific size limit for WeChat Mini Programs. Although the files were resized, the IDE continued to report the error, likely due to caching.

## Actions Taken

1. **Identified Problematic Files:** Scanned `miniprogram/images/icons/` folder and found 8 icons exceeding 40KB.
2. **Automated Resizing:** Created a Python script (`resize_icons.py`) to resize images to 81x81 pixels and optimized them (all now < 5KB).
3. **Cache Busting:**
    - Renamed all 8 tabBar icons from `*.png` to `*_v2.png`.
4. **Configuration Update:** Updated `miniprogram/app.json` to reference the new `_v2` filenames.

## Result

Definitively resolved the 40KB size limit error.
