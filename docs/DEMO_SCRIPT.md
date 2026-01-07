# Dropt - Live Presentation Script

**Target Audience:** Class/Professor  
**Duration:** ~10-12 Minutes  
**Goal:** Demonstrate how Dropt uses AI and data to help students make smarter academic decisions.

---

## 0. Setup & Prerequisites
*   **Device:** Run on iOS Simulator or Web Browser (Chrome recommended).
*   **State:** Logged out (or ready to log in).
*   **Data:** Have a "failing" course (e.g., "Calculus I" with a 55% grade) and a "syllabus" image ready for the OCR demo.

---

## 1. Introduction (1 Minute)

**Speaker:**
"Hi everyone. We've all been there—it's mid-semester, you're struggling in a class, and you have to decide: do I keep pushing, or do I drop it to save my GPA?

Usually, we make this decision based on gut feeling or panic. But what if you could make it based on data?

This is **Dropt**. It's an AI-powered academic strategist that helps students decide whether to keep or drop a course by analyzing their grades, stress levels, and workload. Let me show you how it works."

---

## 2. The Dashboard (2 Minutes)

**Action:** *Log in to the app. Land on the Dashboard.*

**Speaker:**
"Here is the student dashboard. It’s designed to be a command center.
*   **Top Left:** You see my active course load.
*   **Center:** The 'Quick Actions' grid gives me instant access to tools like the GPA Calculator, OCR Scanner, and Deadline Tracker.
*   **Sidebar:** On the right (or bottom on mobile), I have my 'Recent Activity' showing upcoming deadlines color-coded by urgency."

**Action:** *Scroll through the dashboard briefly.*

**Speaker:**
"The interface is built with **React Native** and **NativeWind**, so it works seamlessly on both iOS and Web with a unified codebase."

---

## 3. The Problem: Analyzing a Struggle (3 Minutes)

**Action:** *Navigate to the 'Drop Analysis' tool.*

**Speaker:**
"Let's look at the core feature: **Drop Analysis**.
I'm currently taking 'Calculus I', and honestly, it's not going well.

The algorithm here isn't just looking at my grade. It calculates a **Risk Score** based on four factors:
1.  **Academic Performance (60%)**
2.  **Course Importance (20%)** - Is it required for my major?
3.  **Stress Level (10%)** - How much is this affecting my mental health?
4.  **Workload (10%)** - How many hours am I putting in?"

**Action:** *Click on the 'Calculus I' card (ensure it has a low grade, e.g., <60%).*

**Speaker:**
"You can see here my risk is 'Critical'. My grade is 55%, but my stress is at a 9/10.
However, notice the **AI Advice** at the bottom. Because I'm within 10 points of passing, the AI—powered by **Google Gemini 2.5 Flash**—doesn't just say 'Drop it'. It says:
*'You are within striking distance. Dropping now would be a waste of effort. Focus on the next exam.'*

This 'Battle Zone' logic prevents students from dropping courses they can actually save."

---

## 4. The Solution: Adding a New Course via OCR (3 Minutes)

**Speaker:**
"Now, let's say I decide to drop Calculus and pick up an easier elective, 'Intro to Psychology'.
Entering syllabus data manually is a pain. So, I built an **OCR Scanner**."

**Action:**
1.  *Go to 'Tools' > 'Scan Syllabus'.*
2.  *Select 'Syllabus' mode.*
3.  *Upload the sample syllabus image.*
4.  *Wait for the 'Success' alert.*

**Speaker:**
"I just uploaded a photo of the syllabus. The app sends this to a secure **AWS Lambda** function, which uses Gemini's vision capabilities to extract the text."

**Action:** *The app auto-navigates to the 'Add Course' screen.*

**Speaker:**
"And just like that, it extracted:
*   Course Name & Code
*   Instructor Info
*   Office Hours
*   **Most importantly:** The Grading Breakdown (Homework 20%, Exams 40%, etc.)

I didn't type a single thing. I just review it, and click 'Create Course'."

**Action:** *Click 'Create Course'.*

---

## 5. Planning Ahead: The "What-If" Calculator (2 Minutes)

**Action:** *Go to the newly created course (or an existing one).*
**Action:** *Click 'Calculator' icon.*

**Speaker:**
"Finally, I need to know if I can actually get an A in this new class.
This is the **What-If Calculator**. It lets me simulate future grades."

**Action:**
1.  *Tap 'Best Case' (Simulates 100% on everything).*
2.  *Tap 'Worst Case' (Simulates 0% on everything).*
3.  *Manually edit a 'Final Exam' score to see the impact.*

**Speaker:**
"I can instantly see my 'Best Case' scenario. If I ace everything, I get a 98%.
If I bomb the final, I drop to a C.
This real-time feedback helps me prioritize my study time effectively."

---

## 6. Conclusion (1 Minute)

**Action:** *Navigate back to Dashboard.*

**Speaker:**
"To wrap up, Dropt isn't just a grade tracker. It's a decision support system.
By combining **AWS Amplify** for the backend, **React Native** for the frontend, and **Google Gemini** for intelligence, it helps students navigate the most stressful parts of their academic journey with confidence.

Thank you! I'm happy to answer any questions."
