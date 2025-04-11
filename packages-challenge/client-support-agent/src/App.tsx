import React from 'react';
import { Send } from 'lucide-react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  dangerouslyAllowBrowser: true
});

// Define default questions
const defaultQuestions = [
  "在imToken中如何添加Bitcoin钱包?",
  "在imToken中如何导出Bitcoin私钥?",
  "在imToken中如何修改钱包密码？",
];

function App() {
  const [message, setMessage] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: 'gpt-4o-mini',
      });

      setResponse(completion.choices[0].message.content || '');
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for clicking a default question
  const handleDefaultQuestionClick = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Chat Assistant</h1>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </form>

        {/* Render default question buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-2 self-center">Try asking:</span>
          {defaultQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => handleDefaultQuestionClick(q)}
              disabled={loading}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {loading && (
          <div className="animate-pulse text-gray-500 text-center py-4">
            Thinking...
          </div>
        )}

        {response && (
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
            <h2 className="font-semibold text-gray-700 mb-2">Response:</h2>
            <p className="text-gray-600">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
