// FocusTab Locker — Service Worker  (background.js)
// All 8 features: blocklist, pomodoro, redirect page, presets,
// PIN unlock, scheduled sessions, history, sync storage.

const ALARM_PHASE   = 'focustab_phase';    // pomodoro phase changes
const ALARM_SESSION = 'focustab_session';  // normal session end
const SCHED_PREFIX  = 'focustab_sched_';   // scheduled sessions

const REDIRECT_PAGE = chrome.runtime.getURL('redirect/redirect.html');
const UNLOCK_PAGE   = chrome.runtime.getURL('unlock/unlock.html');

// ── Startup ───────────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[FocusTab] Installed / updated.');
  await rearmScheduledAlarms();
});

chrome.runtime.onStartup.addListener(async () => {
  const session = await getSession();
  if (session.active) {
    console.log('[FocusTab] Resuming session after restart.');
    await rearmSessionAlarms(session);
    setLockedIcon();
  }
  await rearmScheduledAlarms();
});

// ── Message bridge ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case 'START_SESSION': {
        await chrome.storage.local.set({ session: msg.session });
        await rearmSessionAlarms(msg.session);
        setLockedIcon();
        sendResponse({ ok: true });
        break;
      }
      case 'EMERGENCY_UNLOCK': {
        const settings = await getSettings();
        if (settings.pin) {
          // Open PIN page instead of unlocking immediately
          chrome.tabs.create({ url: UNLOCK_PAGE });
          sendResponse({ needsPin: true });
        } else {
          await doUnlock(true);
          sendResponse({ ok: true });
        }
        break;
      }
      case 'VERIFY_PIN': {
        const settings = await getSettings();
        if (settings.pin && msg.pin !== settings.pin) {
          sendResponse({ ok: false, error: 'Wrong PIN' });
        } else {
          await doUnlock(true);
          sendResponse({ ok: true });
        }
        break;
      }
      case 'RESTORE_ANCHOR': {
        const session = await getSession();
        if (session.active && session.anchorTabId) {
          await snapToAnchor(session.anchorTabId);
        }
        sendResponse({ ok: true });
        break;
      }
    }
  })();
  return true;
});

// ── Keyboard shortcut ─────────────────────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'emergency_unlock') return;
  const session = await getSession();
  if (!session.active) return;
  const settings = await getSettings();
  if (settings.pin) {
    chrome.tabs.create({ url: UNLOCK_PAGE });
  } else {
    await doUnlock(true);
  }
});

// ── Alarms ────────────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_SESSION) {
    await handleSessionEnd();
  } else if (alarm.name === ALARM_PHASE) {
    await handlePhaseChange();
  } else if (alarm.name.startsWith(SCHED_PREFIX)) {
    const schedId = alarm.name.slice(SCHED_PREFIX.length);
    await handleScheduledStart(schedId);
    await rearmScheduledAlarms(); // re-schedule for next occurrence
  }
});

// ── Enforcer: tab switch guard ────────────────────────────────────────────────
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // Don't block our own extension pages (check first, synchronously via URL is not
  // possible here so we do it after the cheap checks below)
  const session = await getSession();
  if (!session.active) return;
  if (session.mode === 'blocklist') return;
  if (session.mode === 'pomodoro' && session.phase !== 'work') return;

  // No safe tabs defined → timer-only mode, no tab restriction
  if (!session.safeTabIds || session.safeTabIds.length === 0) return;

  // Tab is on the safe list → allowed
  if (session.safeTabIds.includes(tabId)) return;

  // Never redirect our own extension pages (redirect.html, unlock.html, etc.)
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url && tab.url.startsWith(chrome.runtime.getURL(''))) return;
  } catch { return; }

  await showRedirectPage(tabId, { anchor: true });
});

