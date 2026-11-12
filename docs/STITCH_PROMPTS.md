# Google Stitch UI Prompt Specification: Generatics CTF - Nexus of Innovation

Dokumen ini berisi panduan desain sistem, token warna, tipografi, serta **8 prompt ultra-spesifik** siap pakai untuk di-generate di **Google Stitch** (`https://stitch.withgoogle.com` atau via Stitch MCP Tool).

---

## 1. Global Design System & Theme Rules

Semua screen WAJIB mematuhi spesifikasi desain berikut agar menghasilkan tampilan yang kohesif, berestetika *Hardcore Cyberpunk Terminal*, dan terbebas dari kesan AI-slop generik:

- **Color Palette:**
  - Background Utama: `#0B0F19` (Deep Slate Charcoal, bukan hitam pekat mati).
  - Surface / Card Container: `#111827` dengan border tipis `1px solid rgba(0, 229, 255, 0.2)` atau `rgba(255, 255, 255, 0.08)`.
  - Primary Accent (Matrix Green): `#00FF9D` (Success, active buttons, confirmed breach).
  - Cyber Cyan Accent: `#00E5FF` (Interactive links, active nodes, secondary controls).
  - Danger / Breach Red: `#FF3B30` (Breach failed, lockout warnings, countdown urgency).
  - Amber Gold: `#FFD700` (Top 1 podium, points badge, air drop alerts).
  - Text Primary: `#F8FAFC` (Pure crisp white/slate).
  - Text Muted: `#94A3B8` (Monospace labels, subtexts).
- **Typography:**
  - Headers, Numbers, Flags & Code: `JetBrains Mono` / `Space Grotesk` (Monospace, tabular numbers `font-feature-settings: 'tnum'`).
  - Body & Form Labels: `Inter` / `Space Grotesk` (Clean, legible from distance).
- **Aesthetic Elements:**
  - Subtle horizontal terminal scanline overlay (opacity 0.03).
  - Sharp corners / minimal border radius (`rounded-md` atau `rounded-lg` max 8px).
  - Neon glow highlights menggunakan box-shadow tipis (`0 0 15px rgba(0, 255, 157, 0.25)`).
  - Zero fluffy pastel gradients; gunakan strictly high-contrast dark cyberpunk palette.

---

## 2. Screen 01: Participant Mobile Landing Page

- **Device Type:** `MOBILE` (390 × 844 px, iPhone 14/15 frame)
- **Tujuan:** Gerbang masuk peserta dengan identifikasi codename dan briefing aturan satu kali percobaan (permadeath).

### Prompt Stitch:
```text
A dark-mode hardcore cyberpunk mobile landing screen for "GENERATICS CTF: NEXUS OF INNOVATION" organized by TDI HMIF. 
Device: Mobile (390x844).
Background: Deep dark slate (#0B0F19) with subtle CRT scanline textures and a faint hexagonal cyber grid.

Top Header:
- Dual logos at the top: Left badge for "HMIF" and right badge for "TDI" with glowing cyan border chips.
- Live Server Status Pill in top right: Glowing green pulse dot with text "SYSTEM ARMED // 10 NODES ACTIVE".

Hero Section:
- Event Title: "GENERATICS CTF" in bold futuristic monospace font (white #F8FAFC with subtle green neon glow #00FF9D).
- Subtitle: "NEXUS OF INNOVATION // HIGH-STAKES SURVIVAL PROTOCOL" in cyan uppercase (#00E5FF).
- Mission Briefing Box: Dark container (#111827) with neon green left border accent (3px). Inside, display bullet points:
  • "10 Sequential Nodes — No skips, no backtracking."
  • "STRICT ONE-SHOT: Only 1 flag attempt per node. Wrong flag awards 0 PTS and forces advance."
  • "Live Realtime Broadcast streaming to auditorium main stage."

Operator Authentication Form:
- Input Label: "OPERATOR CODENAME" in uppercase JetBrains Mono (#94A3B8).
- Input Field: Dark inset box (#070A10) with glowing cyan border, placeholder text "ENTER YOUR HANDLE..." with a blinking green terminal cursor.
- Help text below input: "No password required. Your codename will be broadcasted on the auditorium projector."

Primary Call To Action:
- Full-width button: Solid neon green (#00FF9D) background with bold black text (#050811) "INITIALIZE UPLINK ➔".
- High-contrast cyber button style with slight angled chamfered corners and strong hover/active glow effect.

Footer:
- Monospace subtext: "HMIF TECH DEVELOPMENT & INNOVATION © 2026 // SECURE SANDBOX ENVIRONMENT".
```

