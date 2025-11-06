# Dashboard Layout

This directory contains the dashboard layout components for the Toko Ceria application.

## Structure

```
layouts/
├── DashboardLayout.tsx      # Main layout wrapper component
└── components/
    ├── Sidebar.tsx          # Sidebar navigation component
    └── Navbar.tsx           # Top navigation bar component
```

## Usage

### Basic Example

```tsx
import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function MyPage() {
    return (
        <DashboardLayout>
            <div>
                <h1>My Page Content</h1>
                {/* Your page content here */}
            </div>
        </DashboardLayout>
    );
}
```

## Features

### Sidebar
- Responsive sidebar that collapses on mobile
- Navigation links with active state highlighting
- Dark mode support
- Smooth transitions and animations

### Navbar
- Logo on the left
- Search bar in the middle (responsive)
- Notifications dropdown with badge indicator
- Avatar dropdown menu with:
  - Profile link
  - Settings link
  - Dark/Light mode toggle
  - Logout option

### Dark Mode
- Toggle available in avatar dropdown menu
- Persists preference in localStorage
- Respects system preference on first visit
- Smooth transitions between modes

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile with overlay
- Navbar adapts for mobile screens
- Search bar hidden on mobile, shown in navbar on desktop

## Customization

### Adding Navigation Items

Edit `Sidebar.tsx` and add items to the `navigation` array:

```tsx
const navigation: NavItem[] = [
    // ... existing items
    {
        name: 'New Page',
        href: '/new-page',
        icon: <YourIcon />
    },
];
```

### Modifying Notifications

Edit the `notifications` array in `Navbar.tsx` or connect to your backend API.

### Customizing Colors

All components use Tailwind CSS with dark mode classes. Modify the class names to change colors:

- Primary: `blue-600`, `blue-500`
- Background: `white`, `gray-50` (light) / `gray-800`, `gray-900` (dark)
- Text: `gray-900`, `gray-700` (light) / `white`, `gray-300` (dark)

