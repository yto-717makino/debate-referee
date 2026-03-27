'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Side, SideNames } from '@/lib/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useBrowserAudioRecorder } from '@/hooks/useBrowserAudioRecorder';

interface ChatRecorderProps {
  stageLabel: string;
  stageIcon: string;
  headerBg: string;
  headerBorder: string;
  headerTextColor: string;
  sideNames: SideNames;
  onFinish: (messages: ChatMessage[]) => void;
  deviceId?: string;
  isBrowserAudio?: boolean;
  apiKey?: string;
  topic?: string;
}

export default function ChatRecorder({
  stageLabel, stageIcon, headerBg, headerBorder, headerTextColor,
  sideNames, onFinish, deviceId, isBrowserAudio, apiKey, topic,
}: ChatRecorderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSide, setActiveSide] = useState<Side>('affirmative');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddMessage = (text: string) => {
    setMessages(prev => [...prev, { side: activeSide, text }]);
    // Auto-switch side
    setActiveSide(prev => prev === 'affirmative' ? 'negative' : 'affirmative');
  };

  const handleFinish = () => {
    if (messages.length > 0) {
      onFinish(messages);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`bg-white rounded-2xl shadow-sm border ${headerBorder} overflow-hidden`}>
        {/* Header */}
        <div className={`${headerBg} px-6 py-4`}>
          <h2 className={`text-lg font-bold ${headerTextColor} flex items-center gap-2`}>
            <span>{stageIcon}</span>
            {stageLabel}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {sideNames.affirmative}・{sideNames.negative}が交互に発言してください
          </p>
        </div>

        {/* Chat Messages */}
        <div className="px-4 py-4 max-h-[300px] overflow-y-auto bg-zinc-50 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-6">
              まだ発言がありません。下のボタンから録音してください。
            </p>
          )}
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} sideNames={sideNames} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Speaker Selector + Recorder */}
        <div className="border-t border-zinc-200 p-4 space-y-3">
          {/* Speaker Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSide('affirmative')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSide === 'affirmative'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {sideNames.affirmative}
            </button>
            <button
              onClick={() => setActiveSide('negative')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSide === 'negative'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {sideNames.negative}
            </button>
          </div>

          {/* Input Area */}
          {isBrowserAudio ? (
            <BrowserInput
              onSubmit={handleAddMessage}
              apiKey={apiKey || ''}
              activeSide={activeSide}
              topic={topic}
            />
          ) : (
            <MicInput
              onSubmit={handleAddMessage}
              deviceId={deviceId}
              activeSide={activeSide}
            />
          )}
        </div>

        {/* Finish Button */}
        {messages.length > 0 && (
          <div className="border-t border-zinc-200 p-4">
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-900 transition-colors"
            >
              このステップを完了する（{messages.length}件の発言）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ message, sideNames }: { message: ChatMessage; sideNames: SideNames }) {
  const isAff = message.side === 'affirmative';
  return (
    <div className={`flex ${isAff ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        isAff
          ? 'bg-blue-100 text-blue-900 rounded-bl-sm'
          : 'bg-rose-100 text-rose-900 rounded-br-sm'
      }`}>
        <div className={`text-[10px] font-bold mb-0.5 ${isAff ? 'text-blue-500' : 'text-rose-500'}`}>
          {isAff ? sideNames.affirmative : sideNames.negative}
        </div>
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </div>
  );
}