---

## 3. Screen 02: Participant Mobile Arena (Active Solving)

- **Device Type:** `MOBILE` (390 × 844 px)
- **Tujuan:** Layar utama pengerjaan soal CTF dengan timer, kode teka-teki, input flag uppercase, dan radar supply drop.

### Prompt Stitch:
```text
A dark-mode cyberpunk CTF problem-solving mobile arena interface for "GENERATICS CTF".
Device: Mobile (390x844).
Background: Ultra-dark slate (#0B0F19).

Status Bar & Header (Sticky Top):
- Top Row: 
  - Operator Pill: User avatar icon + "OP: MARZHEN" (#F8FAFC).
  - Score Badge: Gold-accented card (#FFD700) displaying "350 PTS" in bold monospace.
  - Session Countdown Timer: Cyan pill (#00E5FF) with clock icon "23:45 REMAINING".
- Progress Bar: A segmented 10-node progress bar. Node 1 & 2 filled in neon green (Solved), Node 3 highlighted with pulsing cyan border (Active), Nodes 4-10 in dark muted gray.
- Node Level Badge: "NODE 03 OF 10 // CRYPTOGRAPHY & CIPHERS" with point tag "+150 PTS".

Supply Drop Radar Alert (Dynamic Banner):
- A flashing amber/gold notification bar below header: "🚨 AIR DROP INCOMING! Supply Crate available in auditorium — Tap to intercept!".

Challenge Terminal Window:
- Styled like an interactive IDE / Hacker terminal with macOS-like window dots (red, yellow, green) and title "node_03_payload.py".
- Problem Statement: Clean readable typography explaining: "Intercepted transmission from sector 7. Decrypt the multi-layered ROT13 and Base64 cipher to recover the access token."
- Code Block Container: Inset terminal box (#050811) with syntax-highlighted code in green, cyan, and yellow monospace font:
  `cipher_text = "TGl2ZSBmcmVlIG9yIGRpZSBieSB0aGUgZmxhZw=="`
  `key_offset = 0x13`

Hint Drawer (Collapsible):
- Collapsed button: Dark gray chip with lock icon "DECRYPT INTEL HINT (-50 PTS)".

Flag Submission Section:
- Warning Tag: Red text with alert icon: "⚠️ ONE-SHOT PROTOCOL: Single attempt only. Double check your flag before executing."
- Input Box: Monospace uppercase font, placeholder "FLAG{ENTER_KEY_HERE}", monospace caret, clear button.
- Submit Button: Full-width high-voltage neon cyan button (#00E5FF) with black bold text: "EXECUTE & LOCK IN ANSWER ➔".
```

---

## 4. Screen 03: Submission Feedback Screen (Breach Confirmed vs Failed)

- **Device Type:** `MOBILE` (390 × 844 px)
- **Tujuan:** Layar feedback instan dramatis pasca-submit (Benar = Neon Green Success, Salah = Crimson Red Permadeath).

### Prompt Stitch:
```text
A high-stakes dual-state feedback modal screen for a cyberpunk CTF competition on mobile.
Device: Mobile (390x844).
Background: Dimmed dark background with holographic grid overlay.

State A (BREACH CONFIRMED - Correct Flag):
- Center Hero Card: Bordered in blazing neon green (#00FF9D) with intense cyber drop shadow.
- Icon: Large holographic unlocked padlock with particle sparks.
- Giant Header: "BREACH CONFIRMED!" in bold futuristic display font (#00FF9D).
- Points Awarded: Giant gold counter badge "+150 PTS ADDED TO OPERATOR BANK".
- Status Details: "FLAG VERIFIED // TIME: 01:24s // ACCURACY: 100%".
- Progression Ticker: "Transferring uplink to Node 04 in 3... 2... 1...".
- Action Button: Solid neon green button "ADVANCE TO NODE 04 IMMEDIATELY ➔".

State B (BREACH FAILED - Wrong Flag / Permadeath Warning):
- Center Hero Card: Bordered in flashing warning crimson red (#FF3B30) with hazard diagonal stripe accents.
- Icon: Glitched skull / access denied crosshair icon.
- Giant Header: "BREACH FAILED // LOCKOUT!" in aggressive red typography (#FF3B30).
- Penalty Notice: "+0 PTS AWARDED // PERMADEATH ENFORCED".
- Explanation Box: "Your flag was rejected. Under sequential rules, you cannot retry this node. Your terminal is being forcefully advanced to maintain mission pace."
- Action Button: Crimson red outline button "CONTINUE TO NEXT NODE (0 PTS) ➔".
```

