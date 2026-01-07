# Dropt - AI-Powered Course Drop Recommendation System

## Executive Summary
An intelligent system that analyzes multiple factors (academic performance, psychological well-being, course importance) to provide personalized recommendations on whether a student should drop a course, along with actionable improvement strategies.

---

## System Architecture

### 1. Core Components

#### A. Frontend (Student Interface)
- **Input Forms**
  - Current grades entry (assignments, quizzes, exams, projects)
    - **Enhanced Assignment Management**: Add/Edit/Delete with date pickers
  - **OCR-Powered Input**: Upload syllabus/grade screenshots for automatic data extraction
  - Emotional/psychological assessment questionnaire
  - Course metadata (is it required? elective? pre-requisite for other courses?)
  - Time commitment slider (hours spent per week)
  - Other courses load indicator

- **Output Dashboard**
  - Current grade breakdown visualization
  - Recommendation score (0-90 scale)
  - Risk assessment indicator (Safe/At Risk/Failing)
  - Personalized action plan
  - Interactive "what-if" scenario calculator

#### B. Backend Services
- **Grade Calculator Service**
  - Processes rubric data
  - Calculates current standing
  - Projects potential final grades

- **OCR Processing Service**
  - Image preprocessing and enhancement
  - Text extraction from syllabi and grade screenshots
  - Structured data parsing (tables, grades, rubrics)
  - Confidence scoring for extracted data
  - Validation and error correction

- **AI Recommendation Engine**
  - Multi-factor analysis
  - Decision tree/ML model for recommendations
  - Confidence scoring

- **Rubric Management System**
  - Stores course-specific grading rubrics
  - Supports different grading schemes (weighted categories, points-based, etc.)
  - Auto-population from OCR-extracted data

- **Strategy Generator**
  - Produces personalized improvement plans
  - Generates negotiation talking points for professors

#### C. Database Schema
```
Courses
- course_id
- course_code
- course_name
- department
- is_required (boolean)
- typical_difficulty_rating

Rubrics
- rubric_id
- course_id
- assignment_category (homework, quiz, midterm, final, project)
- weight_percentage
- total_points
- drop_policy (e.g., "lowest 2 dropped")

StudentData
- student_id
- course_id
- grades (JSON array of individual scores)
- psychological_score (1-10)
- time_investment (hours/week)
- other_courses_count
- semester_credit_hours

Recommendations
- recommendation_id
- student_id
- course_id
- recommendation_score
- keep_or_drop
- confidence_level
- generated_advice (JSON)
- timestamp

OCRUploads
- upload_id
- student_id
- file_path
- file_type (syllabus, grade_screenshot, rubric)
- upload_timestamp
- processing_status (pending, completed, failed)
- extracted_data (JSON)
- confidence_scores (JSON)
- manual_corrections (JSON)
```

---

## 2. AI Recommendation Algorithm

### Input Factors (Weighted)

#### Academic Performance (40%)
- Current grade percentage
- Trend analysis (improving vs declining)
- Points remaining in semester
- Difficulty of remaining assignments
- Maximum achievable grade
- Minimum risk grade (if student gets 0 on all future work)

#### Course Importance (25%)
- Required vs elective (required = higher weight to keep)
- Pre-requisite for other courses
- Major requirement vs general education
- Impact on graduation timeline

#### Psychological/Wellbeing (20%)
- Self-reported stress level (1-10 scale)
- Time spent vs expected workload
- Impact on other courses
- Sleep/health indicators (optional survey)

#### Academic Context (15%)
- Total credit hours this semester
- Performance in other courses
- GPA impact calculation
- Financial aid requirements (minimum credit hours)

### Decision Matrix

```
Recommendation Score =
  (Academic_Score * 0.40) +
  (Course_Importance * 0.25) +
  (Psychological_Health * 0.20) +
  (Academic_Context * 0.15)

If Score >= 70: Strong Keep
If Score 50-69: Keep with Support Plan
If Score 30-49: Consider Dropping
If Score < 30: Strong Drop Recommendation
```

---

## 3. Output Components

### A. Grade Analysis Dashboard
- Current grade with confidence interval
- Category breakdown (homework: 85%, exams: 72%, etc.)
- Visual timeline of grade progression
- Comparison to class average (if available)

### B. Risk Assessment
- **Failing Risk**: Probability of getting D or F
- **GPA Impact**: How this course affects cumulative GPA
- **Best Case Scenario**: If student aces all remaining work
- **Worst Case Scenario**: If student does poorly on remaining work
- **Realistic Projection**: Based on current trends

### C. Recommendation Report

**If Recommending to Keep:**
1. **Improvement Roadmap**
   - Focus areas (e.g., "Your exam scores are low. Next exam is 20% of grade")
   - Specific point targets (e.g., "Score 85+ on final to secure a B")
   - Time management suggestions

2. **Resource Suggestions**
   - Office hours schedule
   - Tutoring centers
   - Study groups
   - Online resources specific to course topics

