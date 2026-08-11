# 💡 Curated Mobile App Ideas for RevenueCat Shipaton 2026

> **Source Catalog:** Adapted from HackerEarth & upGrad Hackathon Guides  
> **Selection Criteria:** Mobile app (React Native / Expo), single sharp mechanic, clear RevenueCat monetization model (freemium/subscription), and direct alignment with Shipaton 2026 award tracks (Design, HAMM Paywall, OneSignal).

---

## 📌 Section A: HackerEarth-Inspired Ideas

### 1. 📚 AI Lecture & Note Flashcard Generator (HackerEarth #30 & #34)
* **Core Concept:** Upload class notes, PDF documents, or paste YouTube lecture links $\rightarrow$ AI generates flashcards, quizzes, and practice questions.
* **Tech Stack:** React Native + Expo, OpenAI API, YouTube Transcript API, RevenueCat `react-native-purchases`, OneSignal.
* **RevenueCat Monetization Fit:**
  * **Free:** 3 AI quiz generations / deck creations per day.
  * **Pro ($7.99/mo or $39.99/yr):** Unlimited AI deck generations, YouTube video transcript import, spaced-repetition analytics, and Notion/Anki export.
* **Target Awards:** **HAMM Award** (Clear daily quota paywall), **OneSignal Award** (Daily spaced-repetition quiz notifications).

### 2. 🎙️ Agentic Voice Note & Idea Distiller (HackerEarth #2)
* **Core Concept:** Record unstructured voice memos or meetings $\rightarrow$ AI transcribes, summarizes, and extracts action items, decisions, and reminders.
* **Tech Stack:** React Native + Expo Audio, Whisper API / Apple Speech, RevenueCat `react-native-purchases`, React Native Skia.
* **RevenueCat Monetization Fit:**
  * **Free:** 3 voice recordings per day (up to 2 minutes each).
  * **Pro ($9.99/mo or $49.99/yr):** Unlimited voice recording length, AI action item extraction, Linear/Todoist export, and multi-speaker summary.
* **Target Awards:** **Design Award** (Skia audio waveform visuals), **HAMM Award** (Multipage paywall on voice limit).

### 3. 🥑 SnapNutri AI — Fridge & Food Scanner (HackerEarth #8)
* **Core Concept:** Snap a photo of your fridge, pantry, or meal $\rightarrow$ AI vision identifies ingredients/macros and suggests recipes & meal prep plans.
* **Tech Stack:** React Native + Expo Camera, GPT-4 Vision, RevenueCat `react-native-purchases`, OneSignal.
* **RevenueCat Monetization Fit:**
  * **Free:** 5 photo scans per week.
  * **Pro ($11.99/mo or $59.99/yr):** Unlimited AI photo scans, micronutrient analysis, personalized weekly meal prep plans, and AI diet coach chat.
* **Target Awards:** **HAMM Award** (High-intent paywall trigger at photo limit), **OneSignal Award** (Daily meal prep reminders).

### 4. 🎯 AI Skill & Career Roadmap Generator (HackerEarth #5)
* **Core Concept:** Input a target job title or tech skill gap $\rightarrow$ AI generates a step-by-step personalized learning path with milestone projects.
* **Tech Stack:** React Native + Expo Router, OpenAI API, RevenueCat `react-native-purchases`, Reanimated v3.
* **RevenueCat Monetization Fit:**
  * **Free:** 1 active skill roadmap.
  * **Pro ($8.99/mo or $44.99/yr):** Unlimited active roadmaps, AI mentor Q&A chat, custom project milestone generator, and resume match scoring.
* **Target Awards:** **Design Award** (Interactive 60fps timeline roadmap nodes), **OneSignal Award** (Daily milestone reminders).

### 5. 🏷️ AI Bookmark & Research Vault (HackerEarth #51)
* **Core Concept:** Save web links, code snippets, or screenshots $\rightarrow$ AI automatically categorizes, tags, and builds a searchable research library.
* **Tech Stack:** React Native + Expo Share Sheet extension, local vector embeddings, RevenueCat `react-native-purchases`, Skia.
* **RevenueCat Monetization Fit:**
  * **Free:** Unlimited basic bookmarking & timeline view.
  * **Pro ($7.99/mo or $39.99/yr):** AI cross-link discovery, OCR screenshot extraction, semantic search, and Markdown/Notion sync.
* **Target Awards:** **HAMM Award** (Multipage story paywall on AI feature unlock), **Design Award** (Glassmorphic research canvas).

### 6. ⏱️ Co-Op Focus Timer & Habit Lock (HackerEarth #35 & #52)
* **Core Concept:** Focus timer + distraction blocker + habit tracker with streak visualization and co-op buddy rooms.
* **Tech Stack:** React Native + Expo, Reanimated v3, RevenueCat `react-native-purchases`, OneSignal SDK.
* **RevenueCat Monetization Fit:**
  * **Free:** Basic solo focus timer.
  * **Pro ($5.99/mo or $29.99/yr):** Co-Op buddy focus rooms, streak protection insurance, custom spatial ambient soundscapes, and widget themes.
* **Target Awards:** **Design Award** (Liquid glass timer HUD), **OneSignal Award** (Streak reminder alerts).

---

## 📌 Section B: upGrad-Inspired Ideas

