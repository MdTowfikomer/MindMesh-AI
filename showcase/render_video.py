import os
import sys
import math
import struct
import wave
import subprocess
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = "showcase/render_frames"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH = 1080
HEIGHT = 1920
FPS = 30
DURATION = 28 # 28 seconds
TOTAL_FRAMES = FPS * DURATION

print(f"🎬 Generating {TOTAL_FRAMES} frames ({DURATION}s @ {FPS}fps, {WIDTH}x{HEIGHT})...")

# Color palette
BG_DARK = (7, 8, 11)
CARD_BG = (17, 19, 25)
CYAN = (56, 189, 248)
PURPLE = (139, 92, 246)
INDIGO = (99, 102, 241)
EMERALD = (16, 185, 129)
AMBER = (245, 158, 11)
WHITE = (248, 250, 252)
SLATE = (148, 163, 184)
MUTED = (100, 116, 139)

def draw_pill(draw, x, y, w, h, fill, outline=None, r=10):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill, outline=outline, width=2)

def draw_grid_background(draw):
    step = 48
    for x in range(0, WIDTH, step):
        draw.line([(x, 0), (x, HEIGHT)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, HEIGHT, step):
        draw.line([(0, y), (WIDTH, y)], fill=(255, 255, 255, 6), width=1)

# Generate frames
for frame_idx in range(TOTAL_FRAMES):
    t = frame_idx / FPS
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    draw = ImageDraw.Draw(img)
    draw_grid_background(draw)

    # ─── TOP BRAND HEADER (Persistent) ───
    draw_pill(draw, 80, 80, 920, 90, (14, 16, 23), outline=(255, 255, 255, 20), r=24)
    draw.ellipse([110, 102, 155, 147], fill=CYAN)
    draw.text((180, 104), "MindMesh AI", fill=WHITE, font=None)
    draw.text((180, 130), "Multimodal Second Brain", fill=SLATE, font=None)
    draw_pill(draw, 780, 102, 190, 44, (56, 189, 248, 30), outline=CYAN, r=12)
    draw.text((805, 116), "v0.2.2 RELEASE", fill=CYAN, font=None)

    # ─── SCENE 1: HOOK (0s - 6s) ───
    if t < 6.0:
        p = t / 6.0
        # Kinetic Heading
        draw.text((100, 260), "TRADITIONAL NOTES BECOME", fill=SLATE, font=None)
        draw.text((100, 310), "DIGITAL GRAVEYARDS.", fill=(239, 68, 68), font=None)

        # Phone Frame Simulator
        phone_y = 440 + math.sin(t * 2) * 10
        draw_pill(draw, 140, phone_y, 800, 1180, (13, 15, 21), outline=(255, 255, 255, 30), r=60)
        draw_pill(draw, 170, phone_y + 30, 740, 1120, (18, 20, 28), outline=(255, 255, 255, 15), r=45)

        # Chaotic old notes cards (simulating mess)
        for i in range(4):
            offset = i * 210
            card_alpha = min(255, int(p * 350))
            draw_pill(draw, 210, phone_y + 120 + offset, 660, 170, (26, 29, 39), outline=(255, 255, 255, 25), r=20)
            draw.text((250, phone_y + 150 + offset), f"Untitled Note #{i+1} (Forgotten)", fill=WHITE, font=None)
            draw.text((250, phone_y + 195 + offset), "Captured 4 months ago • Never opened again", fill=MUTED, font=None)

        # Bottom punchline banner
        draw_pill(draw, 120, 1700, 840, 110, (56, 189, 248, 25), outline=CYAN, r=26)
        draw.text((220, 1740), "MindMesh AI changes everything ➔", fill=CYAN, font=None)

    # ─── SCENE 2: MULTIMODAL 1-TAP CAPTURE (6s - 13s) ───
    elif t < 13.0:
        st = t - 6.0
        draw.text((100, 250), "1-TAP CAPTURE • 75% LESS FRICTION", fill=CYAN, font=None)
        draw.text((100, 300), "VOICE & SCREENSHOT OCR", fill=WHITE, font=None)

        phone_y = 420
        draw_pill(draw, 140, phone_y, 800, 1220, (13, 15, 21), outline=(255, 255, 255, 30), r=60)
        draw_pill(draw, 170, phone_y + 30, 740, 1160, (10, 12, 17), outline=(255, 255, 255, 15), r=45)

        # Audio Waveform Card (28 Bars)
        draw_pill(draw, 210, phone_y + 100, 660, 460, (20, 24, 34), outline=(139, 92, 246, 80), r=24)
        draw.text((250, phone_y + 130), "Voice Memo: Architecture Brainstorm", fill=WHITE, font=None)
        draw.text((250, phone_y + 165), "Gemini 3.5 Flash Audio • 100% Audible", fill=PURPLE, font=None)

        # Draw 28 Waveform Bars with animated pulsing heights
        wave_base_x = 240
        num_bars = 26
        for b in range(num_bars):
            pulse = math.sin(st * 6 + b * 0.4) * 0.5 + 0.5
            bar_h = 30 + pulse * 90
            bx = wave_base_x + b * 23
            by = phone_y + 340 - bar_h / 2
            bar_color = CYAN if b < 14 else PURPLE
            draw.line([(bx, by), (bx, by + bar_h)], fill=bar_color, width=8)

        # Playback speeds
        draw_pill(draw, 240, phone_y + 450, 80, 40, (139, 92, 246), r=10)
        draw.text((265, phone_y + 460), "1.5x", fill=WHITE, font=None)
        draw.text((350, phone_y + 460), "1x", fill=MUTED, font=None)
        draw.text((410, phone_y + 460), "2x", fill=MUTED, font=None)

        # Screenshot OCR Card
        draw_pill(draw, 210, phone_y + 610, 660, 460, (20, 24, 34), outline=(245, 158, 11, 80), r=24)
        draw.text((250, phone_y + 640), "Screenshot Vision OCR", fill=WHITE, font=None)
        draw.text((250, phone_y + 675), "Gemini 3.5 Flash Vision API", fill=AMBER, font=None)

        draw_pill(draw, 250, phone_y + 730, 580, 160, (14, 16, 23), outline=(255, 255, 255, 20), r=16)
        draw.text((275, phone_y + 760), "\"RevenueCat Paywall Rule: $19.99/mo\"", fill=WHITE, font=None)
        draw.text((275, phone_y + 805), "#Pricing • #Shipaton • #MobileUX", fill=CYAN, font=None)

    # ─── SCENE 3: 2D SPATIAL KNOWLEDGE GRAPH (13s - 21s) ───
    elif t < 21.0:
        st = t - 13.0
        draw.text((100, 250), "2D SPATIAL KNOWLEDGE GRAPH", fill=CYAN, font=None)
        draw.text((100, 300), "PINCH TO ZOOM • 360° INFINITE PAN", fill=WHITE, font=None)

        # Giant Canvas Frame
        canvas_y = 380
        draw_pill(draw, 100, canvas_y, 880, 1260, (12, 14, 20), outline=(56, 189, 248, 80), r=36)

        # Center animated node coordinates
        cx = 540 + math.cos(st * 1.5) * 40
        cy = 960 + math.sin(st * 1.5) * 40
        zoom = 1.0 + math.sin(st * 1.2) * 0.25 # Pinch zoom simulation

        # Satellite Nodes
        satellites = [
            ("Pricing Model", CYAN, -260 * zoom, -220 * zoom),
            ("Voice Thought", PURPLE, 240 * zoom, -240 * zoom),
            ("Offline SQLite", EMERALD, -220 * zoom, 280 * zoom),
            ("Gemini Vision", AMBER, 260 * zoom, 240 * zoom),
            ("Serendipity Hub", (236, 72, 153), 0, -380 * zoom),
        ]

        # Draw connecting line edges
        for name, col, sx, sy in satellites:
            draw.line([(cx, cy), (cx + sx, cy + sy)], fill=col, width=4)

        # Draw center node
        draw.ellipse([cx - 55, cy - 55, cx + 55, cy + 55], fill=CYAN, outline=WHITE, width=4)
        draw.text((cx - 40, cy - 10), "MindMesh", fill=BG_DARK, font=None)

        # Draw satellite circles
        for name, col, sx, sy in satellites:
            nx = cx + sx
            ny = cy + sy
            draw.ellipse([nx - 42, ny - 42, nx + 42, ny + 42], fill=col, outline=WHITE, width=3)
            draw_pill(draw, nx - 80, ny + 50, 160, 44, (16, 18, 24), outline=(255, 255, 255, 30), r=12)
            draw.text((nx - 60, ny + 62), name, fill=WHITE, font=None)

        # Inspect Dock Overlay
        draw_pill(draw, 140, 1470, 800, 130, (18, 21, 30), outline=CYAN, r=24)
        draw.text((180, 1500), "#Pricing • Paywall Strategy", fill=CYAN, font=None)
        draw.text((180, 1540), "Inspect Thought: RevenueCat Monthly Rules", fill=WHITE, font=None)

    # ─── SCENE 4: SYNAPTIC FUSION & PRD (21s - 28s) ───
    else:
        st = t - 21.0
        draw.text((100, 250), "SYNAPTIC FUSION & BUILD PLANS", fill=AMBER, font=None)
        draw.text((100, 300), "IDEAS TO SHIPPABLE BLUEPRINTS", fill=WHITE, font=None)

        card_y = 420
        draw_pill(draw, 100, card_y, 880, 1180, (14, 17, 24), outline=AMBER, r=36)

        draw_pill(draw, 140, card_y + 60, 800, 170, (23, 27, 39), outline=(245, 158, 11, 80), r=20)
        draw.text((180, card_y + 90), "AI Serendipity Discovered Connection", fill=AMBER, font=None)
        draw.text((180, card_y + 130), "Linked: Voice Waveform + RevenueCat Paywall Model", fill=WHITE, font=None)

        # PRD Section
        draw_pill(draw, 140, card_y + 270, 800, 780, (10, 12, 17), outline=(255, 255, 255, 20), r=24)
        draw.text((180, card_y + 310), "AUTOMATED PRD SPECIFICATION (P0)", fill=CYAN, font=None)
        
        specs = [
            "Problem: Disorganized voice ideas fail to generate revenue.",
            "Core P0: 28-bar waveform scrubbing with speed toggles.",
            "Database: SQLite local migration with WAL journal mode.",
            "Monetization: RevenueCat $19.99/mo Pro Tier Paywall Rules.",
            "Privacy: 100% Offline-First • Zero Cloud Telemetry • BYOK.",
        ]
        for idx, sp in enumerate(specs):
            draw.text((180, card_y + 380 + idx * 75), f"✔ {sp}", fill=WHITE, font=None)

        # Final Hero CTA
        draw_pill(draw, 180, card_y + 860, 720, 120, CYAN, outline=WHITE, r=28)
        draw.text((270, card_y + 905), "GET ANDROID APK • 108 MB", fill=BG_DARK, font=None)

    # Frame indicator
    draw.text((WIDTH - 220, HEIGHT - 60), f"MindMesh AI Demo", fill=MUTED, font=None)

    filename = os.path.join(OUTPUT_DIR, f"frame_{frame_idx:04d}.png")
    img.save(filename)

print("🖼️ All 840 video frames generated!")

# ─── SYNTHESIZE CYBERPUNK AUDIO SOUNDTRACK ───
AUDIO_PATH = "showcase/soundtrack.wav"
sample_rate = 44100
total_samples = sample_rate * DURATION

print("🎵 Synthesizing 28s Dark Cyberpunk soundtrack with synth bass & beats...")
with wave.open(AUDIO_PATH, "w") as wav_file:
    wav_file.setnchannels(2) # Stereo
    wav_file.setsampwidth(2) # 16-bit
    wav_file.setframerate(sample_rate)

    for i in range(total_samples):
        cur_t = i / sample_rate
        # Kick beat every 0.5s (120 BPM)
        kick_env = max(0, 1.0 - (cur_t % 0.5) * 8)
        kick = math.sin(2 * math.pi * 55 * cur_t) * kick_env * 0.45

        # Synth bassline (110 Hz / 146 Hz switching)
        bass_freq = 110 if (int(cur_t * 2) % 4 < 2) else 146
        bass = (math.sin(2 * math.pi * bass_freq * cur_t) + 0.3 * math.sin(2 * math.pi * bass_freq * 2 * cur_t)) * 0.25

        # Hi-hat on 8th notes
        hihat_env = max(0, 1.0 - (cur_t % 0.25) * 20)
        hihat = ((math.sin(2 * math.pi * 3200 * cur_t)) * hihat_env) * 0.08

        # Melodic arp
        arp_notes = [220, 277, 330, 440, 554]
        note = arp_notes[int(cur_t * 8) % len(arp_notes)]
        arp = math.sin(2 * math.pi * note * cur_t) * 0.12

        val = max(-0.85, min(0.85, kick + bass + hihat + arp))
        int_val = int(val * 32767)
        wav_file.writeframes(struct.pack("<hh", int_val, int_val))

print("🔊 Audio synthesized successfully!")

# ─── ENCODE MP4 WITH FFMPEG ───
OUTPUT_MP4 = "showcase/mindmesh_launch_video.mp4"
ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-framerate", str(FPS),
    "-i", os.path.join(OUTPUT_DIR, "frame_%04d.png"),
    "-i", AUDIO_PATH,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    OUTPUT_MP4
]

print("🚀 Encoding final MP4 with FFmpeg...")
subprocess.run(ffmpeg_cmd, check=True)
print(f"🎉 FINAL VIDEO READY AT: {OUTPUT_MP4}")
