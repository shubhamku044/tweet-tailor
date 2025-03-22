// Background Service Worker
console.log('Background service worker loaded!');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
