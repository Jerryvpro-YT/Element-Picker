console.log('Background service worker started');

chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked, tab:', tab.id);
  chrome.tabs.sendMessage(tab.id, { action: 'toggle' }).catch((err) => {
    console.log('Error sending message:', err);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).then(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    }).catch((e) => console.log('Injection failed:', e));
  });
});