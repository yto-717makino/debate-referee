'use client';

import { useState } from 'react';

interface TopicInputProps {
  onSubmit: (topic: string, apiKey: string) => void;
}

export default function TopicInput({ onSubmit }: TopicInputProps) {
  const [topic, setTopic] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && apiKey.trim()) {
      onSubmit(topic.trim(), apiKey.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* API Key */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <h2 className="text-lg font-bold text-zinc-800 mb-1">OpenAI APIキー</h2>
        <p className="text-xs text-zinc-500 mb-4">
          判定に使用するAPIキーを入力してください。キーはサーバーに送信されますが、保存されません。
        </p>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-3 pr-16 border border-zinc-300 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-700 px-2 py-1"
          >
            {showKey ? '隠す' : '表示'}
          </button>
        </div>
      </div>

      {/* Topic */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <h2 className="text-lg font-bold text-zinc-800 mb-1">ディベートの論題</h2>
        <p className="text-xs text-zinc-500 mb-4">
          肯定側と否定側に分かれて議論するテーマを入力してください
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="例: AIは人類にとって脅威である"
            rows={3}
            className="w-full px-4 py-3 border border-zinc-300 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            type="submit"
            disabled={!topic.trim() || !apiKey.trim()}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
          >
            ディベートを開始する
          </button>
        </form>
      </div>
    </div>
  );
}