3. **Professor Negotiation Guide**
   - Template email requesting meeting
   - Questions to ask about extra credit
   - How to explain your situation professionally
   - Timing advice (best time in semester to reach out)

**If Recommending to Drop:**
1. **Timeline & Logistics**
   - Drop deadline date
   - Financial implications (refund amount)
   - How to drop (registrar process)

2. **Alternative Paths**
   - Taking course in future semester
   - Summer school options
   - Alternative courses that fulfill same requirement

3. **Damage Control**
   - GPA protection strategy
   - Academic record impact (W vs F)
   - Explaining to parents/advisors

### D. Interactive Features
- **What-If Calculator**: "If I score X on the final, my grade will be Y"
- **Scenario Planner**: Test different effort allocations
- **Deadline Tracker**: Important dates and points available

---

## 4. Technical Stack Recommendations

### Frontend
- **React** or **Vue.js**: Dynamic UI with data visualization
- **Chart.js** or **D3.js**: Grade visualizations
- **Tailwind CSS**: Rapid, responsive styling
- **react-dropzone** or **Uppy**: File upload UI components
- **Cropper.js**: Image cropping/preprocessing before OCR

### Backend
- **Node.js + Express** or **Python + FastAPI**
- **PostgreSQL**: Relational database for structured rubric/grade data
- **Redis**: Caching for frequently accessed rubrics
- **AWS S3** or **Cloudinary**: Image storage for uploaded files

### OCR/AI Component
- **GPT-4 Vision** (Recommended): Context-aware document understanding
- **Google Cloud Vision API**: High accuracy for typed text and tables
- **AWS Textract**: Excellent for form/table extraction from syllabi
- **Tesseract.js**: Fallback for basic OCR (free, client-side option)
- **Pillow/OpenCV**: Image preprocessing (Python)
- **Sharp**: Image preprocessing (Node.js)

### AI/ML Component
- **Python scikit-learn**: For decision tree/random forest models
- **TensorFlow/PyTorch**: If using neural networks (optional, may be overkill)
- **Rule-based system initially**: Start with weighted scoring, add ML later

### Hosting
- **Vercel/Netlify**: Frontend hosting
- **Railway/Render/AWS**: Backend hosting
- **Supabase**: Alternative all-in-one backend solution

---

## 5. Development Phases

### Phase 1: MVP (Minimum Viable Product)
**Timeline: 4-6 weeks**
- Basic grade input form
- **OCR Integration**: Syllabus/grade screenshot upload with basic text extraction
- Simple rubric system (hardcoded for 2-3 courses)
- Rule-based recommendation engine
- Basic output report
- Single-page application

**Goal**: Prove the concept works with real user testing

### Phase 2: Enhanced Features
**Timeline: 4-6 weeks**
- User authentication
- Database integration for rubrics
- **Advanced OCR**: GPT-4 Vision for intelligent parsing, confidence scores, validation UI
- **Mobile camera integration**: Direct photo capture from phone
- Psychological assessment questionnaire
- Improved UI/UX with visualizations
- What-if calculator

### Phase 3: AI Enhancement
**Timeline: 4-6 weeks**
- Train ML model on historical data
- A/B test ML vs rule-based recommendations
- Personalization based on student history
- Integration with university systems (if possible)

### Phase 4: Scale & Polish
**Timeline: 4-6 weeks**
- Mobile responsive design
- Email notifications for deadlines
- Export reports as PDF
- Admin panel for instructors/advisors
- Analytics dashboard

---

## 6. Key Considerations & Challenges

### Ethical Considerations
- **Bias Prevention**: Ensure recommendations don't favor certain demographics
- **Transparency**: Explain why a recommendation was made
- **Human Override**: Students should have final say, not the AI
- **Privacy**: Protect sensitive student data (FERPA compliance if in US)
- **Liability**: Include disclaimers that this is advisory, not prescriptive

### Technical Challenges
- **Rubric Variability**: Every professor grades differently
- **Data Accuracy**: Students may input incorrect information
- **Context Limitations**: AI can't know everything (family issues, health, etc.)
- **Integration**: Getting data from university systems is difficult

### Competitive Advantages
- **Holistic Approach**: Most tools only calculate grades, you're considering wellbeing
- **Actionable Advice**: Not just "you're failing" but "here's how to fix it"
- **Psychological Support**: Acknowledging the emotional toll of struggling
- **Early Warning System**: Catches problems before they become failures

---

## 7. Success Metrics

### User Engagement
- Number of students using the system
- Repeat usage rate
- Time spent on platform
- Feature adoption (which tools are most used?)

### Academic Impact
- Did students who followed "keep" recommendations improve?
- Did students who dropped have better overall semester outcomes?
- GPA changes semester-over-semester
- Student satisfaction surveys

### Accuracy Metrics
- Recommendation confidence vs actual outcomes
- False positive rate (recommended keep but student failed)
- False negative rate (recommended drop but student would have passed)

---

## 8. Unique Features to Consider

