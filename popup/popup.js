// FocusTab Locker — Popup controller (all 8 features)

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const logoDot       = $('logo-dot');
const navTabs       = document.querySelectorAll('.nav-tab');
const modeTabs      = document.querySelectorAll('.mode-tab');
const presetPicker  = $('preset-picker');
const tabList       = $('tab-list');
const pomoTabList   = $('pomo-tab-list');
const domainInput   = $('domain-input');
const domainList    = $('domain-list');
const errorMsg      = $('error-msg');
const btnStart      = $('btn-start');
const btnSavePreset = $('btn-save-preset');
const countdown     = $('countdown');
const phaseBadge    = $('phase-badge');
const cycleDots     = $('cycle-dots');
const sessionMeta   = $('session-meta');
const progressFill  = $('progress-fill');
const btnUnlock     = $('btn-unlock');
const presetsList   = $('presets-list');
const presetsEmpty  = $('presets-empty');
const historyList   = $('history-list');
const historyEmpty  = $('history-empty');
const scheduleList  = $('schedule-list');
const scheduleEmpty = $('schedule-empty');
const schedPreset   = $('sched-preset');
const modalOverlay  = $('modal-overlay');

let currentMode    = 'safetabs';
let currentView    = 'select';
let countdownTimer = null;
let blockedDomains = [];  // temp list while setting up

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  const [session, presets] = await Promise.all([getSession(), getPresets()]);
  populatePresetPicker(presets);
  if (session.active) {
    showView('active');
    renderActiveView(session);
  } else {
    await populateTabLists();
    showView('select');
  }
})();

// ── View routing ──────────────────────────────────────────────────────────────
function showView(name) {
  currentView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  $(`view-${name}`).classList.remove('hidden');

  // Nav tabs: visible only when not in active session
  const navEl = $('nav-tabs');
  navEl.classList.toggle('hidden', name === 'active');

  // Highlight correct nav tab
  navTabs.forEach(t => t.classList.toggle('active', t.dataset.view === name));

  // Render view-specific data
  if (name === 'presets')  renderPresets();
  if (name === 'history')  renderHistory();
  if (name === 'settings') renderSettings();
}

navTabs.forEach(tab => {
  tab.addEventListener('click', () => showView(tab.dataset.view));
});

// ── Mode selector ─────────────────────────────────────────────────────────────
modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    document.querySelectorAll('.mode-panel').forEach(p => p.classList.add('hidden'));
    $(`panel-${currentMode}`).classList.remove('hidden');
  });
});

// ── Tab lists ─────────────────────────────────────────────────────────────────
async function populateTabLists() {
  const tabs = await chrome.tabs.query({});
  [tabList, pomoTabList].forEach(list => {
    list.innerHTML = '';
    tabs.forEach(tab => list.appendChild(makeTabItem(tab)));
  });
}

function makeTabItem(tab) {
  const li       = document.createElement('li');
  const checkbox = document.createElement('input');
  const favicon  = document.createElement('img');
  const title    = document.createElement('span');

  checkbox.type = 'checkbox';
  checkbox.dataset.tabId  = tab.id;
  checkbox.dataset.tabUrl = tab.url ?? '';

  favicon.className = 'tab-favicon';
  favicon.src = tab.favIconUrl || '../icons/unlocked_16.png';
  favicon.onerror = () => { favicon.style.display = 'none'; };

  title.className   = 'tab-title';
  title.textContent = tab.title || tab.url || '(untitled)';

  li.appendChild(checkbox); li.appendChild(favicon); li.appendChild(title);

  li.addEventListener('click', e => {
    if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
    li.classList.toggle('selected', checkbox.checked);
  });
  checkbox.addEventListener('change', () => li.classList.toggle('selected', checkbox.checked));
  return li;
}

// ── Blocklist domain input ────────────────────────────────────────────────────
$('btn-add-domain').addEventListener('click', addDomain);
domainInput.addEventListener('keydown', e => { if (e.key === 'Enter') addDomain(); });

function addDomain() {
  const raw = domainInput.value.trim();
  if (!raw) return;
  let hostname = raw;
  try { hostname = new URL(raw.includes('://') ? raw : 'https://' + raw).hostname; } catch {}
  if (!hostname || blockedDomains.includes(hostname)) { domainInput.value = ''; return; }
  blockedDomains.push(hostname);
  domainInput.value = '';
  renderDomainList();
}

