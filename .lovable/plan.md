
# Plan: Complete Activity Edit Dialog with All Form Fields

## Overview
Rebuild the EditActivityDialog to include all the actual form fields that exist in the activity creation flow, remove non-existent fields like "satisfaction", and add the ability to edit super behaviour ratings.

## Current Issues
1. **Pre-Activity tab** shows generic "Confidence Level" and "Intention" - missing the 4 actual confidence questions (excited, nervous, bodyReady, believeWell)
2. **Post-Activity tab** includes "satisfaction" slider which doesn't exist in the actual form
3. **Missing reflection sliders**: workRate, focus, mistakes, performance (not just confidence)
4. **Missing super behaviour editing**: The 4 behaviour types (Brave on Ball, Brave off Ball, Electric, Aggressive) each with 4 questions are not editable
5. **Missing intentionAchieved** field (yes/partial/no/forgot options)
6. **Missing Best Self Score** editing

## Technical Implementation

### File: `src/components/Progress/EditActivityDialog.tsx`

**Changes to Pre-Activity Tab:**
- Replace single "confidence" slider with 4 sliders:
  - Excited (0-10)
  - Nervous/Calm (0-10)
  - Body Ready (0-10)
  - Believe Well (0-10)
- Load from both `pre_activity_data.confidenceRatings` and the individual columns (`pre_confidence_excited`, etc.)
- Keep intention field
- Add selected goal display (read-only reference)

**Changes to Post-Activity Tab:**
- Remove the non-existent "satisfaction" slider
- Add all 5 reflection sliders: workRate, confidence, focus, mistakes, performance
- Add mood selection (1-5 emoji options)
- Add intentionAchieved selector (yes/partial/no/forgot)
- Add Best Self Score slider (0-100)

**Add New Tab: Super Behaviours**
- Create a 4th tab for editing super behaviour ratings
- Fetch existing ratings from `super_behaviour_ratings` table by activity_id
- Display each behaviour type (Brave on Ball, Brave off Ball, Electric, Aggressive) with 4 question sliders each
- Update both the `super_behaviour_ratings` table and `post_activity_data.superBehaviours` on save

**Save Logic Updates:**
- Update pre_activity_data with correct confidence ratings structure
- Update individual columns: pre_confidence_excited, pre_confidence_nervous, pre_confidence_body_ready, pre_confidence_believe_well
- Update post_activity_data with all reflection values, mood, and intentionAchieved
- Upsert super_behaviour_ratings records for each behaviour type
- Update/insert best_self_scores record

### Database Queries
- On dialog open: Fetch super_behaviour_ratings where activity_id matches
- On save: Upsert to super_behaviour_ratings table with onConflict: 'activity_id,behaviour_type'
- On save: Upsert to best_self_scores table

## UI Structure

```
Tabs:
├── Basic Info (existing - activity name, type, date, match stats)
├── Pre-Activity
│   ├── Confidence Questions (4 sliders: excited, nervous, bodyReady, believeWell)
│   └── Intention (textarea)
├── Post-Activity
│   ├── Mood (5 emoji buttons)
│   ├── Intention Achieved (4 options: yes, partial, no, forgot)
│   ├── Reflection Sliders (5: workRate, confidence, focus, mistakes, performance)
│   ├── Journal Prompts (3 textareas: wentWell, couldImprove, whatAffected)
│   └── Best Self Score (0-100 slider)
└── Behaviours (NEW TAB)
    ├── Brave on Ball (4 question sliders)
    ├── Brave off Ball (4 question sliders)
    ├── Electric (4 question sliders)
    └── Aggressive (4 question sliders)
```

## State Management
Add new state variables:
- `confidenceRatings: { excited, nervous, bodyReady, believeWell }`
- `reflections: { workRate, confidence, focus, mistakes, performance }`
- `mood: number | null`
- `intentionAchieved: string | null`
- `bestSelfScore: number`
- `superBehaviours: { braveOnBall, braveOffBall, electric, aggressive }` each with q1-q4

## Admin Access
The same dialog will work for both players and admins since:
- Admins have full RLS access to activities table
- Admins have full RLS access to super_behaviour_ratings table
- Admins have full RLS access to best_self_scores table
- The dialog is already used in ActivityLog which is shared by both player Progress page and Admin player view
