const QUOTES = [
  '"The secret of getting ahead is getting started." — Mark Twain',
  '"Deep work is the superpower of the 21st century." — Cal Newport',
  '"Focus is the art of knowing what to ignore." — Anonymous',
  '"The successful warrior is the average man with laser-like focus." — Bruce Lee',
  '"Done is better than perfect, but started is better than distracted." — Anonymous',
  '"You don\'t have to be great to start, but you have to start to be great." — Zig Ziglar',
  '"Concentrate all your thoughts upon the work in hand." — Alexander Graham Bell',
  '"Lost time is never found again." — Benjamin Franklin',
  '"Your future is created by what you do today." — Anonymous',
  '"The way to get started is to quit talking and begin doing." — Walt Disney',
];

const params     = new URLSearchParams(location.search);
const restoreUrl = params.get('restore');
const blockedUrl = params.get('blocked');
const isAnchor   = params.get('anchor') === '1';

// Random quote
document.getElementById('quote').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

// Blocked info
if (blockedUrl) {
  const infoEl = document.getElementById('blocked-info');
  try {
    const hostname = new URL(blockedUrl).hostname;
    infoEl.textContent = `You tried to visit: ${hostname}`;
  } catch {
    infoEl.textContent = `Blocked URL: ${blockedUrl}`;
  }
  infoEl.classList.remove('hidden');
}

// Live session stats
let timer = null;

async function updateStats() {
  const result = await chrome.storage.local.get('session');
  const session = result.session;
  if (!session || !session.active) {
    document.getElementById('time-left').textContent = '—';
    document.getElementById('phase-label').textContent = '—';
    document.getElementById('cycle-label').textContent = '—';
    if (timer) clearInterval(timer);
    return;
  }

  const endTime = session.mode === 'pomodoro' ? session.phaseEndTime : session.endTime;
  const remaining = Math.max(0, endTime - Date.now());
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  document.getElementById('time-left').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const phase = session.phase;
  document.getElementById('phase-label').textContent =
    phase === 'work' ? 'Work' :
    phase === 'break' ? 'Break' :
    phase === 'longbreak' ? 'Long Break' :
    session.mode.charAt(0).toUpperCase() + session.mode.slice(1);

  document.getElementById('cycle-label').textContent =
    session.mode === 'pomodoro' ? `${session.cycle}/${session.totalCycles}` : '—';
}

updateStats();
timer = setInterval(updateStats, 1000);

// Back to Work button
document.getElementById('btn-back').addEventListener('click', async () => {
  if (restoreUrl) {
    // Navigate this tab back to its locked URL
    location.href = restoreUrl;
    return;
  }
  // Ask background to focus the anchor tab
  await chrome.runtime.sendMessage({ type: 'RESTORE_ANCHOR' });
});