// ── Enforcer: navigation guard ────────────────────────────────────────────────
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (details.url.startsWith('chrome')) return;
  if (details.url.startsWith(chrome.runtime.getURL(''))) return; // our pages

  const session = await getSession();
  if (!session.active) return;
  if (session.mode === 'pomodoro' && session.phase !== 'work') return;

  const { tabId, url } = details;

  if (session.mode === 'safetabs' || session.mode === 'pomodoro') {
    if (!session.safeTabIds || session.safeTabIds.length === 0) return;

    if (session.safeTabIds.includes(tabId)) {
      // Safe tab: block navigation away from its locked origin
      const lockedUrl = session.safeTabUrls?.[tabId] ?? session.safeTabUrls?.[String(tabId)];
      if (!lockedUrl || sameOrigin(url, lockedUrl)) return;
      await showRedirectPage(tabId, { restore: lockedUrl, blocked: url });
    } else {
      // Non-safe tab: user typed a URL while on the redirect page.
      // Only enforce if the tab is currently active (ignore background refreshes).
      try {
        const tab = await chrome.tabs.get(tabId);
        if (tab.active) await showRedirectPage(tabId, { anchor: true });
      } catch {}
    }

  } else if (session.mode === 'blocklist') {
    const hostname = safeHostname(url);
    if (!hostname) return;
    const hit = (session.blocklist || []).some(
      d => hostname === d || hostname.endsWith('.' + d)
    );
    if (!hit) return;
    await showRedirectPage(tabId, { blocked: url });
  }
});

// ── Enforcer: closed safe tab ─────────────────────────────────────────────────
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const session = await getSession();
  if (!session.active) return;
  if (!session.safeTabIds || !session.safeTabIds.includes(tabId)) return;

  const remaining = session.safeTabIds.filter(id => id !== tabId);
  const urls = { ...session.safeTabUrls };
  delete urls[tabId];
  delete urls[String(tabId)];

  if (remaining.length === 0) {
    await doUnlock(false);
    notify('All safe tabs closed. Session ended.');
    return;
  }

  const newAnchor = remaining.includes(session.anchorTabId)
    ? session.anchorTabId
    : remaining[0];

  const updated = { ...session, safeTabIds: remaining, safeTabUrls: urls, anchorTabId: newAnchor };
  await chrome.storage.local.set({ session: updated });
  await snapToAnchor(newAnchor);
});

// ── Session lifecycle ─────────────────────────────────────────────────────────
async function handleSessionEnd() {
  const session = await getSession();
  if (!session.active) return;
  await recordHistory(session, false);
  await clearSession();
  notify('Work session complete. Great job! 🎉');
  setUnlockedIcon();
}

async function handlePhaseChange() {
  const session = await getSession();
  if (!session.active || session.mode !== 'pomodoro') return;

  if (session.phase === 'work') {
    // Work ended → start break
    const completedCycle = session.cycle;
    const isLongBreak = completedCycle % 4 === 0;
    const breakMs = isLongBreak ? (session.longBreakMs || 900000) : session.breakMs;
    const phaseEndTime = Date.now() + breakMs;
    const updated = { ...session, phase: isLongBreak ? 'longbreak' : 'break', phaseEndTime };
    await chrome.storage.local.set({ session: updated });
    await chrome.alarms.clear(ALARM_PHASE);
    chrome.alarms.create(ALARM_PHASE, { delayInMinutes: breakMs / 60000 });
    setUnlockedIcon();
    notify(isLongBreak ? `Cycle ${completedCycle} done! Long break (${breakMs / 60000} min) 🏖️` : `Cycle ${completedCycle} done! Break time (${breakMs / 60000} min) ☕`);

  } else {
    // Break ended → start next work phase
    const nextCycle = session.cycle + 1;
    if (nextCycle > session.totalCycles) {
      // All cycles done
      await recordHistory(session, false);
      await clearSession();
      notify(`Pomodoro complete! All ${session.totalCycles} cycles done. Excellent work! 🏆`);
      setUnlockedIcon();
      return;
    }
    const phaseEndTime = Date.now() + session.workMs;
    const updated = { ...session, phase: 'work', cycle: nextCycle, phaseEndTime };
    await chrome.storage.local.set({ session: updated });
    await chrome.alarms.clear(ALARM_PHASE);
    chrome.alarms.create(ALARM_PHASE, { delayInMinutes: session.workMs / 60000 });
    setLockedIcon();
    notify(`Break over! Starting cycle ${nextCycle}/${session.totalCycles} 💪`);
  }
}