function renderDomainList() {
  domainList.innerHTML = '';
  blockedDomains.forEach((d, i) => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.addEventListener('click', () => { blockedDomains.splice(i, 1); renderDomainList(); });
    li.appendChild(document.createTextNode(d));
    li.appendChild(btn);
    domainList.appendChild(li);
  });
}

// ── Preset picker ─────────────────────────────────────────────────────────────
presetPicker.addEventListener('change', async () => {
  const id = presetPicker.value;
  if (!id) return;
  const presets = await getPresets();
  const preset  = presets.find(p => p.id === id);
  if (!preset) return;
  loadPresetIntoForm(preset);
});

function loadPresetIntoForm(preset) {
  // Switch mode tab
  modeTabs.forEach(t => {
    const active = t.dataset.mode === preset.mode;
    t.classList.toggle('active', active);
  });
  currentMode = preset.mode;
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.add('hidden'));
  $(`panel-${currentMode}`).classList.remove('hidden');

  if (preset.mode === 'blocklist') {
    blockedDomains = [...(preset.blocklist || [])];
    renderDomainList();
    $('bl-duration').value = preset.durationMin || 25;
  } else if (preset.mode === 'pomodoro') {
    $('pomo-work').value   = preset.pomodoroWork   || 25;
    $('pomo-break').value  = preset.pomodoroBreak  || 5;
    $('pomo-long').value   = preset.pomodoroLongBreak || 15;
    $('pomo-cycles').value = preset.pomodoroLongAfter || 4;
  } else {
    $('duration').value = preset.durationMin || 25;
  }
}

// ── Start session ─────────────────────────────────────────────────────────────
btnStart.addEventListener('click', async () => {
  clearError();
  const session = buildSessionFromForm();
  if (!session) return;
  await chrome.storage.local.set({ session });
  await chrome.runtime.sendMessage({ type: 'START_SESSION', session });
  showView('active');
  renderActiveView(session);
});

function buildSessionFromForm() {
  const id = `sess_${Date.now()}`;
  const base = {
    active: true, id, mode: currentMode,
    startTime: Date.now(), presetName: null,
    safeTabIds: [], safeTabUrls: {}, anchorTabId: null, blocklist: [],
    phase: null, cycle: 1, totalCycles: 4,
    workMs: 25*60000, breakMs: 5*60000, longBreakMs: 15*60000,
    phaseEndTime: null,
  };

  if (currentMode === 'safetabs' || currentMode === 'pomodoro') {
    const listEl = currentMode === 'pomodoro' ? pomoTabList : tabList;
    const checked = [...listEl.querySelectorAll('input:checked')];
    if (checked.length === 0 && currentMode === 'safetabs') {
      return showError('Select at least one Safe Tab.'), null;
    }
    base.safeTabIds  = checked.map(c => Number(c.dataset.tabId));
    base.safeTabUrls = Object.fromEntries(checked.map(c => [c.dataset.tabId, c.dataset.tabUrl]));
    base.anchorTabId = base.safeTabIds[0] || null;
  }

  if (currentMode === 'safetabs') {
    const dur = parseInt($('duration').value, 10);
    if (!dur || dur < 1) return showError('Enter a valid duration.'), null;
    return { ...base, endTime: Date.now() + dur*60000, durationMs: dur*60000 };
  }

  if (currentMode === 'blocklist') {
    if (blockedDomains.length === 0) return showError('Add at least one domain.'), null;
    const dur = parseInt($('bl-duration').value, 10);
    if (!dur || dur < 1) return showError('Enter a valid duration.'), null;
    return { ...base, blocklist: [...blockedDomains], endTime: Date.now() + dur*60000, durationMs: dur*60000 };
  }

  if (currentMode === 'pomodoro') {
    const workMin   = parseInt($('pomo-work').value, 10)   || 25;
    const breakMin  = parseInt($('pomo-break').value, 10)  || 5;
    const longMin   = parseInt($('pomo-long').value, 10)   || 15;
    const cycles    = parseInt($('pomo-cycles').value, 10) || 4;
    const workMs    = workMin * 60000;
    const breakMs   = breakMin * 60000;
    const longBreakMs = longMin * 60000;
    const totalMs   = cycles * (workMs + breakMs);
    const phaseEndTime = Date.now() + workMs;
    return { ...base, mode: 'pomodoro', phase: 'work', totalCycles: cycles,
             workMs, breakMs, longBreakMs,
             endTime: Date.now() + totalMs, durationMs: totalMs, phaseEndTime };
  }

  return null;
}

