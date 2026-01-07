# Dropt - Course Drop Decision System
## Presentation Outline

---

## 1. Problem Statement (1 min)
**The Challenge:**
- Students struggle to decide whether to drop struggling courses
- Current tools only calculate grades, ignore mental health and strategic importance
- Poor decisions lead to failed classes, wasted money, and delayed graduation

**The Impact:**
- 30-40% of students drop at least one course during their academic career
- Failed courses cost students $3,000+ in tuition and delay graduation
- Academic stress is a leading cause of college dropout

---

## 2. Our Solution: Dropt (1 min)
**An AI-powered recommendation system that analyzes:**
- Current academic performance and grade projections
- Psychological/emotional toll of continuing
- Course importance (required vs elective)
- Strategic impact on graduation timeline

**Provides:**
- Data-driven keep/drop recommendation (0-90 scale)
- Personalized improvement action plans
- Specific strategies to negotiate with professors

---

## 3. How It Works (2 min)

### Input Process
Students provide:
1. Current grades from assignments, quizzes, exams
   - **NEW: OCR-Powered Input** - Upload syllabus/grade screenshots for instant data extraction
   - Mobile camera integration for quick photo capture
   - Automatic parsing of tables, rubrics, and grade structures
2. Brief stress/wellbeing assessment (1-10 scale)
3. Course info (required? elective? credit hours)
4. Workload context (hours/week, other courses)

### AI Analysis Engine
System evaluates:
- **Academic Performance (40%)**: Current grade, trend, points remaining
- **Course Importance (25%)**: Required vs elective, graduation impact
- **Psychological Health (20%)**: Stress level, time investment
- **Academic Context (15%)**: Total credit hours, GPA impact

### Output Dashboard
- Current grade breakdown with visualizations
- Recommendation score: Keep (70-90), Keep with Support (50-69), Consider Drop (30-49), Drop (<30)
- Risk assessment: probability of failing
- Personalized action plan with specific next steps

---

## 4. Key Features (2 min)

### Smart Data Entry (OCR Technology)
- **Upload & Go**: Take photos of syllabi or grade reports - no manual typing
- **AI-Powered Extraction**: Automatically identifies grading rubrics, weights, and current scores
- **Validation Interface**: Review and confirm extracted data with confidence indicators
- **Time Saver**: Reduces data entry from 10 minutes to 30 seconds

### Enhanced Assignment Management
- **Easy Tracking**: Add, edit, and delete assignments with ease
- **Date Management**: Native date pickers for due dates and submission dates
- **Status Tracking**: Track when assignments are submitted vs due
- **Auto-Refresh**: Real-time updates across the application

### Academic Analysis
- Real-time grade calculation using course rubric
- "What-if" calculator: project grades based on future performance
- Best/worst case scenario projections

### Improvement Roadmap (If Recommending Keep)
- Focus areas: "Your exam scores are low - next exam is 20% of grade"
- Resource suggestions: office hours, tutoring, study groups
- Professor negotiation guide: template emails, talking points, timing advice

### Drop Guidance (If Recommending Drop)
- Timeline: drop deadline, refund amount
- Alternative paths: retake next semester, summer school options
- Damage control: W vs F on transcript, GPA protection

### Psychological Support
- Acknowledges emotional toll
- Stress management resources
- Connects to campus counseling if needed

---

## 5. Technical Architecture (1 min)

**Frontend:**
- React Native with Expo (Mobile First)
- NativeWind for styling
- Interactive visualizations and Date Pickers

**Backend:**
- AWS Amplify Gen 2 (Serverless)
- DynamoDB for scalable data storage
- GraphQL API for real-time data sync
- **OCR Service**: Python/OpenCV prototype for document parsing
- Rule-based algorithm initially, ML enhancement in Phase 3

**Security:**
- FERPA-compliant data protection
- Encrypted storage (including uploaded images)
- Anonymous analytics

---

## 6. Development Roadmap (1 min)

### Phase 1: MVP (4-6 weeks)
- Basic grade input and rubric system
- **Basic OCR**: Upload syllabus/grade screenshots
- Rule-based recommendations
- Simple output report

### Phase 2: Enhanced Features (4-6 weeks)
- User authentication and database
- **Advanced OCR**: Mobile camera, confidence scoring, validation UI
- Psychological assessment
- What-if calculator and visualizations

### Phase 3: AI Enhancement (4-6 weeks)
- Train ML model on historical data
- Personalization engine
- University system integration

### Phase 4: Scale (4-6 weeks)
- Mobile app
- Advisor collaboration tools
- Analytics dashboard

---

## 7. Differentiation (1 min)

**Unlike existing grade calculators:**
- **Effortless Input**: OCR technology eliminates tedious manual data entry
- Holistic: considers mental health, not just numbers
- Proactive: early warning system catches problems before failure
- Actionable: specific strategies, not just "you're failing"
- Strategic: accounts for course importance and graduation impact

**Competitive Advantages:**
- **OCR-First Design**: Only tool with image-to-insight pipeline for students
- First tool to combine academic + psychological analysis
- Provides negotiation templates for professor meetings
- Interactive scenario planning
- Works on mobile - snap a photo and get recommendations

---

## 8. Success Metrics (30 sec)

**User Metrics:**
- Student adoption rate
- Recommendation accuracy (vs actual outcomes)
- Student satisfaction scores
- OCR accuracy rate (correctly extracted data)

**Impact Metrics:**
- Improved semester GPA for users
- Reduced course failure rates
- Decreased academic-related stress (survey data)
- Time saved per student (avg 10 min → 30 sec for data entry)

---

## 9. Market Opportunity (30 sec)

**Target Users:**
- 19+ million college students in US
- Academic advisors and student success offices
- University partnerships (B2B model)

**Revenue Model:**
- Freemium: basic features free, premium $5-10/semester
- University licenses: bulk pricing
- Advisor tools: professional tier

---

## 10. Ethical Considerations (30 sec)

**We prioritize:**
- Transparency: explain why recommendations are made
- Human oversight: students have final decision, not AI
- Privacy: FERPA compliance, encrypted data
- Bias prevention: regular audits of recommendations
- Disclaimers: advisory tool, not replacement for academic advising

---

## 11. Call to Action (30 sec)

**Next Steps:**
- Build MVP with 2-3 pilot courses
- Partner with university student success office for beta testing
- Gather feedback from 50-100 students
- Iterate and scale

**We're looking for:**
- Technical collaborators (frontend, backend, ML)
- Beta testers (students in challenging courses)
- Academic advisor partnerships
- Funding/support for development

---

## Closing Statement

**Dropt doesn't just tell students they're failing—it shows them how to succeed.**

By combining data-driven analysis with psychological awareness and strategic advice, we empower students to make informed decisions about their academic journey, reduce stress, and improve outcomes.

---

## Q&A Preparation

**Anticipated Questions:**

Q: How do you get course rubrics?
A: **OCR technology extracts rubrics directly from syllabus photos/PDFs**; students confirm accuracy; future LMS integration

Q: What if students input incorrect grades?
A: **OCR validation UI shows confidence scores**; students review before finalizing; AI flags suspicious data for manual review

Q: How accurate are recommendations?
A: Phase 1 uses validated weighted scoring; Phase 3 ML model trained on historical outcomes

Q: Privacy concerns?
A: FERPA-compliant, encrypted storage, no data sharing without consent, anonymous analytics only

Q: What makes this better than talking to an advisor?
A: Complements advisors, available 24/7, removes scheduling barriers, provides data advisors can use

Q: How do you prevent students from just dropping everything?
A: System weighs course importance heavily, flags minimum credit hour requirements, encourages improvement plans first