async function doUnlock(userInitiated) {
  const session = await getSession();
  await chrome.alarms.clear(ALARM_SESSION);
  await chrome.alarms.clear(ALARM_PHASE);
  if (session.active) await recordHistory(session, userInitiated);
  await clearSession();
  notify(userInitiated ? 'Emergency Unlock Activated. You are free.' : 'Session ended.');
  setUnlockedIcon();
}

// ── Redirect page ─────────────────────────────────────────────────────────────
async function showRedirectPage(tabId, params = {}, attempt = 0) {
  const qs = new URLSearchParams();
  if (params.restore)  qs.set('restore',  params.restore);
  if (params.blocked)  qs.set('blocked',  params.blocked);
  if (params.anchor)   qs.set('anchor',   '1');
  const url = `${REDIRECT_PAGE}?${qs.toString()}`;
  try {
    await chrome.tabs.update(tabId, { url });
  } catch (err) {
    if (attempt === 0) setTimeout(() => showRedirectPage(tabId, params, 1), 150);
  }
}

// ── Scheduled sessions ────────────────────────────────────────────────────────
async function rearmScheduledAlarms() {
  const settings = await getSettings();
  const schedules = settings.scheduledSessions || [];
  for (const sched of schedules) {
    if (!sched.enabled) continue;
    const next = nextScheduleTime(sched);
    if (!next) continue;
    const alarmName = SCHED_PREFIX + sched.id;
    await chrome.alarms.clear(alarmName);
    chrome.alarms.create(alarmName, { when: next });
  }
}

async function handleScheduledStart(schedId) {
  const settings = await getSettings();
  const sched = (settings.scheduledSessions || []).find(s => s.id === schedId);
  if (!sched) return;

  const { presets } = await chrome.storage.sync.get('presets');
  const preset = (presets || []).find(p => p.id === sched.presetId);
  if (!preset) {
    notify('Scheduled session: preset not found.');
    return;
  }

  // Only auto-start blocklist mode (no tab selection needed)
  if (preset.mode !== 'blocklist') {
    notify(`Time for your "${preset.name}" focus session! Open FocusTab Locker to start.`);
    return;
  }

  const session = buildSession(preset);
  await chrome.storage.local.set({ session });
  await rearmSessionAlarms(session);
  setLockedIcon();
  notify(`Scheduled session "${preset.name}" started automatically.`);
}

function nextScheduleTime(sched) {
  const [hour, minute] = sched.time.split(':').map(Number);
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);
    candidate.setHours(hour, minute, 0, 0);
    const dayName = dayNames[candidate.getDay()];
    if ((sched.days || []).includes(dayName)) return candidate.getTime();
  }
  return null;
}

function buildSession(preset) {
  const id = `sess_${Date.now()}`;
  const base = {
    active: true, id, mode: preset.mode,
    startTime: Date.now(), presetName: preset.name,
    safeTabIds: [], safeTabUrls: {}, anchorTabId: null,
    blocklist: preset.blocklist || [],
    phase: null, cycle: 1, totalCycles: preset.pomodoroLongAfter || 4,
    workMs: (preset.pomodoroWork || 25) * 60000,
    breakMs: (preset.pomodoroBreak || 5) * 60000,
    longBreakMs: (preset.pomodoroLongBreak || 15) * 60000,
    phaseEndTime: null,
  };
  if (preset.mode === 'pomodoro') {
    const totalMs = base.totalCycles * (base.workMs + base.breakMs);
    return { ...base, phase: 'work', endTime: Date.now() + totalMs,
             durationMs: totalMs, phaseEndTime: Date.now() + base.workMs };
  }
  const durationMs = (preset.durationMin || 25) * 60000;
  return { ...base, endTime: Date.now() + durationMs, durationMs };
}

