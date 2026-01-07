# Dropt Project Todo List

## Phase 2: Core Features (Recommendation Engine & Analytics)

- [x] **Implement Recommendation Engine Logic**
  - Implement the core logic to calculate a 'Recommendation Score' (0-100) based on the weighted factors defined in PROJECT_BLUEPRINT.md:
    - Academic Performance (40%)
    - Course Importance (25%)
    - Psychological (20%)
    - Academic Context (15%)
  - Generate specific advice based on the score.

- [x] **Build Recommendation UI**
  - Create a UI component in the Course Details screen to display:
    - Calculated Recommendation Score
    - Risk Level (Safe/At Risk/Failing)
    - Generated Action Plan/Advice

- [x] **Implement Average Case Calculation**
  - Implement `calculateAverageCase` function (FE-002).
  - Provide realistic grade projection based on current performance.
  - Display alongside Best/Worst case scenarios.

- [x] **Implement Configurable Assumptions**
  - Allow users to configure how 'unknown' (ungraded) categories are treated (FE-001).
  - Options: Skip (default), Optimistic (100%), Realistic (90%), Conservative (70%).

- [x] **Develop Analytics Dashboard**
  - Replace placeholder Analytics screen.
  - Implement visualizations:
    - Grade distribution charts
    - GPA impact analysis
    - Stress level trends across courses

- [x] **OCR Integration Prototype**
  - Research and prototype OCR feature for scanning syllabi/grades.
  - Create proof-of-concept using selected OCR library/service.
  - [x] S3 Storage Setup (Replaced by direct Gemini Base64)
  - [x] Image Picker & Upload UI
  - [x] AI Processing Pipeline (Gemini 2.5 Pro)
