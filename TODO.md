# 🚀 MindMesh — Shipathon Next-Gen Action Roadmap (TODO)

> **Target**: RevenueCat Shipathon 2026 — Next-Gen Award Submission  
> **Repository**: Open-source React Native + Expo App with RevenueCat Monetization  
> **Last Updated**: September 2026

---

## 🏆 Tier 1: RevenueCat Ecosystem *(Top Priority for Shipathon Judges)*

- [ ] **RevenueCat Paywall v2 UI Integration (`react-native-purchases-ui`)**
  - [ ] Implement declarative `RevenueCatUI.Paywall` or `PaywallFooterContainer` for remote-configured paywalls.
  - [ ] Support dynamic offerings and A/B test experiments configured directly from the RevenueCat dashboard.
  - [ ] Add a reliable "Restore Purchases" button with clear success/failure feedback.

- [ ] **Real-Time Entitlement State Synchronization**
  - [ ] Attach `Purchases.addCustomerInfoUpdateListener` inside `useMemoryStore` to dynamically reflect Pro status across the app without restarts.
  - [ ] Securely gate premium features: Unlimited Serendipity Connections, Full 4-Tab Build Plans, and Notion/Markdown Exports.

- [ ] **Subscriber Attributes & Monetization Analytics**
  - [ ] Set user attributes via `Purchases.setAttributes({ captures_count, discoveries_count })`.
  - [ ] Track paywall impression and conversion events for analytics.

---

## 🎨 Tier 2: "Build in Public" & Social Virality

- [ ] **1-Tap Social Story Cards (`react-native-view-shot` + `expo-sharing`)**
  - [ ] Render a sleek, branded dark-cyber visual card summarizing discovered connections and Build Plans.
  - [ ] Export directly to Instagram Stories, X (Twitter), and LinkedIn with a single tap.

- [ ] **Export to Markdown & Notion Workspace**
  - [ ] Add 1-tap "Copy as Markdown" for Build Plans (PRD, Tech Schema, RevenueCat Strategy, Task Checklist).
  - [ ] Implement direct export to Notion or file download for indie founders.

---

## 📱 Tier 3: Native Device Polish & Delight

- [ ] **Tactile Haptic Feedback (`expo-haptics`)**
  - [ ] Trigger subtle haptic clicks on memory capture, Synaptic Fusion completion, and checkbox toggling.

- [ ] **Hardware-Backed Secure Key Storage (`expo-secure-store`)**
  - [ ] Encrypt user-provided Gemini BYOK API keys inside iOS Keychain / Android Keystore instead of plaintext storage.

- [ ] **Local Serendipity Push Notifications (`expo-notifications`)**
  - [ ] Schedule a smart daily notification: *"A thought you captured yesterday connects with a note from last week. Tap to discover."*

---

## 🧠 Tier 4: Knowledge Graph & Offline Intelligence

- [ ] **Inverted Index Candidate Pruning**
  - [ ] Implement `Map<tag, Set<memoryId>>` candidate lookups to maintain $O(K)$ speed as vaults scale past 1,000+ items.
  - [ ] Pre-tokenize memories at ingestion time (`addMemory`) to keep the Discover screen instant.

- [ ] **Multi-Memory Clique Build Plan Generator**
  - [ ] Connect `KnowledgeGraphEngine.findMultiNodeClique` into the Build Plan creation modal for 3-to-5 node synthesis.

---

## 📦 Tier 5: Next-Gen Submission Checklist *(Mandatory)*

- [ ] **Open-Source MIT License (`LICENSE`)**
  - [ ] Add standard MIT license to the repository root (strictly required by Shipathon Next-Gen rules).

- [ ] **Showcase `README.md`**
  - [ ] Add app overview, high-resolution screenshots/GIFs, architecture diagram, and setup instructions.
  - [ ] Highlight the RevenueCat monetization architecture prominently.

- [ ] **2–3 Minute Demo Video**
  - [ ] Script and record the walkthrough:
    1. **Problem**: Scattered screenshots, bookmarks, and notes get forgotten.
    2. **Magic**: On-device Knowledge Graph discovers hidden connections and particle fusion.
    3. **Monetization**: RevenueCat paywall gate unlocking AI deep-dive & Build Plans.
    4. **Execution**: Exporting complete PRD and RevenueCat monetization strategies.