// ── Active view ───────────────────────────────────────────────────────────────
async function renderActiveView(session) {
  if (countdownTimer) clearInterval(countdownTimer);

  // Redirect to anchor if current tab is blocked
  if (session.mode !== 'blocklist') {
    const [cur] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (cur && session.safeTabIds && !session.safeTabIds.includes(cur.id)) {
      chrome.tabs.update(session.anchorTabId, { active: true });
    }
  }

  function tick() {
    const endTime = session.mode === 'pomodoro' ? session.phaseEndTime : session.endTime;
    const remaining = Math.max(0, endTime - Date.now());
    const total     = session.mode === 'pomodoro' ? session.workMs : session.durationMs;
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    countdown.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    // Phase badge
    const phase = session.phase;
    phaseBadge.textContent = phase === 'work' ? 'Work' : phase === 'longbreak' ? 'Long Break' : phase === 'break' ? 'Break' : session.mode.charAt(0).toUpperCase() + session.mode.slice(1);
    phaseBadge.className   = `phase-badge${phase === 'break' ? ' break' : phase === 'longbreak' ? ' longbreak' : ''}`;
    countdown.className    = `countdown${(phase === 'break' || phase === 'longbreak') ? ' break' : ''}`;
    logoDot.className      = `logo-dot${(phase === 'break' || phase === 'longbreak') ? ' break' : ' locked'}`;

    // Progress bar
    const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;
    progressFill.style.width = `${pct}%`;

    if (remaining === 0) clearInterval(countdownTimer);
  }

  // Cycle dots for pomodoro
  if (session.mode === 'pomodoro') {
    cycleDots.classList.remove('hidden');
    cycleDots.innerHTML = '';
    for (let i = 1; i <= session.totalCycles; i++) {
      const dot = document.createElement('div');
      dot.className = `cycle-dot${i < session.cycle ? ' done' : i === session.cycle ? ' current' : ''}`;
      cycleDots.appendChild(dot);
    }
    sessionMeta.textContent = `Cycle ${session.cycle}/${session.totalCycles}`;
  } else {
    cycleDots.classList.add('hidden');
    const modeLabel = session.mode === 'blocklist'
      ? `${(session.blocklist || []).length} domain(s) blocked`
      : `${(session.safeTabIds || []).length} safe tab(s)`;
    sessionMeta.textContent = modeLabel;
  }

  tick();
  countdownTimer = setInterval(tick, 500);
}

btnUnlock.addEventListener('click', async () => {
  const res = await chrome.runtime.sendMessage({ type: 'EMERGENCY_UNLOCK' });
  if (res?.needsPin) return; // PIN page opens; popup will close
  if (countdownTimer) clearInterval(countdownTimer);
  logoDot.className = 'logo-dot';
  await populateTabLists();
  blockedDomains = [];
  renderDomainList();
  showView('select');
});

// ── Presets view ──────────────────────────────────────────────────────────────
btnSavePreset.addEventListener('click', () => {
  $('preset-name-input').value = '';
  modalOverlay.classList.remove('hidden');
});

$('btn-cancel-preset').addEventListener('click', () => modalOverlay.classList.add('hidden'));

$('btn-confirm-preset').addEventListener('click', async () => {
  const name = $('preset-name-input').value.trim();
  if (!name) return;
  modalOverlay.classList.add('hidden');
  await saveCurrentAsPreset(name);
  const presets = await getPresets();
  populatePresetPicker(presets);
});

