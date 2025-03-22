import React from 'react';
import OpenAI from 'openai';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY

const App: React.FC = () => {

  const openai = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true
  });
  console.log('openai', openai);

  const getTweet = async () => {
    const [tab] = await chrome.tabs.query({
      active: true, currentWindow: true,
    });

    if (!tab?.id) {
      console.log('No active tab found');
      return
    }

    try {
      const injectionResult = await chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        func: () => {
          const tweetElement = document.querySelector(
            'article[data-testid="tweet"] div[data-testid="tweetText"]'
          ) as HTMLDivElement;
          const spans = tweetElement?.querySelectorAll('span');
          return spans ? Array.from(spans)
            .map(span => span.textContent)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim() : '';
        }
      })

      const tweetText = injectionResult[0].result;
      console.log('Tweet Text:', tweetText);
      return tweetText;

    } catch (error) {
      console.error('Error extracting tweet:', error);
      if (error instanceof Error) {
        throw new Error(`Tweet extraction failed: ${error.message}`);
      }
      throw new Error('Unknown error occurred during tweet extraction');
    }
  }

  const fetchTweet = async () => {
    try {
      const tweet = await getTweet()
      console.log("Current tweet:", tweet);
      // Use the tweet content here
    } catch (error) {
      console.error("Failed to get tweet:", error);
    }
  };
  const handlePopupClick = () => {
    alert('Hello from Popup!');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showAlert' });
      }
    });
  };

  return (
    <div style={{ padding: '20px', minWidth: '200px' }}>
      <h1>Hello World Extension</h1>
      <button onClick={handlePopupClick}>
        Click for Alerts!
      </button>
      <button onClick={fetchTweet}>
        get tweet
      </button>
    </div>
  );
};

export default App;
