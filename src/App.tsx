import React, { useCallback, useState } from 'react';
import './App.css';

const professionalContext = `
You're a Software Engineer specializing in:
- React/TypeScript architecture
- Modern web development practices
- Scalable backend systems
- Developer tooling optimizations
Respond with concise technical insights.
`;

const App: React.FC = () => {
  const [reply, setReply] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

  const generateReply = useCallback(async (tweetText: string) => {
    try {
      const startTime = Date.now();
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `${professionalContext}\nFormat: <2 sentences> <1 emoji> <technical-hashtag>`
            },
            {
              role: "user",
              content: `Analyze tweet and generate expert response:\n"${tweetText}"`
            }
          ],
          temperature: 0.5,
          max_tokens: 120,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();

      return data.choices[0].message.content;

    } catch (error) {
      console.error('DeepSeek Error:', error);
      throw error;
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const tweet = await getTweet();
      if (!tweet?.trim()) throw new Error('No tweet content found');

      const reply = await generateReply(tweet);
      setReply(reply.slice(0, 280)); // Twitter's limit

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [generateReply, isLoading]);

  return (
    <div className="extension-container">
      <header className="extension-header">
        <span className="app-title">
          🎀 Reach Paglu
        </span>
      </header>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="generate-btn"
      >
        {isLoading ? (
          <>
            <div className="spinner" />
            Analyzing Tweet...
          </>
        ) : (
          '🌸 Generate Magic Reply'
        )}
      </button>

      {error && (
        <div className="error-message">
          {error.includes('quota') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💖</span>
              <span>{error}</span>
            </div>
          ) : error}
        </div>
      )}

      {reply && (
        <div className="reply-card">
          <div className="reply-content">{reply}</div>
          <div className="reply-actions">
            <button
              onClick={() => navigator.clipboard.writeText(reply)}
              className="copy-btn"
            >
              📋 Copy Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