async function saveCurrentAsPreset(name) {
  const presets = await getPresets();
  if (presets.length >= 20) { alert('Max 20 presets.'); return; }

  const preset = {
    id: `preset_${Date.now()}`,
    name,
    mode: currentMode,
    durationMin: currentMode === 'blocklist' ? parseInt($('bl-duration').value, 10) : parseInt($('duration').value, 10),
    blocklist: currentMode === 'blocklist' ? [...blockedDomains] : [],
    pomodoroWork: parseInt($('pomo-work').value, 10) || 25,
    pomodoroBreak: parseInt($('pomo-break').value, 10) || 5,
    pomodoroLongBreak: parseInt($('pomo-long').value, 10) || 15,
    pomodoroLongAfter: parseInt($('pomo-cycles').value, 10) || 4,
  };
  presets.push(preset);
  await chrome.storage.sync.set({ presets });
}

async function renderPresets() {
  const presets = await getPresets();
  presetsList.innerHTML = '';
  presetsEmpty.classList.toggle('hidden', presets.length > 0);
  presets.forEach(p => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    const name = document.createElement('div');
    const meta = document.createElement('div');
    name.className = 'preset-name';
    name.textContent = p.name;
    meta.className = 'preset-meta';
    meta.textContent = `${p.mode}${p.mode === 'pomodoro' ? ` · ${p.pomodoroWork}/${p.pomodoroBreak}min · ${p.pomodoroLongAfter} cycles` : ` · ${p.durationMin}min`}`;
    info.appendChild(name); info.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'preset-actions';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn-ghost-sm';
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => { loadPresetIntoForm(p); showView('select'); });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-ghost-sm';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', async () => {
      const updated = (await getPresets()).filter(x => x.id !== p.id);
      await chrome.storage.sync.set({ presets: updated });
      renderPresets();
      populatePresetPicker(updated);
    });

    actions.appendChild(loadBtn); actions.appendChild(delBtn);
    li.appendChild(info); li.appendChild(actions);
    presetsList.appendChild(li);
  });
}

function populatePresetPicker(presets) {
  const options = ['<option value="">— Load a preset —</option>',
    ...presets.map(p => `<option value="${p.id}">${p.name}</option>`)];
  presetPicker.innerHTML = options.join('');
  // also populate schedule preset picker
  schedPreset.innerHTML = ['<option value="">Pick preset…</option>',
    ...presets.map(p => `<option value="${p.id}">${p.name}</option>`)].join('');
}

// ── History view ──────────────────────────────────────────────────────────────
async function renderHistory() {
  const result  = await chrome.storage.local.get('history');
  const history = result.history ?? { sessions: [], totalFocusMs: 0 };
  const sessions = history.sessions || [];

  // Stats
  $('stat-sessions').textContent = sessions.filter(s => !s.aborted).length;
  $('stat-total').textContent    = formatHours(history.totalFocusMs || 0);
  $('stat-streak').textContent   = computeStreak(sessions);

  historyList.innerHTML = '';
  historyEmpty.classList.toggle('hidden', sessions.length > 0);

  sessions.slice(0, 50).forEach(s => {
    const li     = document.createElement('li');
    const left   = document.createElement('div');
    const date   = document.createElement('div');
    const mode   = document.createElement('div');
    const right  = document.createElement('div');
    const badge  = document.createElement('span');
    const dur    = document.createElement('div');

    date.textContent = new Date(s.startTime).toLocaleDateString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    mode.className   = 'history-mode';
    mode.textContent = `${s.mode}${s.cyclesCompleted ? ` · ${s.cyclesCompleted} cycles` : ''}`;
    left.appendChild(date); left.appendChild(mode);

    badge.className   = s.aborted ? 'badge-abort' : 'badge-done';
    badge.textContent = s.aborted ? 'Stopped' : 'Done ✓';
    dur.textContent   = formatDuration(s.durationMs);
    dur.style.fontSize = '11px'; dur.style.color = '#555';
    right.style.textAlign = 'right';
    right.appendChild(badge); right.appendChild(dur);

    li.appendChild(left); li.appendChild(right);
    historyList.appendChild(li);
  });
}

$('btn-clear-history').addEventListener('click', async () => {
  if (!confirm('Clear all history?')) return;
  await chrome.storage.local.remove('history');
  renderHistory();
});

