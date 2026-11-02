// TrustShield AI Browser Extension Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['backendUrl', 'webAppUrl'], (data) => {
    if (!data.backendUrl) {
      chrome.storage.sync.set({ backendUrl: 'http://localhost:8000' });
    }
    if (!data.webAppUrl) {
      chrome.storage.sync.set({ webAppUrl: 'http://localhost:5173' });
    }
  });
  console.log('TrustShield AI Extension installed and configured.');
});

