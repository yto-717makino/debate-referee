'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface SpeechRecorderProps {
  onFinish: (transcript: string) => void;
  deviceId?: string;
  accentColor: string;
}

export default function SpeechRecorder({ onFinish, deviceId, accentColor }: SpeechRecorderProps) {
  const { transcript, interimTranscript, isListening, isSupported, error, start, stop, reset } = useSpeechRecognition();
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isListening) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleToggle = () => {
    if (isListening) {
      stop();
    } else {
      reset();
      start(deviceId);
    }
  };

  const handleFinish = () => {
    stop();
    if (transcript.trim()) {
      onFinish(transcript.trim());
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
        お使いのブラウザは音声認識に対応していません。Chrome または Edge をご利用ください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleToggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? `${accentColor} scale-110 shadow-lg`
              : 'bg-zinc-200 hover:bg-zinc-300'
          }`}
          style={isListening ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
        >
          {isListening ? (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>

        {isListening && (
          <span className="text-lg font-mono text-zinc-600">{formatTime(elapsed)}</span>
        )}
      </div>

      <p className="text-center text-sm text-zinc-500">
        {isListening ? '話してください... リアルタイムで文字起こしされます' : 'マイクボタンを押して録音を開始'}
      </p>

      {(transcript || interimTranscript) && (
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 min-h-[80px] max-h-[200px] overflow-y-auto">
          <span className="text-zinc-800">{transcript}</span>
          {interimTranscript && (
            <span className="text-zinc-400">{interimTranscript}</span>
          )}
        </div>
      )}

      {!isListening && transcript.trim() && (
        <button
          onClick={handleFinish}
          className={`w-full py-3 text-white font-semibold rounded-xl transition-colors ${accentColor} hover:opacity-90`}
        >
          この内容で確定する
        </button>
      )}
    </div>
  );
}
