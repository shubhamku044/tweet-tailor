import React, { useState } from 'react';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY

const professionalContext = `
    You're a Software Engineer with 2+ years of experience in:
    - Full-stack development with React/Node.js
    - Modern web technologies (TypeScript, Vite, REST APIs)
    - Best practices in clean code and testing
    - Collaborative development in agile teams
    Respond in professional but approachable tone.
`

const App: React.FC = () => {
  const [reply, setReply] = useState<string | null>(null);
  const [isLoading,] = useState(false);
  const [error,] = useState<string | null>(null);

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    generationConfig: {
      temperature: 0.9,
      topP: 1,
      maxOutputTokens: 120
    }
  });

  const openai = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true
  });

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

  const generateReply = async (tweetText: string) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `${professionalContext}\n\nGenerate concise, professional Twitter replies that reflect technical expertise while remaining engaging. Follow these guidelines:
            - Keep under 280 characters
            - Use appropriate technical terms when relevant
            - Maintain positive and collaborative tone
            - Offer constructive perspectives
            - Include emojis sparingly (max 2)`
          },
          {
            role: "user",
            content: `Tweet to respond to: "${tweetText}"\n\nSuggested reply (professional software engineer perspective):`
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        max_tokens: 80
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating reply:', error);
      throw new Error('Failed to generate reply');
    }
  };
  const generateReplyGemini = async (tweetText: string) => {
    try {
      const prompt = `${professionalContext}\n\nAs a software engineer, generate a professional Twitter reply for:\n"${tweetText}"\n\nRequirements:
      - Max 120 characters
      - Technical but approachable
      - Include 1 relevant emoji
      - We can talk about anything
      - Think broadly and creatively
      - I am 21 years old boy and I am a software engineer
      - Can write in hinglish according to situation
      - create a reply like human, not like a robot
      - make the tweet small, also now write the fist letter in capital
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Gemini error:', error);
      throw new Error('Failed to generate reply - try again later');
    }
  };

  return (
    <div style={{
      padding: '20px',
      minWidth: '300px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <h1 style={{
        fontSize: '2.2rem',
        marginBottom: '1.5rem',
        color: '#E53888',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        Reach Paglu🎀
      </h1>

      <button
        onClick={fetchTweet}
        disabled={isLoading}
        style={{
          padding: '0.5rem 1rem',
          background: isLoading ? '#e2e8f0' : '#1da1f2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '1rem'
        }}
      >
        {isLoading ? 'Analyzing Tweet...' : 'Generate Technical Reply'}
      </button>

      {error && (
        <div style={{
          color: '#dc2626',
          padding: '0.5rem',
          backgroundColor: '#fee2e2',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {reply && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => navigator.clipboard.writeText(reply)}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#1da1f2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Copy
            </button>
          </div>

          <p style={{
            margin: 0,
            lineHeight: 1.4,
            fontSize: '0.9rem',
            color: '#1f2937'
          }}>
            {reply}
          </p>
        </div>
      )}
      <button onClick={async () => {
        try {
          const tweet = await getTweet();
          if (!tweet) {
            throw new Error('No tweet found');
          }
          const reply = await generateReplyGemini(tweet);
          console.log('Generated reply:', reply);
          setReply(reply);
        } catch (error) {
          console.error('Error generating reply:', error);
        }
      }}>
        gen reply
      </button>
    </div>
  );
};

export default App;