// ── Alarm helpers ─────────────────────────────────────────────────────────────
async function rearmSessionAlarms(session) {
  await chrome.alarms.clear(ALARM_SESSION);
  await chrome.alarms.clear(ALARM_PHASE);
  if (session.mode === 'pomodoro') {
    const phaseMs = Math.max(1000, session.phaseEndTime - Date.now());
    chrome.alarms.create(ALARM_PHASE, { delayInMinutes: phaseMs / 60000 });
  } else {
    const remaining = Math.max(1000, session.endTime - Date.now());
    chrome.alarms.create(ALARM_SESSION, { delayInMinutes: remaining / 60000 });
  }
}

// ── History ───────────────────────────────────────────────────────────────────
async function recordHistory(session, aborted) {
  const result = await chrome.storage.local.get('history');
  const history = result.history ?? { sessions: [], totalFocusMs: 0 };

  const record = {
    id: session.id || `sess_${Date.now()}`,
    startTime: session.startTime || Date.now(),
    endTime: Date.now(),
    durationMs: Date.now() - (session.startTime || Date.now()),
    mode: session.mode || 'safetabs',
    cyclesCompleted: session.cycle || null,
    aborted,
    presetName: session.presetName || null,
  };

  history.sessions.unshift(record);
  if (history.sessions.length > 500) history.sessions.length = 500;
  if (!aborted) history.totalFocusMs = (history.totalFocusMs || 0) + record.durationMs;

  await chrome.storage.local.set({ history });
}

// ── Notifications ─────────────────────────────────────────────────────────────
function notify(message) {
  chrome.notifications.create(`ftl_${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/unlocked_48.png',
    title: 'FocusTab Locker',
    message,
  });
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function setLockedIcon() {
  chrome.action.setIcon({ path: { 16: 'icons/locked_16.png', 48: 'icons/locked_48.png', 128: 'icons/locked_128.png' } });
}
function setUnlockedIcon() {
  chrome.action.setIcon({ path: { 16: 'icons/unlocked_16.png', 48: 'icons/unlocked_48.png', 128: 'icons/unlocked_128.png' } });
}

// ── Snap to anchor ────────────────────────────────────────────────────────────
async function snapToAnchor(anchorTabId, attempt = 0) {
  try {
    const tab = await chrome.tabs.get(anchorTabId);
    await chrome.tabs.update(anchorTabId, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } catch (err) {
    if (attempt === 0) {
      // Chrome may be mid-transition — retry once
      setTimeout(() => snapToAnchor(anchorTabId, 1), 150);
      return;
    }
    // Tab genuinely gone — promote another safe tab or end session
    const session = await getSession();
    if (!session.active) return;
    const fallback = (session.safeTabIds || []).find(id => id !== anchorTabId);
    if (fallback) {
      const updated = { ...session, anchorTabId: fallback };
      await chrome.storage.local.set({ session: updated });
      await snapToAnchor(fallback, 0);
    } else {
      await doUnlock(false);
      notify('All safe tabs closed. Session ended.');
    }
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────────
async function getSession() {
  const r = await chrome.storage.local.get('session');
  return r.session ?? { active: false };
}
async function clearSession() {
  await chrome.storage.local.remove('session');
}
async function getSettings() {
  const r = await chrome.storage.sync.get('settings');
  return r.settings ?? {};
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function sameOrigin(a, b) {
  try { return new URL(a).origin === new URL(b).origin; } catch { return false; }
}
function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return null; }
}