### 7. 💼 ResuFit AI — Mobile Resume & Job Match Optimizer
* **Core Concept:** Upload your resume (PDF/Photo) and snap/paste a LinkedIn job post $\rightarrow$ AI runs OCR & semantic analysis to generate a match score, bullet-point improvements, and a custom cover letter.
* **Tech Stack:** React Native + Expo Camera/DocumentPicker, OpenAI API, RevenueCat `react-native-purchases`, OneSignal.
* **RevenueCat Monetization Fit:**
  * **Free:** 2 free resume match audits per month.
  * **Pro ($9.99/mo or $49.99/yr):** Unlimited job match audits, AI cover letter generator, ATS optimization, and LinkedIn profile review.
* **Target Awards:** **HAMM Award** (High-intent paywall trigger at audit limit), **OneSignal Award** (Daily job application streak pings).

### 8. 💳 SubShield AI — Smart Subscription & Trial Guard
* **Core Concept:** Scans bank receipts, invoices, or screenshots to automatically detect hidden recurring subscriptions, upcoming free-trial expirations, and sudden price hikes.
* **Tech Stack:** React Native + Expo, OCR API, RevenueCat `react-native-purchases`, OneSignal SDK.
* **RevenueCat Monetization Fit:** *(An app about managing subscriptions monetized via RevenueCat!)*
  * **Free:** Basic manual subscription tracking & 1 active trial reminder.
  * **Pro ($6.99/mo or $34.99/yr):** Automated trial expiration alerts, price-hike anomaly detection, and export to Notion/CSV.
* **Target Awards:** **HAMM Award** (Native RevenueCat paywalls), **OneSignal Award** (Critical trial-expiration push notifications).

### 9. 🧘 Postura AI — Camera Ergonomics & Posture Coach
* **Core Concept:** Set your phone on your desk while working. Using on-device camera pose detection (Apple Vision / MLKit), the app monitors your spine alignment in real time and gently vibrates when you slouch.
* **Tech Stack:** React Native + Expo Camera, Apple Vision / MLKit Pose Detection, React Native Skia, RevenueCat `react-native-purchases`.
* **RevenueCat Monetization Fit:**
  * **Free:** 15 minutes of live desk tracking per day.
  * **Pro ($5.99/mo or $29.99/yr):** Unlimited daily posture tracking, guided 3-minute desk stretch routines, and weekly ergonomic health scores.
* **Target Awards:** **Design Award** (Liquid glass skeleton UI & 60fps Skia posture gauges), **OneSignal Award** (Hourly posture break reminders).

### 10. 🎓 InterviewPro AI — Mobile Voice Mock Interviewer
* **Core Concept:** Mobile voice mock interviewer for tech, product, and business roles. Select a role, and AI asks real-time voice questions, evaluates your spoken answer, and grades your confidence, pacing, and keyword usage.
* **Tech Stack:** React Native + Expo Audio, OpenAI Realtime / Whisper API, RevenueCat `react-native-purchases`, Skia.
* **RevenueCat Monetization Fit:**
  * **Free:** 2 mock interview sessions per week.
  * **Pro ($12.99/mo or $59.99/yr):** Unlimited mock interviews, custom company question banks (FAANG/Startups), and AI answer rewrites.
* **Target Awards:** **HAMM Award** (Clear session quota paywall), **Design Award** (Real-time voice waveform HUD).

### 11. 🌿 EcoPulse AI — Gamified Carbon & Habit Tracker
* **Core Concept:** Gamifies daily eco-habits (cycling, zero-waste meal, reusable cup) using AI photo verification and 1-v-1 friend squad duels.
* **Tech Stack:** React Native + Expo, GPT-4 Vision, RevenueCat `react-native-purchases`, OneSignal.
* **RevenueCat Monetization Fit:**
  * **Free:** Basic habit logging and solo streak counter.
  * **Pro ($4.99/mo or $24.99/yr):** Squad eco-challenges, detailed CO₂ reduction metrics, and custom Skia badge themes.
* **Target Awards:** **Design Award** (Skia green fluid aura visuals), **OneSignal Award** (Daily eco-habit reminders).

---

## 📊 Master Summary Matrix

| # | Concept Name | Domain | RevenueCat Paywall Fit | Target Award Potential |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Lecture & Quiz AI | Education | 3 Free Quizzes/Day $\rightarrow$ Pro | HAMM + OneSignal |
| **2** | Voice Note Distiller | Audio / Productivity | 3 Memos/Day $\rightarrow$ Pro | Design + HAMM |
| **3** | SnapNutri Food Scanner | Health & Fitness | 5 Scans/Week $\rightarrow$ Pro | HAMM + OneSignal |
| **4** | Skill Roadmap AI | Career / Tech | 1 Active Roadmap $\rightarrow$ Pro | Design + OneSignal |
| **5** | AI Research Vault | Knowledge Management | Basic Bookmarks $\rightarrow$ Pro | HAMM + Design |
| **6** | Co-Op Focus Timer | Productivity | Solo Timer $\rightarrow$ Pro | Design + OneSignal |
| **7** | ResuFit AI | Career / Job Search | 2 Free Audits $\rightarrow$ Pro | HAMM + OneSignal |
| **8** | SubShield AI | Fintech / Subscriptions | 1 Trial Alert $\rightarrow$ Pro | HAMM + OneSignal |
| **9** | Postura AI | Health & Wellness | 15m/day Free $\rightarrow$ Pro | Design + OneSignal |
| **10** | InterviewPro AI | Education / Career | 2 Interviews/week $\rightarrow$ Pro | HAMM + Design |
| **11** | EcoPulse AI | Sustainability / Social | Basic Tracker $\rightarrow$ Pro | Design + OneSignal |
