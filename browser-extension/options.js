const backendInput = document.getElementById('backendUrl');
const webAppInput = document.getElementById('webAppUrl');
const saveBtn = document.getElementById('saveBtn');
const savedMsg = document.getElementById('savedMsg');

// Load existing options
chrome.storage.sync.get(['backendUrl', 'webAppUrl'], (data) => {
  backendInput.value = data.backendUrl || 'http://localhost:8000';
  webAppInput.value = data.webAppUrl || 'http://localhost:5173';
});

saveBtn.addEventListener('click', () => {
  const backendUrl = backendInput.value.trim() || 'http://localhost:8000';
  const webAppUrl = webAppInput.value.trim() || 'http://localhost:5173';

  chrome.storage.sync.set({ backendUrl, webAppUrl }, () => {
    savedMsg.style.display = 'block';
    setTimeout(() => {
      savedMsg.style.display = 'none';
    }, 2500);
  });
});

