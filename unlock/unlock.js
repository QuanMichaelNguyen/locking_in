const pinInput = document.getElementById('pin-input');
const errorMsg = document.getElementById('error-msg');

async function submit() {
  const pin = pinInput.value.trim();
  if (!pin) return;

  errorMsg.classList.add('hidden');
  const response = await chrome.runtime.sendMessage({ type: 'VERIFY_PIN', pin });

  if (response.ok) {
    window.close();
  } else {
    pinInput.value = '';
    errorMsg.classList.remove('hidden');
    pinInput.focus();
  }
}

document.getElementById('btn-submit').addEventListener('click', submit);
document.getElementById('btn-cancel').addEventListener('click', () => window.close());
pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
