'use client';

import { useState } from 'react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
}

export default function TopicInput({ onSubmit }: TopicInputProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <h2 className="text-xl font-bold text-zinc-800 mb-2">ディベートの論題を入力</h2>
        <p className="text-sm text-zinc-500 mb-6">
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
            disabled={!topic.trim()}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
          >
            ディベートを開始する
          </button>
        </form>
      </div>
    </div>
  );
}
