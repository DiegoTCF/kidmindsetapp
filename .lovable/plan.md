

## Plan: Remove Empty Space Below Player Card on Home Page

### Problem Analysis
The Home page currently has a large gap below the FIFA-style player card. This happens because:
- The card container uses `flex-1` which expands to fill all available vertical space
- Combined with `items-start`, the card is pushed to the top while the container fills the remaining space, creating the gap below
- The `TopNavigation` is fixed-positioned, so it doesn't affect the layout

### Solution
Change the layout approach to remove the expanding behavior and instead use a compact, centered layout without stretching.

### Changes Required

**File: `src/pages/Home.tsx`**

1. Remove `flex-1` from the outer container (line 183) - this stops it from stretching to fill `min-h-screen`
2. Change the card wrapper (line 209) from `flex-1 flex items-start justify-center` to just `flex justify-center` - this removes the expansion behavior
3. Keep the navigation at the bottom by adding a small margin-top to it, or let it naturally follow the content

The updated structure will be:
```
Container (no flex-1)
  - Logout button
  - Welcome message  
  - Player card (no flex-1, just centered)
  - TopNavigation (follows content naturally)
```

### Technical Details
- Line 183-184: Remove `flex flex-col` and `flex-1 flex flex-col` from the outer containers
- Line 209: Change from `flex-1 flex items-start justify-center` to `flex justify-center`
- Add `mt-4` to the TopNavigation wrapper for slight spacing after the card

