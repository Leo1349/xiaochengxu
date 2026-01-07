# Implementation Plan - UI Revamp & Icon Unification

## Goal

Create a "beautiful", "high saturation", and "unified" UI by replacing icons and polishing styles.

## Design Direction

- **Style**: High saturation, soft 3D/gradient, concise shapes.
- **Color Palette**: Vibrant Blue (Primary), Orange/Yellow (Accents).
- **Vibe**: Professional yet friendly (suitable for a tutor/companion app).

## Icon List to Generate

### 1. TabBar Icons (Size: 81x81 or similar, display 54x54)

- **Home**: House/Home symbol. Blue/Colorful.
- **Service**: Grid/Window symbol.
- **Message**: Bubble/Chat symbol.
- **Mine**: User/Person symbol.

### 2. Home Page - Service Types (Colorful, Circular or Rounded Square)

- **Subject Tutoring**: Book/Pen.
- **Interest Cultivation**: Palette/Music Note.
- **Habit Formation**: Clock/Checklist.
- **Psych Counseling**: Heart/Speech Bubble.

### 3. Home Page - Main Grid (Clean, consistent background or shaped)

- **Find Tutor**: Magnifying glass.
- **My Orders**: Clipboard/List.
- **Child Info**: Kid face/Smile.
- **Success Cases**: Trophy/Star.

### 4. Mine Page & Others

- **Menu Icons**: Standardized simple colored icons.

## Execution Steps

1. **Generate Icons**: Use AI image generation to create the assets.
2. **Save Assets**: Save to `miniprogram/images/icons_v3/` (create new folder to keep clean).
3. **Update Code**: Point `app.json` and JS files to new paths.
4. **Style Polish**: Update WXSS for better spacing, shadows, and card styling.