---

## 5. Screen 04: Air Drop / Supply Drop Claim Screen

- **Device Type:** `MOBILE` (390 × 844 px)
- **Tujuan:** Layar pembukaan loot box saat peserta menjadi salah satu dari 2 orang tercepat menekan tombol Air Drop.

### Prompt Stitch:
```text
A thrilling high-energy mobile gaming loot-drop screen for a cyberpunk CTF battle royale.
Device: Mobile (390x844).
Background: Deep dark slate (#0B0F19) with golden glowing light rays beaming from the center.

Header:
- Alert Tag: "🚨 AIR DROP CRATE INTERCEPTED!" in pulsing yellow (#FFD700).
- Subtext: "Speed Rank #1 in Auditorium! Select 1 Tactical Payload to execute immediately:".

Grid of 4 Tactical Power-Up Cards (2x2 Grid):
1. Card 1 - "OVERCLOCK 2X":
   - Neon green border (#00FF9D), lightning bolt icon.
   - Title: "2X MULTIPLIER".
   - Description: "Double all points earned on your next solved node."
   - Target: Self (Passive).
2. Card 2 - "CRYO FREEZE":
   - Icy blue border (#00E5FF), snowflake/frostbite icon.
   - Title: "15s FREEZE TIME".
   - Description: "Lock a rival's terminal screen completely for 15 seconds."
   - Target: Rival Operator.
3. Card 3 - "EMP DRAIN":
   - Amber orange border (#FF9500), battery drain icon.
   - Title: "DRAIN -100 PTS".
   - Description: "Directly subtract 100 points from a selected opponent."
   - Target: Rival Operator.
4. Card 4 - "DATA SIPHON":
   - Electric purple border (#A855F7), siphon vortex icon.
   - Title: "STEAL +100 PTS".
   - Description: "Steal 100 points from an opponent directly into your score."
   - Target: Rival Operator.

Target Selection Drawer (Opens when Freeze/Drain/Siphon is selected):
- Title: "SELECT TARGET RIVAL (TOP 5 LEADERBOARD)":
  - Radio list showing Top 5 operators with their live score & current rank:
    1. "AXEL_99 (Rank 1 - 750 PTS)"
    2. "CYBER_NINJA (Rank 2 - 600 PTS)"
    3. "DEV_ZERO (Rank 3 - 550 PTS)"
    4. "GHOST_X (Rank 4 - 500 PTS)"
    5. "NEO_KID (Rank 5 - 450 PTS)"

Bottom Action Button:
- Big glowing button: "DEPLOY TACTICAL STRIKE ➔".
```

---

## 6. Screen 05: Frozen Screen Lockout State (Cryo Glitch)

- **Device Type:** `MOBILE` (390 × 844 px)
- **Tujuan:** Tampilan layar terkunci ketika peserta terkena serangan skill "Freeze Time 15s" dari lawan.

### Prompt Stitch:
```text
A full-screen frozen / glitched system lockout screen on a mobile phone interface.
Device: Mobile (390x844).
Background: Frostbite ice-cyan tinted dark screen (#06141D) with visible frosted glass borders, frozen ice crystal vignettes, and RGB chromatic aberration glitch lines across the display.

Center Warning Box:
- Icon: Pulsing frozen padlock encased in holographic ice crystals.
- Header: "SYSTEM FROZEN // CRYO LOCKOUT" in icy glowing cyan (#00E5FF).
- Offender Tag: Dark badge with red text: "ATTACKED BY OPERATOR: [AXEL_99] (Via Cryo Freeze Payload)".

Countdown Timer (Giant Circular Progress Ring):
- Large radial countdown meter in the center with circular progress bar ticking down.
- Inside the circle: Big bold monospace numbers "12s" with subtext "REMAINING".
- Sub-bar: Animated progress bar labeled "PURGING CRYOGENIC VIRUS...".

Disabled Interface Elements:
- Below the timer, the flag input field and buttons are visible in the background but heavily blurred, grayed out, and overlaid with a "TERMINAL INPUT MUTED" red warning seal.
- Ticker at bottom: "Do not refresh. Your connection will automatically restore when the countdown finishes."
```

