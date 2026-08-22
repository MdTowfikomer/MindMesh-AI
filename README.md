# MindMesh AI

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK-22c55e?style=for-the-badge&logo=android&logoColor=white)](https://github.com/MdTowfikomer/MindMesh-AI/releases/latest/download/app-release.apk)
[![Release Version](https://img.shields.io/github/v/release/MdTowfikomer/MindMesh-AI?style=for-the-badge&color=8b5cf6)](https://github.com/MdTowfikomer/MindMesh-AI/releases)
[![Expo](https://img.shields.io/badge/Expo-54.0.37-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)

> **MindMesh AI** is your second brain and multimodal knowledge engine. Capture fleeting thoughts via voice, analyze screenshots, store text clips, and let on-device AI synthesize connections and serendipitous insights across everything you remember.

---

## 📱 Quick Download & Install

You can download and install the standalone release APK directly on your Android device:

👉 **[Download Latest app-release.apk](https://github.com/MdTowfikomer/MindMesh-AI/releases/latest/download/app-release.apk)**

Or browse all versions on the **[GitHub Releases Page](https://github.com/MdTowfikomer/MindMesh-AI/releases)**.

### Android Installation Steps:
1. Tap the download link above on your Android phone.
2. Once downloaded, open the `app-release.apk` file.
3. If prompted, enable **"Install unknown apps"** in your device settings for your browser/file manager.
4. Tap **Install** and launch **MindMesh AI**!

---

## ✨ Features

- **🎙️ Voice Capture & Whisper AI**: Instant voice memo recording with on-device transcription and automated summarization.
- **📸 Vision AI & Screenshot Extraction**: Extract key insights, context, and actionable knowledge from images and screenshots.
- **🧠 Serendipity Engine & Discovery Cards**: Discovers non-obvious connections across captured memories to resurface relevant ideas when you need them.
- **⚡ Android Share Sheet Integration**: Share URLs, reels, text, and images from any app directly into MindMesh AI seamlessly.
- **🔒 Bring-Your-Own-Key (BYOK) Security**: Secure storage of your AI provider keys directly on your device.
- **💎 CyberLuxury UI/UX**: Dark mode aesthetic, fluid reanimated transitions, custom sound design, and haptic feedback.

---

## 🛠️ Tech Stack

- **Framework**: React Native with Expo Router (SDK 54)
- **Local Database**: Expo SQLite with encrypted local persistence
- **Animation & Visuals**: React Native Reanimated 4, Shopify React Native Skia
- **AI Integrations**: Groq Whisper, OpenAI / Gemini Vision & Chat completions
- **State Management**: Zustand
- **Payments**: RevenueCat integration ready

---

## 💻 Development Setup

To run and build MindMesh AI locally:

### 1. Clone the repository
```bash
git clone https://github.com/MdTowfikomer/MindMesh-AI.git
cd MindMesh-AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm start
```

### 4. Build Android Release APK
```bash
cd android
./gradlew assembleRelease
```
The generated APK will be in:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 📄 License
MIT License. Created by [Md Towfik Omer](https://github.com/MdTowfikomer).
