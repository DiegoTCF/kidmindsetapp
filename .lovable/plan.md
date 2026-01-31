

## Plan: Fix Large Gap Between Player Card and Bottom Navigation

### Root Cause Identified

The gap is caused by the **AppLayout** wrapper around the Home page. Here's what's happening:

1. **AppLayout** adds a fixed header with `h-20` (80px) logo and `pt-24` (96px padding) to the main content
2. The Home page has its own logout button and TopNavigation - causing redundancy
3. The content structure doesn't account for the bottom nav properly

The Home page is being double-wrapped with navigation elements:
- AppLayout provides: Header (logo + logout), BottomNav
- Home provides: Logout button, TopNavigation

### Solution

**Option A (Recommended): Remove AppLayout from Home Page**

Since the Home page has custom layout needs, exclude it from AppLayout entirely:

**File: `src/App.tsx`** - Change the Home route from:
```jsx
<Route path="/" element={
  <ProtectedRoute>
    <AppLayout>
      <Home />
    </AppLayout>
  </ProtectedRoute>
} />
```
To:
```jsx
<Route path="/" element={
  <ProtectedRoute>
    <Home />
  </ProtectedRoute>
} />
```

**File: `src/pages/Home.tsx`** - Add BottomNav directly:
- Import and add `<BottomNav />` at the bottom of the component
- Add `pb-24` padding to account for the fixed bottom nav
- Keep the current compact layout structure

### Technical Changes

1. **`src/App.tsx`** (Line 81-87):
   - Remove `<AppLayout>` wrapper from the Home route

2. **`src/pages/Home.tsx`**:
   - Import `BottomNav` component
   - Add `<BottomNav />` inside the return JSX
   - Add `pb-24` (96px) bottom padding to main container for the fixed nav

This keeps the Home page self-contained with a compact layout while still having proper bottom navigation.

