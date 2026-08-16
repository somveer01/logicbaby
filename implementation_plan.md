# Implementation Plan: Subtask 4 & Subtask 5 Completion

Complete the remaining subtasks of the LogicBaby web application:
- **Subtask 4**: Child Dashboard & Interactive Learning Path Map
- **Subtask 5**: Parent Dashboard, Analytics Breakdown, Mistake Review Center & Profile Management

---

## Proposed Changes

### Subtask 4: Child Dashboard & Interactive Learning Path

#### [MODIFY] [dashboard.js](file:///c:/logicbaby/js/views/dashboard.js)
- **Category-specific Learning Path**: Add category selector pills (Patterns, Odd One Out, Spatial, Math, Sorting, Memory) allowing children to view and interact with the 10-level learning track for each category.
- **Interactive Level Nodes**: Make unlocked learning path nodes clickable so kids can replay any completed level or jump straight to their current active level.
- **Quick Review Banner**: If the profile has mistakes logged, show a playful "🎓 Practice Mistakes" banner on the dashboard with a 1-click launch to review mode.
- **Dynamic Category Cards**: Display current level number, star rating (out of 30 stars), accuracy percentage, and direct play button for each category.

#### [MODIFY] [main.css](file:///c:/logicbaby/css/main.css)
- Add CSS styles for learning path category tabs, mistake banner, interactive node hover states, and profile edit widgets.

---

### Subtask 5: Parent Dashboard & Mistake Review Center

#### [MODIFY] [parentDashboard.js](file:///c:/logicbaby/js/views/parentDashboard.js)
- **Comprehensive Analytics**:
  - Total Questions Answered, Correct vs. Incorrect counts, Overall Accuracy %, Total Stars, Streak Days, and Estimated Learning Time.
- **Category Mastery Breakdown**:
  - Visual progress bars for all 6 categories displaying accuracy, total stars earned, and levels unlocked.
- **Interactive Mistake Review Center**:
  - Connect "Review Mistakes" directly to `gameArena.startReviewMode()` or route `#/game/review`.
  - Detailed list view of logged mistakes with category tags, question text preview, wrong answer selected, and explanation.
  - Individual "Clear" and "Practice Now" buttons for each mistake.
- **Parental Controls & Profile Settings**:
  - Editable child name and avatar selection (🦊, 🐣, 🦁, 🦅, 🐼, 🦄, 🚀, 🤖).
  - Age group selector tier updater.
  - Sound effects & Speech narration toggles.
  - **Export / Import Progress**: JSON export/import for backing up and transferring learning progress.
  - **Safe Reset with Math Pin Gate**: Math challenge confirmation modal before wiping progress.

---

## Verification Plan

### Automated / Interactive Verification
1. **Dashboard Verification**:
   - Verify category cards correctly navigate to `#/game/:category`.
   - Verify changing category tabs in the Learning Path updates the 10-level path nodes for that category.
   - Verify clicking level nodes launches the game at that specific level.
2. **Mistake Review Verification**:
   - Answer questions incorrectly in Game Arena to register mistakes in `mistakeLog`.
   - Open Parent Dashboard to verify mistakes appear in the list with category and details.
   - Launch Mistake Review Mode, answer questions correctly, and verify mistakes are cleared from storage.
3. **Parent Settings Verification**:
   - Edit child's avatar and name, verify updates reflect in topbar and mascot.
   - Test JSON export and import.
   - Test math challenge security gate before resetting data.