function MicInput({ onSubmit, deviceId, activeSide }: { onSubmit: (text: string) => void; deviceId?: string; activeSide: Side }) {
  const { transcript, interimTranscript, isListening, error, start, stop, reset } = useSpeechRecognition();
  const [editedText, setEditedText] = useState('');
  const prevListeningRef = useRef(false);

  // When recording stops, seed editedText from transcript
  useEffect(() => {
    if (prevListeningRef.current && !isListening && transcript) {
      setEditedText(transcript);
    }
    prevListeningRef.current = isListening;
  }, [isListening, transcript]);

  const handleToggle = () => {
    if (isListening) {
      stop();
    } else {
      reset();
      setEditedText('');
      start(deviceId);
    }
  };

  const handleSend = () => {
    stop();
    if (editedText.trim()) {
      onSubmit(editedText.trim());
      setEditedText('');
      reset();
    }
  };

  const sideColor = activeSide === 'affirmative' ? 'bg-blue-600' : 'bg-rose-600';
  const showLiveTranscript = isListening && (transcript || interimTranscript);
  const showEditableTextarea = !isListening && editedText;

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
      )}

      {/* Live transcript (read-only, during recording) */}
      {showLiveTranscript && (
        <div className="p-3 bg-zinc-100 rounded-xl text-sm min-h-[40px] max-h-[100px] overflow-y-auto">
          <span className="text-zinc-800">{transcript}</span>
          {interimTranscript && <span className="text-zinc-400">{interimTranscript}</span>}
        </div>
      )}

      {/* Editable textarea (after recording stops) */}
      {showEditableTextarea && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span>✏️</span>
            <span>送信前にテキストを編集できます</span>
          </div>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-3 bg-zinc-50 rounded-xl border border-zinc-300 text-sm min-h-[40px] max-h-[100px] text-zinc-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          />
        </div>
      )}

      <div className="flex gap-2">
        {/* Record Button */}
        <button
          onClick={handleToggle}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
            isListening ? `${sideColor} scale-105 shadow-md` : 'bg-zinc-200 hover:bg-zinc-300'
          }`}
          style={isListening ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
        >
          {isListening ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!editedText.trim() || isListening}
          className="flex-1 py-2.5 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-900 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed text-sm"
        >
          送信
        </button>
      </div>
    </div>
  );
}

function BrowserInput({ onSubmit, apiKey, activeSide, topic }: { onSubmit: (text: string) => void; apiKey: string; activeSide: Side; topic?: string }) {
  const { isRecording, isTranscribing, transcript, error, start, stopAndTranscribe, reset } = useBrowserAudioRecorder();
  const [editedText, setEditedText] = useState('');

  // When transcription completes, seed editedText
  useEffect(() => {
    if (transcript && !isTranscribing) {
      setEditedText(transcript);
    }
  }, [transcript, isTranscribing]);

  const handleToggle = async () => {
    if (isRecording) {
      const prompt = topic ? `ディベートの論題「${topic}」に関する発言の文字起こし。` : undefined;
      await stopAndTranscribe(apiKey, prompt ? { prompt } : undefined);
    } else {
      reset();
      setEditedText('');
      await start();
    }
  };

  const handleSend = () => {
    if (editedText.trim()) {
      onSubmit(editedText.trim());
      setEditedText('');
      reset();
    }
  };

  const sideColor = activeSide === 'affirmative' ? 'bg-blue-600' : 'bg-rose-600';
  const showEditableTextarea = !isRecording && !isTranscribing && editedText;

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
      )}

      {isTranscribing && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full" />
          <span className="text-xs text-zinc-500">文字起こし中...</span>
        </div>
      )}

      {/* Editable textarea (after transcription completes) */}
      {showEditableTextarea && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span>✏️</span>
            <span>送信前にテキストを編集できます</span>
          </div>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-3 bg-zinc-50 rounded-xl border border-zinc-300 text-sm min-h-[40px] max-h-[100px] text-zinc-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          disabled={isTranscribing}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-50 ${
            isRecording ? `${sideColor} scale-105 shadow-md` : 'bg-zinc-200 hover:bg-zinc-300'
          }`}
          style={isRecording ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
        >
          {isRecording ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
              <path d="M10 8v6l4.5-3z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleSend}
          disabled={!editedText.trim() || isRecording || isTranscribing}
          className="flex-1 py-2.5 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-900 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed text-sm"
        >
          送信
        </button>
      </div>
    </div>
  );
}
