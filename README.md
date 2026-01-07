# Dropt - AI-Powered Course Drop Recommendation System

**AI-powered mobile app helping students make data-driven decisions on dropping courses. Analyzes grades, mental health, and graduation impact to provide personalized recommendations. Built with React Native, Expo, and AWS Amplify.**

## Overview

Dropt is an intelligent academic assistant that goes beyond simple grade calculation. By weighing academic performance against psychological well-being and course importance, it helps students decide whether to keep or drop a struggling class and provides actionable strategies for improvement.

## Key Features

### 🧠 Intelligent Analysis
*   **Smart Recommendations:** Uses a weighted algorithm (Academic 60%, Stress 10%, Context 30%) to generate 'Safe', 'At Risk', or 'Critical' statuses.
*   **"Battle Zone" Logic:** Dynamically adjusts risk sensitivity when students are within 15% of the passing threshold.
*   **High-Grade Immunity:** Automatically protects high-performing students (>=85%) from "Drop" recommendations, regardless of stress levels.

### 📊 Data-Driven Tools
*   **Psychological Assessment Wizard:** A multi-step questionnaire that quantifies subjective metrics like stress, sleep quality, and overall wellbeing into actionable data.
*   **AI Insight Engine:** Provides personalized, context-aware advice. *Note: Specifically programmed to prioritize passing; never recommends dropping if a student is within 10 points of the passing mark.*
*   **What-If Calculator:** Simulate future grades to see if recovery is possible.
*   **OCR Data Entry:** Instantly import syllabus and grade data via camera/image upload.

### 📱 Modern Experience
*   **Offline-First:** Caches AI insights and course data for instant loading.
*   **Visual Analytics:** Clean, color-coded dashboards for grade distribution and risk assessment.

## Tech Stack

*   **Frontend:** React Native (Expo), TypeScript, NativeWind (Tailwind CSS)
*   **Backend:** AWS Amplify Gen 2 (DynamoDB, GraphQL, Cognito)
*   **AI/ML:** Google Gemini 2.5 (via API) for insights and OCR
*   **Testing:** Vitest

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   AWS Account (for Amplify backend)
*   Google Cloud API Key (for Gemini AI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/dropt.git
    cd dropt
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Set the Gemini API Key as a secret in your Amplify backend:
    ```bash
    npx ampx sandbox secret set GEMINI_API_KEY
    ```
    Enter your Google Cloud API Key when prompted.

4.  **Run the app:**
    ```bash
    npx expo start
    ```

## Security & Production Considerations

*   **API Key Management:** The Gemini API Key is securely stored in AWS Systems Manager Parameter Store and accessed via an AWS Lambda function (`ai-handler`). It is **not** exposed in the client bundle.
*   **Data Privacy:** All student data is isolated using AWS Cognito User Pools. The database schema uses `allow.owner()` rules to ensure users can only access their own records.
*   **AI Safety:** The AI model is strictly prompted to prioritize academic success and is programmatically restricted from suggesting "Drop" when a student is close to passing.

## Documentation

Detailed documentation can be found in the `docs/` directory:
*   [Architecture](docs/ARCHITECTURE.md)
*   [Project Blueprint](docs/PROJECT_BLUEPRINT.md)
*   [Bugs and Fixes](docs/BUGS_AND_FIXES.md)

## License

[MIT License](LICENSE)
