# FocusTab Locker

A Chrome extension that locks you to a set of tabs for a timed work session. Distractions are blocked automatically — no willpower required.

![Chrome](https://img.shields.io/badge/Chrome-MV3-blue?logo=googlechrome)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.2.0-orange)

---

## Features

| Feature | Description |
|---|---|
| **Safe Tab locking** | Pick which tabs are allowed. Any attempt to switch away snaps you back. |
| **Blocklist mode** | Block entire domains (youtube.com, reddit.com) without picking specific tabs. |
| **Pomodoro mode** | Automatic work/break cycles with a cycle counter. Enforcement lifts during breaks. |
| **Custom redirect page** | Blocked navigations land on a motivational page instead of silently snapping back. |
| **Presets** | Save named configs ("Deep Work", "Study") and load them in one click. |
| **PIN-protected unlock** | Require a PIN for the emergency unlock so it's not trivially bypassable. |
| **Scheduled sessions** | Auto-start a blocklist session at a set time and days via Chrome alarms. |
| **Session history** | Track completed sessions, streaks, and total focus hours. |
| **Sync across devices** | Presets and settings sync across Chrome installs via your Google account. |
| **Crash recovery** | Browser restart mid-session? The lock resumes automatically. |
| **Emergency unlock** | `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) exits any session instantly. |

---

## Installation

> **Note:** This extension is distributed via GitHub Releases, not the Chrome Web Store.
> Chrome will show a **"Developer mode"** warning on every launch — this is expected and safe.
> The source code is fully open and auditable in this repository.

### Step 1 — Enable Developer Mode in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Toggle **Developer mode** on (top-right corner)

### Step 2 — Download the latest release

1. Go to the [**Releases**](../../releases) page of this repository
2. Under the latest release, download **`focustab-locker.zip`**
3. Unzip it to a permanent folder on your computer
   > ⚠️ Do **not** delete this folder after installing — Chrome loads the extension from it directly.

### Step 3 — Load the extension

**Option A — Load unpacked (recommended)**
1. On `chrome://extensions`, click **"Load unpacked"**
2. Select the unzipped `focustab-locker` folder
3. The extension icon appears in your toolbar

**Option B — Drag and drop**
1. Locate the `focustab-locker.zip` file (do **not** unzip)
2. Drag and drop it onto the `chrome://extensions` page

### Step 4 — Pin the extension

1. Click the puzzle piece icon (🧩) in the Chrome toolbar
2. Click the pin icon next to **FocusTab Locker**

---

## Updating to a newer version

1. Download the new release zip and unzip it, **replacing** the old folder
2. Go to `chrome://extensions`
3. Find FocusTab Locker and click the **refresh icon** (↺)

---

## How to use

### Quick start

1. Click the **FocusTab Locker** icon in your toolbar
2. Select the tabs you want to lock yourself to
3. Set a duration (e.g. 25 minutes)
4. Click **Start Session**

From this point, switching to any other tab redirects you to the focus reminder page.

### Modes

**Safe Tabs** — Select specific open tabs. Only those tabs are accessible.

**Blocklist** — Enter domains to block (e.g. `youtube.com`, `twitter.com`). You can switch between any tabs freely, but navigating to a blocked domain redirects you.

**Pomodoro** — Automatic work/break cycles. Select safe tabs for the work phase; enforcement lifts automatically during breaks.

### Presets

1. Configure a session (mode, tabs/domains, duration)
2. Click **Save Preset** and give it a name
3. Load it instantly from the preset dropdown next time

### Scheduled sessions

1. Go to **Settings → Scheduled Sessions**
2. Create a blocklist preset first (scheduled auto-start only works with blocklist mode)
3. Add a schedule: pick the preset, time, and days
4. The session starts automatically at that time — no manual action needed

### PIN protection

1. Go to **Settings → PIN Protection**
2. Set a PIN (minimum 3 characters)
3. Emergency unlock via `Ctrl+Shift+P` or the popup button will now require the PIN

### Emergency unlock

- **Keyboard:** `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- **Popup:** Open the extension while a session is running and click **Emergency Unlock**

If a PIN is set, an unlock page opens to verify it first.

---

## Developer setup

### Prerequisites

- [Node.js](https://nodejs.org) v18+ (only needed for the landing page)
- Chrome or any Chromium-based browser

### Run the extension locally

No build step required. The extension is plain HTML/CSS/JS.

```bash
git clone https://github.com/YOUR_USERNAME/focustab-locker.git
cd focustab-locker
```

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the repo root folder
4. Make edits to any file, then click the **refresh icon** on `chrome://extensions`

### Run the landing page locally

```bash
cd landing
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Build the landing page for production

```bash
cd landing
npm run build
# Output is in landing/dist/
```

### Project structure

```
focustab-locker/
├── manifest.json          # Extension config (MV3)
├── background.js          # Service worker — enforcer, timer, alarms
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── redirect/
│   ├── redirect.html      # Shown when a blocked navigation is attempted
│   ├── redirect.js
│   └── redirect.css
├── unlock/
│   ├── unlock.html        # PIN entry page (opened by Ctrl+Shift+P)
│   └── unlock.js
├── icons/
│   ├── locked_*.png       # Red — session active
│   └── unlocked_*.png     # Green — idle
└── landing/               # Marketing site (React + Tailwind + Vite)
```

### Creating a release

```bash
# From the repo root — zip only the extension files, not the landing site or dev files
zip -r focustab-locker.zip \
  manifest.json background.js \
  popup/ redirect/ unlock/ icons/ \
  --exclude "*.DS_Store"
```

Attach `focustab-locker.zip` to a new GitHub Release.

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `tabs` | Read open tabs, switch active tab, update tab URLs |
| `storage` | Save session state, history, presets, settings |
| `alarms` | Reliable timer that survives browser sleep |
| `notifications` | Session complete and phase-change alerts |
| `webNavigation` | Intercept URL navigation to enforce blocklist/safe-tab rules |

No data ever leaves your browser. There is no backend, no analytics, no tracking.

---

## License

MIT — do whatever you want with it.
