# MindMesh — iQOO Hackathon Submission (Productivity Track)

## 1. Idea Title
**MindMesh: On-Device Thought Weaver & Markdown Synthesis Engine**

*(Alternative options:)*
- `MindMesh AI: Turn Scattered Posts & Ideas into Connected Knowledge on iQOO`
- `MindMesh: Edge-Native Knowledge Graph & Auto-Markdown Generator for iQOO`

---

## 2. Description (For Registration Form)

> **MindMesh** is an edge-native cognitive copilot engineered for iQOO devices and hybrid desktop workflows. It solves everyday information overload by turning scattered social posts, fleeting voice notes, and screenshots into interconnected, structured knowledge.
>
> When browsing the web or social media, users can **share any post directly to MindMesh** via the native Android Share Sheet. Instead of letting bookmarks gather digital dust, MindMesh's **on-device Snapdragon NPU** instantly scans your personal knowledge base, uncovers hidden conceptual links with your past scattered notes and voice memos, and synthesizes everything into a beautifully structured **Markdown (`.md`) document**.
>
> **Core Pillars:**
> 1. **Zero-Friction Post & Thought Capture:** Share any post, article, tweet, or screenshot straight into MindMesh. On-device SLMs extract key arguments and intent in milliseconds.
> 2. **Scattered Thought Weaver (NPU-Powered):** Vector search and semantic clustering run locally on the Snapdragon NPU to surface non-obvious connections between what you just saw and what you already know—completely offline and private.
> 3. **Instant Markdown (`.md`) Synthesis:** Automatically writes a synthesized `.md` file connecting the dots with action items, references, and insights.
> 4. **Seamless Office Kit Bridge:** When you sit at your desk, Office Kit automatically mirrors the synthesized `.md` files to your laptop, ready for Obsidian, Notion, VS Code, or deeper compute work.

---

## 3. Generated Markdown (.md) File Naming Convention in MindMesh

When MindMesh connects your thoughts and generates the `.md` file, it automatically uses the **semantic slug + ISO date format**:

### Format:
```
YYYY-MM-DD-[topic-slug].md
```

### Examples:
- `2026-09-10-agentic-rag-architectures.md`
- `2026-09-10-snapdragon-npu-optimization.md`
- `2026-09-10-revenuecat-onboarding-insights.md`

### Why this format?
1. **Universal Obsidian & Notion Compatibility:** Chronological sorting and clean file browsing in any markdown knowledge base.
2. **Deterministic & Human-Readable:** Generated on-device by extracting the primary 2–4 word conceptual theme from the shared post and your related memories.
3. **No Name Collisions:** Appends a timestamp suffix (`...-hhmm.md`) if multiple syntheses occur on the same topic in one day.

---

## 4. Minimalistic Gamma PPT Generation Prompt

*(Copy and paste directly into [Gamma.app](https://gamma.app))*

```markdown
Create a clean, highly minimalistic 8-slide pitch deck presentation for an AI Hackathon entry.

Theme & Aesthetic:
- Minimalist Japanese/Scandinavian tech aesthetic.
- Clean off-white/light gray or deep matte black background, high contrast, generous whitespace.
- Crisp modern sans-serif typography, subtle thin divider lines, and restrained accent colors.
- Avoid cluttered visuals; focus on clarity, elegant card layouts, and crisp workflows.

---

Slide 1: Title Slide
- Title: MindMesh
- Subtitle: The On-Device Thought Weaver & Markdown Knowledge Engine
- Track: Productivity Track | iQOO AI Hackathon
- Tagline: Share any post. Connect your scattered thoughts. Generate structured Markdown—powered locally by the Snapdragon NPU and Office Kit.

Slide 2: The Problem: The "Save Later" Cemetery
- Modern information intake is fractured: We bookmark posts, capture screenshots, and record voice notes across 10 different apps.
- Disconnected ideas: Saved content sits idle and never connects with our actual projects or thoughts.
- Privacy & Latency friction: Uploading personal ideas and proprietary notes to cloud AI models is slow, costly, and breaches privacy.

Slide 3: The Solution: Ambient Thought Synthesis
- MindMesh transforms your iQOO smartphone into a private thinking partner.
- 1-Tap Post Ingestion: Share any social post, webpage, or screenshot directly into MindMesh.
- Thought Synthesis Engine: Finds latent connections between the new post and your past scattered notes.
- Instant Output: Automatically compiles insights into a clean Markdown (.md) document with citations, takeaways, and next actions.

Slide 4: The 3-Step Core Workflow
- Step 1: Share Post -> Native Android share sheet passes URL/text/media to MindMesh in 1 click.
- Step 2: NPU Deep Link -> Snapdragon NPU vectorizes the content and queries your local knowledge graph to map overlapping concepts.
- Step 3: Markdown (.md) Generation -> Generates a structured .md file linking the new post with related ideas, ready for your second brain.

Slide 5: Snapdragon NPU: Local, Instant & Private
- True Edge Intelligence: Runs quantized open-source models (SLMs + Whisper) directly on the Hexagon NPU.
- 100% On-Device Privacy: Your thoughts, notes, and browsing history never leave the device.
- Sub-Second Latency: Instant embeddings and semantic comparisons without waiting for cloud API round-trips.
- Works Completely Offline: Fly, commute, or travel without losing your second brain.

Slide 6: Hybrid Office Kit Bridge
- Seamless Phone-to-Laptop Mesh: Connects the iQOO phone directly to your workstation via Office Kit.
- Instant File Handoff: Synthesized .md files appear immediately in your desktop workspace (Obsidian, Notion, VS Code).
- Dynamic Compute Scaling: Leverage laptop compute or free weekend AI credits when synthesizing complex multi-document research projects.

Slide 7: Why MindMesh Wins on Productivity
- From Hoarding to Knowing: Replaces passive bookmarking with proactive, interconnected note creation.
- Markdown First: Universal, portable, future-proof format that integrates with every modern developer and knowledge worker stack.
- Zero Context Switching: No need to copy-paste or reformat notes manually; AI does the heavy lifting in the background.

Slide 8: Roadmap & Vision
- Hackathon MVP: One-tap post ingestion, on-device NPU vector linking, automated .md export, and Office Kit sync.
- Future Expansion: Proactive context cards during meetings, voice-driven Markdown editor, and multi-device collaborative thought mesh.
- Closing: MindMesh on iQOO — Think freely, connect effortlessly.
```
