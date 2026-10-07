# Student Utility Features - Description & Implementation Roadmap 🎓

This document describes the three new student utility features to be added to the Unicoach application. These features are designed to provide high-value, self-service tools for study abroad aspirants, boosting student engagement and driving leads to our admissions counselors.

---

## 1. AI SOP Draft Builder 📝🤖
An interactive Statement of Purpose (SOP) generator inside the student dashboard.

* **What it is**: A multi-step questionnaire that guides students through their academic background, projects, work experience, target course, target university, and motivation.
* **How it works**: Based on the inputs, a client-side templating engine dynamically compiles a high-quality, professional 5-paragraph SOP draft tailored to the student's profile.
* **Benefits to Student**:
  * Writing an SOP is the most daunting task of studying abroad. This builder provides an instant, structured starting template for free.
  * Saves hours of manual outlining.
* **Technical Setup**:
  * **Frontend**: Added as a new tab **"SOP Builder"** in [UserDashboard.jsx](file:///c:/unicoach/frontend/src/components/UserDashboard.jsx). Built using a clean step-by-step React form.
  * **Backend & Storage**: No server-side API or API key subscriptions needed; executes entirely client-side. The compiled draft can be copied or downloaded as a text file.
  * **Database Record (Optional)**: If logged in, we can save their current draft parameters in their profile schema.

---

## 2. Study Abroad Budget & Cost Calculator 💸📊
An interactive financial planning tool for estimating study and living costs.

* **What it is**: A calculator tab where students specify their target country (USA, UK, Canada, Australia), target degree (Masters, Bachelors), and select accommodation styles to view detailed cost breakdowns.
* **How it works**: Estimates annual tuition fees, living expenses (rent, food, insurance, transport), and highlights popular scholarships matching their target country.
* **Benefits to Student**:
  * Instantly helps plan study budgets.
  * Demystifies "hidden costs" (like health insurance or groceries) before departing.
* **Technical Setup**:
  * **Frontend**: Added as a new tab **"Cost Calculator"** in the dashboard.
  * **Static Dataset**: A localized JSON structure containing standard tuition ranges, living cost indices, and scholarship criteria for USA, UK, Canada, and Australia.
  * **Backend**: None required; operates client-side for maximum rendering performance.

---

## 3. IELTS Mock Writing Simulator 🕒✍️
A realistic exam simulation tool for IELTS Writing Task 2.

* **What it is**: A practice environment mimicking the computer-delivered IELTS writing section.
* **How it works**: Renders a random IELTS Essay topic prompt with a 40-minute countdown timer and a text area with word counter and live spelling help.
* **Benefits to Student**:
  * Allows students to practice sustained timed typing.
  * Keeps track of their writing practice history.
* **Technical Setup**:
  * **Frontend**: Added as a new tab **"IELTS Simulator"** in the dashboard.
  * **Backend**: 
    * A new route `POST /api/writing/ielts` in the backend.
    * A new database schema `IeltsAttempt` to store student essays, word counts, and completion times.
  * **Database Schema (`IeltsAttempt.js`)**:
    * `studentId` (reference to User)
    * `prompt` (string)
    * `essay` (string)
    * `wordCount` (number)
    * `timeSpent` (number, seconds)
    * `createdAt` (date)

---

## Step-by-Step Implementation Roadmap

1. **Step 1: AI SOP Draft Builder**:
   * Add the React form interface and generation algorithm to the frontend.
   * Add a download `.txt` capability.
2. **Step 2: Study Abroad Cost Calculator**:
   * Integrate country financial datasets.
   * Add the visual cost breakdown sliders and target charts.
3. **Step 3: IELTS Mock Writing Simulator**:
   * Create the backend `IeltsAttempt` mongoose model and routes.
   * Build the writing interface with timers and history logs.
