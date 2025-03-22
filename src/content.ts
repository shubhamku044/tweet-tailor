// Content Script
console.log('Content script loaded!');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  console.log(sender, sendResponse);

  if (message.action === 'showAlert') {
    alert('Hello from Content Script!');
  }
});
