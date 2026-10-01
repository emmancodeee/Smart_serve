# UI Consistency Fix: Feedback & Returns Pages

## Root Cause
Feedback and Returns pages used Bootstrap 5 (CSS + JS) while the rest of the app uses Tailwind + custom CSS with the `student-*` class system, causing visual inconsistency.

## Completed Steps

### Step 1: Rewrite `public/feedback.html` ✅
- Replaced `dashboard-*` shell with `student-*` shell (matching profile.html/announcement.html pattern)
- Removed Bootstrap CDN script link
- Removed the massive embedded `<style>` block with conflicting CSS variables
- Replaced all Bootstrap `.btn`, `.form-control`, `.form-select`, `.badge`, `.table`, `.modal` classes with custom `student-*` classes
- Converted Bootstrap modals to custom modal system (same pattern as announcement.html)
- Updated sidebar to include Feedback AND Returns links with both visible
- Feedback link marked as `is-active`
- Used consistent navy-blue color scheme

### Step 2: Rewrite `public/returns.html` ✅
- Same changes as feedback.html
- Replaced Bootstrap grid (`row`, `col-md-*`) with Tailwind grid (`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4`)
- Returns link marked as `is-active`
- Added rating input CSS for the feedback modal

### Step 3: Update `public/js/feedback.js` ✅
- Replaced `new bootstrap.Modal(...)` / `bootstrap.Modal.getInstance(...)` with vanilla JS `openModal()` / `closeModal()`
- Replaced Bootstrap badge classes with `student-badge-*` classes
- Replaced Bootstrap button classes with `student-btn-*` classes

### Step 4: Update `public/js/returns.js` ✅
- Replaced all Bootstrap modal API calls with vanilla JS toggles
- Replaced Bootstrap grid classes in dynamic HTML with Tailwind grid
- Replaced all Bootstrap component classes with `student-*` equivalents