// ── Settings view ─────────────────────────────────────────────────────────────
async function renderSettings() {
  const settings = await getSettings();

  // PIN
  const hasPin = !!settings.pin;
  $('pin-status').textContent = hasPin ? 'PIN is set' : 'No PIN set';
  $('btn-set-pin').textContent = hasPin ? 'Change PIN' : 'Set PIN';

  // Schedules
  const schedules = settings.scheduledSessions || [];
  scheduleList.innerHTML = '';
  scheduleEmpty.classList.toggle('hidden', schedules.length > 0);
  schedules.forEach(sched => {
    const li = document.createElement('li');
    const days = (sched.days || []).join(',');
    li.innerHTML = `<span>${sched.time} · ${days} · <em>${sched.label || ''}</em></span>`;
    const del = document.createElement('button');
    del.className = 'btn-ghost-sm';
    del.textContent = '×';
    del.addEventListener('click', async () => {
      const s = await getSettings();
      s.scheduledSessions = (s.scheduledSessions || []).filter(x => x.id !== sched.id);
      await chrome.storage.sync.set({ settings: s });
      await chrome.runtime.sendMessage({ type: 'REARM_SCHEDULES' });
      renderSettings();
    });
    li.appendChild(del);
    scheduleList.appendChild(li);
  });
}

// PIN form
$('btn-set-pin').addEventListener('click', () => {
  $('pin-display').classList.add('hidden');
  $('pin-form').classList.remove('hidden');
});
$('btn-cancel-pin').addEventListener('click', () => {
  $('pin-display').classList.remove('hidden');
  $('pin-form').classList.add('hidden');
});
$('btn-save-pin').addEventListener('click', async () => {
  const pin = $('pin-input').value.trim();
  if (pin && pin.length < 3) { alert('PIN must be at least 3 characters.'); return; }
  const settings = await getSettings();
  settings.pin = pin || null;
  await chrome.storage.sync.set({ settings });
  $('pin-input').value = '';
  $('pin-display').classList.remove('hidden');
  $('pin-form').classList.add('hidden');
  renderSettings();
});
$('btn-remove-pin').addEventListener('click', async () => {
  const settings = await getSettings();
  settings.pin = null;
  await chrome.storage.sync.set({ settings });
  $('pin-input').value = '';
  $('pin-display').classList.remove('hidden');
  $('pin-form').classList.add('hidden');
  renderSettings();
});

// Schedule add
$('btn-add-schedule').addEventListener('click', async () => {
  const time     = $('sched-time').value;
  const presetId = schedPreset.value;
  if (!presetId) { alert('Pick a preset first.'); return; }
  const days = [...document.querySelectorAll('.day-check input:checked')].map(c => c.value);
  if (days.length === 0) { alert('Select at least one day.'); return; }
  const presets  = await getPresets();
  const preset   = presets.find(p => p.id === presetId);
  const settings = await getSettings();
  settings.scheduledSessions = settings.scheduledSessions || [];
  settings.scheduledSessions.push({
    id: `sched_${Date.now()}`,
    label: preset?.name || '',
    presetId, time, days, enabled: true,
  });
  await chrome.storage.sync.set({ settings });
  renderSettings();
});

// ── Storage helpers ───────────────────────────────────────────────────────────
async function getSession() {
  const r = await chrome.storage.local.get('session');
  return r.session ?? { active: false };
}
async function getPresets() {
  const r = await chrome.storage.sync.get('presets');
  return r.presets ?? [];
}
async function getSettings() {
  const r = await chrome.storage.sync.get('settings');
  return r.settings ?? {};
}

// ── Utility ───────────────────────────────────────────────────────────────────
function showError(msg) { errorMsg.textContent = msg; errorMsg.classList.remove('hidden'); }
function clearError()   { errorMsg.textContent = ''; errorMsg.classList.add('hidden'); }

function formatDuration(ms) {
  if (!ms) return '—';
  const m = Math.floor(ms / 60000);
  return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;
}
function formatHours(ms) {
  const h = ms / 3600000;
  return h >= 1 ? `${h.toFixed(1)}h` : `${Math.round(ms/60000)}m`;
}
function computeStreak(sessions) {
  const completed = sessions.filter(s => !s.aborted);
  if (!completed.length) return 0;
  const days = new Set(completed.map(s => new Date(s.startTime).toDateString()));
  let streak = 0;
  const d = new Date(); d.setHours(0, 0, 0, 0);
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