---

## 7. Screen 06: Participant Final Game Over & Podium Screen

- **Device Type:** `MOBILE` (390 × 844 px)
- **Tujuan:** Layar akhir peserta setelah menyelesaikan 10 node, menampilkan rekapitulasi poin dan status siaran proyektor.

### Prompt Description:
```text
A triumphant cyberpunk end-game summary screen for a CTF competitor on mobile.
Device: Mobile (390x844).
Background: Deep dark slate (#0B0F19) with falling green & gold confetti particles and victory neon ambient glow.

Top Header:
- Title: "OPERATION CONCLUDED // STATUS: FINISHED".
- Event Tag: "GENERATICS CTF 2026 // TDI HMIF".

Operator Scorecard (Hero Card):
- Gold and cyan bordered card (#FFD700 / #00E5FF):
  - Operator: "MARZHEN" with custom hacker insignia.
  - Final Score: Giant monospace display "1,450 PTS".
  - Rank Estimate Badge: "CURRENT AUDITORIUM RANK: #3 / 64".

Node Matrix Breakdown (10 Nodes Grid):
- A clean 2x5 grid showing all 10 challenge nodes:
  - Node 01: 🟩 Correct (+100 PTS)
  - Node 02: 🟩 Correct (+100 PTS)
  - Node 03: 🟩 Correct (+150 PTS)
  - Node 04: 🟥 Breach Failed (0 PTS)
  - Node 05: 🟩 Correct (+150 PTS)
  - Node 06: 🟩 Correct (+200 PTS - 2X BOOST!)
  - Node 07: 🟥 Breach Failed (0 PTS)
  - Node 08: 🟩 Correct (+250 PTS)
  - Node 09: 🟩 Correct (+250 PTS)
  - Node 10: 🟩 Correct (+300 PTS)

Auditorium Broadcast Banner:
- Card with pulsing live broadcast icon: "📡 LIVE AUDITORIUM STREAM: Look up at the main stage projector! Official winners and podium ceremony will be announced live by the MC."
```

---

## 8. Screen 07: Admin & Projector Live Display (1920 × 1080 Landscape)

- **Device Type:** `DESKTOP` (1920 × 1080 px Landscape, 16:9 Projector View)
- **Tujuan:** Tampilan layar raksasa proyektor auditorium untuk MC dan penonton dengan leaderboard live, battle feed, dan kontrol operator.

### Prompt Stitch:
```text
A massive 1920x1080 landscape ultra-high contrast dark cyberpunk live projector dashboard for an esports-style CTF tournament.
Device: Desktop (1920x1080 landscape).
Background: Ultra-dark slate (#090D16) with subtle glowing cyber mesh and dark vignette. Designed to be razor-sharp and readable from 20 meters away in an auditorium.

Top Header Bar:
- Left: Dual glowing logos for "HMIF" and "TDI" with event title "GENERATICS CTF: NEXUS OF INNOVATION".
- Center: GIANT COUNTDOWN CLOCK in high-contrast cyan & white (#00E5FF): "14 : 32" with subtext "MATCH TIME REMAINING" (pulsing every second).
- Right: Live statistics counter: "64 OPERATORS CONNECTED" • "10 NODES ACTIVE" • "REALTIME SYNC: ACTIVE (🟢 Supabase)".

Top 3 Spotlight Podium (Upper Center Area):
- 3 Large esports-style podium cards side-by-side:
  - 1st Place (Center, Elevated, Gold #FFD700 glow): Crown icon, "RANK #1: AXEL_99", Giant score "1,750 PTS", status pill "HACKING NODE 09".
  - 2nd Place (Left, Silver #E2E8F0 glow): "RANK #2: MARZHEN", "1,600 PTS", status pill "FINISHED (10/10)".
  - 3rd Place (Right, Bronze #F59E0B glow): "RANK #3: KEVIN_T", "1,450 PTS", status pill "HACKING NODE 08".

Bottom Half - Two Main Columns:
- Left Column (Live Field Roster - 65% width):
  - Table / Grid of ranks 4 through 20: Monospace columns showing:
    [RANK] [OPERATOR CODENAME] [CURRENT NODE PROGRESS BAR (1-10)] [SCORE (PTS)] [STATUS: Hacking / Frozen / Finished].
  - Operators currently frozen have a bright cyan ice crystal icon and "FROZEN (08s)".
- Right Column (Live Battle Events Feed - 35% width):
  - Card titled "🚨 TACTICAL COMBAT LOG (REALTIME)":
  - Live scrolling feed of recent actions:
    • "[14:28] ⚡ MARZHEN claimed Supply Crate (Overclock 2X deployed!)"
    • "[14:26] 🧊 AXEL_99 froze KEVIN_T for 15s!"
    • "[14:24] 💥 SARAH siphoned 100 PTS from DAVID_W!"
    • "[14:20] 🎯 RIZKY unlocked Node 07 (Breach Confirmed +250 PTS)".

Operator Controls Bar (Docked at Bottom Edge - Discreet for MC/Admin):
- Small floating dark bar with administrator quick buttons:
  - Button 1: Red glowing button "[🚨 TRIGGER AIR DROP NOW]" (Fires supply drop to auditorium).
  - Button 2: Yellow button "[⏸ PAUSE TIMER]".
  - Button 3: Red outline button "[⏹ END MATCH & REVEAL WINNERS]".
```