### Advanced Features (Future Enhancements)
1. **OCR Enhancements**
   - Batch processing for multiple documents
   - Handwriting recognition for handwritten feedback
   - Multi-language support for international students
   - Smart detection of grade distribution patterns

2. **Peer Comparison** (Anonymous)
   - "Students with similar profiles who kept this course improved by 15%"

3. **Professor Insights**
   - Historical grade distributions
   - "This professor typically curves by 5%"

4. **AI Study Plan Generator**
   - Personalized weekly study schedule
   - Adaptive based on progress

5. **Mental Health Integration**
   - Connect with campus counseling resources
   - Stress management tips

6. **Group Study Matching**
   - Connect students in same courses
   - Form study groups based on availability

7. **Chrome Extension**
   - Integrates with university LMS (Canvas, Blackboard)
   - Automatically imports grades via OCR of grade pages

8. **Advisor Collaboration Mode**
   - Share reports with academic advisors
   - Get professional feedback on recommendations

---

## 9. Data Requirements

### To Train/Validate AI Model
- Historical grade data (anonymized)
- Drop rates by course
- Final grade distributions
- Survey data on why students dropped

### To Run System
- Course rubrics (can be user-inputted manually or via OCR)
- Student's current grades (manual entry or OCR from screenshots)
- Course metadata (required vs elective)
- University policies (drop deadlines, GPA requirements)
- Sample syllabi for OCR training/testing

---

## 10. Go-to-Market Strategy

### Target Users
1. **Individual Students**: Direct B2C model
2. **University Partnerships**: B2B model with student success offices
3. **Academic Advisors**: Tool to assist in counseling sessions

### Marketing Channels
- Social media (TikTok, Instagram) with student success content
- University subreddit partnerships
- Campus ambassador program
- Academic advisor conferences

### Pricing Models
- **Freemium**: Basic features free, advanced features paid
- **University License**: Bulk pricing for institutions
- **Per-Semester**: $5-10 per semester per student

---

## 11. Risk Mitigation

### Legal Risks
- **Disclaimers**: "Advisory tool, not a substitute for academic advising"
- **Data Protection**: FERPA/GDPR compliance
- **Terms of Service**: Liability limitations

### Reputational Risks
- Wrong recommendations could harm students
- Need high accuracy and confidence thresholds
- Include "seek human advisor" prompts for edge cases

### Technical Risks
- Data breaches
- System downtime during critical periods (finals week)
- Scalability issues

**Mitigation Strategies:**
- Rigorous testing before launch
- Gradual rollout with beta testing
- Regular audits of recommendations
- Insurance/legal review
- Backup systems and redundancy

---

## 12. Sample User Flow

1. **Student Signs Up**
   - Creates account with university email
   - Inputs current semester schedule

2. **Adds Course of Concern**
   - Selects "MATH 201" from database or adds custom
   - Marks as "Required for Major"
   - **OCR Option**: Uploads syllabus screenshot/photo
     - System extracts: Course name, grading rubric, assignment categories, weights
     - Student reviews/confirms extracted data in validation UI
     - Corrections are saved for future improvements
   - **Or** manually inputs grades from syllabus rubric

3. **Inputs Current Grades**
   - **OCR Option**: Takes photo of Canvas grade page or grade report
     - System extracts individual assignment scores
     - Highlights confidence levels (green = high, yellow = review, red = low)
     - Student confirms or corrects extracted grades
   - **Or** manually enters grade data

4. **Completes Assessment**
   - Answers 5-7 questions about stress, time, other courses
   - Reviews auto-calculated current grade (82%)

5. **Receives Recommendation**
   - System shows: "Keep - Moderate Support Needed" (Score: 65/100)
   - Breakdown: "Your grade is passing but you're highly stressed"
   - Recommendation: Focus on next exam (worth 25%), reduce 5 hours/week

6. **Explores Action Plan**
   - Downloads PDF of improvement strategies
   - Uses what-if calculator: "If I score 90 on final, I'll get a B+"
   - Sets up email reminder for professor office hours

7. **Tracks Progress**
   - Updates grades after next exam (can use OCR again)
   - System recalculates recommendation (now 72/100 - "Keep")

---

## Conclusion

This system combines academic analytics, psychological awareness, and AI-driven insights to provide students with a holistic view of their course struggles. By going beyond simple grade calculation to include wellbeing and strategic advice, Dropt can become an essential tool for student success.

**Next Steps for Presentation:**
1. Create mockups of the UI (use Figma or similar)
2. Develop a simple prototype with hardcoded data
3. Prepare demo scenario with realistic student data
4. Research competitor tools (none do exactly this)
5. Gather testimonials/letters of support from academic advisors

**Key Talking Points:**
- "We help students make data-driven decisions about course retention"
- "Unlike grade calculators, we consider mental health and strategic importance"
- "Our AI doesn't just tell students they're failing—it tells them how to succeed"
- "Proven to reduce stress and improve semester outcomes"
