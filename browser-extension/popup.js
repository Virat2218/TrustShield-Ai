let currentActiveUrl = '';
let backendUrl = 'http://localhost:8000';
let webAppUrl = 'http://localhost:5173';

const targetUrlEl = document.getElementById('targetUrl');
const scanBtn = document.getElementById('scanBtn');
const loadingBox = document.getElementById('loadingBox');
const errorBox = document.getElementById('errorBox');
const errorMessageEl = document.getElementById('errorMessage');
const resultBox = document.getElementById('resultBox');
const scoreCircle = document.getElementById('scoreCircle');
const riskScoreEl = document.getElementById('riskScore');
const riskBadgeEl = document.getElementById('riskBadge');
const riskSummaryEl = document.getElementById('riskSummary');
const warningsListEl = document.getElementById('warningsList');
const deepScanBtn = document.getElementById('deepScanBtn');
const reportBtn = document.getElementById('reportBtn');

// Initialize settings from storage
chrome.storage.sync.get(['backendUrl', 'webAppUrl'], (data) => {
  if (data.backendUrl) backendUrl = data.backendUrl;
  if (data.webAppUrl) webAppUrl = data.webAppUrl;
});

// Fetch active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs && tabs[0] && tabs[0].url) {
    currentActiveUrl = tabs[0].url;
    targetUrlEl.textContent = currentActiveUrl;
    targetUrlEl.title = currentActiveUrl;

    // Disallow scanning chrome internal urls
    if (currentActiveUrl.startsWith('chrome://') || currentActiveUrl.startsWith('about:')) {
      scanBtn.disabled = true;
      scanBtn.style.opacity = '0.5';
      targetUrlEl.textContent = 'Internal browser pages cannot be scanned.';
    }
  } else {
    targetUrlEl.textContent = 'No active website detected';
    scanBtn.disabled = true;
  }
});

scanBtn.addEventListener('click', async () => {
  if (!currentActiveUrl) return;

  // Reset UI
  errorBox.classList.add('hidden');
  resultBox.classList.add('hidden');
  loadingBox.classList.remove('hidden');
  scanBtn.disabled = true;
  scanBtn.style.opacity = '0.7';

  try {
    const response = await fetch(`${backendUrl}/api/analyze-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: currentActiveUrl }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned error ${response.status}`);
    }

    const data = await response.json();
    displayResults(data);
  } catch (err) {
    errorMessageEl.textContent = err.message || 'Could not connect to TrustShield scanner backend.';
    errorBox.classList.remove('hidden');
  } finally {
    loadingBox.classList.add('hidden');
    scanBtn.disabled = false;
    scanBtn.style.opacity = '1';
  }
});

function displayResults(data) {
  const score = data.risk_score || 0;
  const level = (data.risk_level || 'Low').toLowerCase();

  riskScoreEl.textContent = score;

  // Apply styles based on risk level
  scoreCircle.className = 'score-circle';
  riskBadgeEl.className = 'risk-badge';

  if (level === 'high') {
    scoreCircle.classList.add('high');
    riskBadgeEl.classList.add('high');
    riskBadgeEl.textContent = 'DANGEROUS';
  } else if (level === 'medium') {
    scoreCircle.classList.add('medium');
    riskBadgeEl.classList.add('medium');
    riskBadgeEl.textContent = 'SUSPICIOUS';
  } else {
    riskBadgeEl.textContent = 'SAFE';
  }

  riskSummaryEl.textContent = data.summary || (level === 'high' ? 'High risk scam or phishing site' : 'No critical threat detected');

  // Warnings
  warningsListEl.innerHTML = '';
  const warnings = data.warning_signs && data.warning_signs.length > 0
    ? data.warning_signs
    : ['No malicious domain heuristics detected', 'Valid protocol structure'];

  warnings.slice(0, 4).forEach((w) => {
    const li = document.createElement('li');
    li.textContent = w;
    warningsListEl.appendChild(li);
  });

  resultBox.classList.remove('hidden');
}

// Deep Scan in Web App
deepScanBtn.addEventListener('click', () => {
  const target = `${webAppUrl}/url-checker`;
  chrome.tabs.create({ url: target });
});

// Report Scam
reportBtn.addEventListener('click', () => {
  const target = `${webAppUrl}/report-scam`;
  chrome.tabs.create({ url: target });
});