---

## 9. Screen 08: UI Design System & Cyberpunk Assets Kit

- **Device Type:** `DESKTOP` / `AGNOSTIC`
- **Tujuan:** Halaman master kit yang memvisualisasikan seluruh aset SVG/vektor, badge level, ikon skill, dan kontainer loot box untuk dipotong (slicing) ke komponen Next.js.

### Prompt Stitch:
```text
A comprehensive UI kit and design system asset sheet for a dark cyberpunk arcade web application.
Device: Desktop (1440x900).
Background: Deep slate dark grid (#0B0F19).

Section 1: Tactical Power-Up Skill Icons (4 Large High-Res Icons):
- Icon 1 (2X Multiplier): Dual glowing neon-green lightning bolts surrounded by a high-voltage gear ring (#00FF9D).
- Icon 2 (Cryo Freeze): Sharded cyan ice crystal snowflake with cold mist vapor and frost spikes (#00E5FF).
- Icon 3 (EMP Drain): Heavy military battery with warning lightning discharging energy and "-100" amber badge (#FF9500).
- Icon 4 (Data Siphon): Vortex energy siphon funnel with swirling purple/violet particle trails (#A855F7).

Section 2: 3D Isometric Air Drop Supply Crate:
- A high-tech military sci-fi supply crate with reinforced titanium edges, glowing yellow caution hazard stripes, hydraulic locks, and four glowing cyan parachute thrusters on top.

Section 3: Node Level Badges (10 Progressive Hexagonal Badges):
- Hexagonal cyber badges numbered 01 to 10:
  - Levels 1-3 (Beginner): Subtle green neon border.
  - Levels 4-6 (Intermediate): Cyber cyan and blue glow.
  - Levels 7-9 (Advanced): Violet and crimson alert glow.
  - Level 10 (Boss / Nexus Node): Blazing golden skull with dual crosshairs and "NODE 10: NEXUS ROOT".

Section 4: Status Chips & Micro UI Elements:
- Pill badges with glowing dot indicators: "ONLINE (Green)", "FROZEN (Cyan)", "BREACH FAILED (Red)", "AIR DROP READY (Gold)".
- Monospace Tabular Number displays for digital clocks ("00:00:00").
- Terminal input fields with blinking cyan/green block carets.
```

---

## 10. Cara Menggunakan Spesifikasi Ini di Google Stitch

1. **Buka Project Baru di Stitch:**
   - Masuk ke `https://stitch.withgoogle.com` (atau jalankan perintah via Stitch MCP tool).
   - Buat project baru dengan judul **"Generatics CTF: Nexus of Innovation"**.
2. **Generate Screen Berurutan:**
   - Copy prompt dari **Screen 01** sampai **Screen 08** ke dalam input prompt Stitch dengan tipe device yang sesuai (`MOBILE` untuk Screen 1-6, `DESKTOP` untuk Screen 7-8).
3. **Eksekusi Otomatis via Stitch MCP:**
   - Jika sudah direview dan disetujui, agen dapat langsung mengeksekusi pembuatan project dan generate layar secara terprogram menggunakan MCP tool `stitch` (`create_project` $\rightarrow$ `generate_screen_from_text`).
