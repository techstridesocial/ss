# Design System: Stride Social Dashboard

## Overview
This document defines the design system standards for the Stride Social Dashboard. A unified and consistent design system ensures a professional, clean, and user-friendly experience across all user roles and device sizes.

The design principles align with the latest modern SaaS dashboard practices.

---

## Core Design Principles

- **Simplicity First**: Clean layouts with minimal distractions.
- **Consistency Across Roles**: Brands, Influencers, and Admins share a unified design language.
- **Accessibility**: WCAG 2.1 AA standards prioritized (keyboard navigation, screen reader friendly).
- **Performance-Oriented**: Lightweight components, optimized images, minimal blocking assets.
- **Mobile-First**: Full functionality and usability across mobile, tablet, and desktop.


---

## Color Palette

| Purpose | Color | Notes |
|:-----|:---|:---|
| Primary Action | `#1A73E8` | Primary buttons, links |
| Secondary Action | `#64748B` | Secondary buttons, chips |
| Background (Light) | `#F9FAFB` | Main dashboard background |
| Background (Dark Card) | `#FFFFFF` | Cards, modals |
| Text Primary | `#111827` | Main headings, important text |
| Text Secondary | `#6B7280` | Subtext, descriptions |
| Border | `#E5E7EB` | Dividers, light borders |
| Error/Alert | `#EF4444` | Error messages, danger buttons |
| Success/Confirm | `#10B981` | Success messages, confirmations |


---

## Typography

- **Font Family**: `Inter, sans-serif`
- **Base Font Sizes**:
  - Heading 1: `text-4xl font-bold`
  - Heading 2: `text-3xl font-semibold`
  - Heading 3: `text-2xl font-semibold`
  - Subtitle: `text-lg font-medium`
  - Body: `text-base`
  - Small: `text-sm`
- **Line Height**:
  - Comfortable line heights for reading: 1.5–1.75x font size.


---

## Spacing and Sizing

- **Global Spacing Scale**: Tailwind spacing utilities (e.g., `p-2`, `p-4`, `m-2`, `m-6`).
- **Component Padding**:
  - Buttons, cards, forms: `px-4 py-2` minimum.
- **Grid Layout**:
  - Dashboard sections follow a 12-column grid at desktop size.
  - Collapses cleanly to 2–4 columns on tablet and 1 column on mobile.


---

## Components

### Buttons
- **Primary Button**: Solid primary color, rounded (`rounded-2xl`), subtle shadow.
- **Secondary Button**: Neutral color, outlined style, slightly smaller.
- **Disabled State**: Lower opacity, no hover effect.

### Inputs and Forms
- Clean borders (`border-gray-300`), subtle focus rings.
- Always include label text and validation error text.
- Inputs must have auto-complete and keyboard accessibility.

### Cards
- Rounded (`rounded-2xl`), light shadow (`shadow-md`).
- Used for influencer profiles, campaign overviews, and financial form submissions.

### Modals
- Centered modals with dark backdrop (`bg-opacity-60`).
- Accessible close button (icon top-right).

### Tables
- Zebra striping for readability (`bg-gray-50` alternate rows).
- Sticky headers on scroll (for influencer rosters, campaign lists).

### Navigation
- **Top Header Navigation** (grouped dropdowns).
- Mobile: Hamburger menu.
- Active link highlighting.


---

## Icons
- **Lucide Icons** (modern, minimalist, consistent stroke width).
- Icons used sparingly to enhance usability, not overload UI.


---

## Animations
- **Framer Motion** used for page transitions, modals opening, save feedback.
- Animations should be fast (under 400ms), subtle, and never block user interactions.


---

## Responsiveness

- Fully responsive layouts tested across breakpoints:
  - Mobile: up to 640px
  - Tablet: 641px – 1024px
  - Desktop: 1025px and up
- Priority on mobile touch targets (minimum 44x44px clickable area).


---

## Dark Mode (Future Enhancement)
- Design system is prepared for future dark mode implementation.
- Tailwind `dark:` classes will be added later.


---

## Statement
This design system ensures the Stride Social Dashboard delivers a consistent, elegant, and accessible experience for all users, reinforcing trust and professionalism at every interaction. 