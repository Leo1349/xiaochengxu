# Home Page Icon Revamp Plan

## Goal

Revamp the visual aesthetic of the Home page by replacing generic/incorrect icons with high-quality, modern, colorful icons. Also, provide a specific "mature cartoon" avatar for teachers without a photo.

## Proposed Changes

### 1. Image Generation

Generate the following assets using `generate_image`. All icons should use a consistent style (e.g., modern flat with soft gradients or colorful 3D elements, depending on consistency with the existing blue theme).

**Style Guide:**

- Primary Color: Blue `#4080FF` (approximate based on screenshot/code).
- Background: Transparent or Soft Container.
- Style: Modern, Friendly, Clean.

**List of Assets:**

1. **Default Teacher Avatar**: `default_teacher_avatar.png` (Mature, professional, friendly cartoon character).
2. **Search Icon**: `search_icon.png` (Magnifying glass).
3. **Role Switch Icon**: `switch_role.png` (Two arrows or user swap).
4. **Notice Icon**: `notice_icon.png` (Speaker/Bell).
5. **Quick Nav Icons** (64x64):
    - `nav_find_tutor.png` (Search/Person).
    - `nav_orders.png` (List/Document).
    - `nav_child.png` (Child/Face).
    - `nav_cases.png` (Trophy/Star/Book).
    - `nav_resume.png` (CV/Profile).
    - `nav_rebate.png` (Money/Coin/Gift).
6. **Service Type Icons** (60x60):
    - `service_subject.png` (Book/Pen).
    - `service_interest.png` (Palette/Music Note).
    - `service_habit.png` (Clock/Checklist).
    - `service_psych.png` (Heart/Chat).

### 2. Code Updates

#### [MODIFY] `miniprogram/pages/index/index.js`

- Update `menuList` data to point to new icons.
- Update `teacherMenuList` data to point to new icons.
- Update `serviceTypes` data to point to new icons.
- Update `useMockData` function to use `default_teacher_avatar.png` as the default avatar.
- Update `loadTeacherList` to fallback to `default_teacher_avatar.png` if avatar is missing/empty.

#### [MODIFY] `miniprogram/pages/index/index.wxml`

- Update static image sources (Search bar, Switch role, Notice bar).

## Verification Plan

### Automated Tests

- None.

### Manual Verification

1. **Visual Check**: Use the simulator to verify all icons appear correctly on the Home page.
2. **Role Switch**: Toggle between Parent and Teacher modes to verify role-specific menu icons.
3. **Default Avatar**: Temporarily modify a teacher's avatar in mock data to be empty to verify the default avatar renders.
