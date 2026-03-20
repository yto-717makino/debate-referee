'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useBrowserAudioRecorder } from '@/hooks/useBrowserAudioRecorder';

interface SpeechRecorderProps {
  onFinish: (transcript: string) => void;
  deviceId?: string;
  accentColor: string;
  isBrowserAudio?: boolean;
  apiKey?: string;
}

export default function SpeechRecorder({ onFinish, deviceId, accentColor, isBrowserAudio, apiKey }: SpeechRecorderProps) {
  if (isBrowserAudio) {
    return (
      <BrowserAudioMode
        onFinish={onFinish}
        accentColor={accentColor}
        apiKey={apiKey || ''}
      />
    );
  }

  return (
    <MicMode
      onFinish={onFinish}
      deviceId={deviceId}
      accentColor={accentColor}
    />
  );
}

function MicMode({ onFinish, deviceId, accentColor }: { onFinish: (t: string) => void; deviceId?: string; accentColor: string }) {
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isListening]);

  const handleToggle = () => {
    if (isListening) { stop(); } else { reset(); start(deviceId); }
  };

  const handleFinish = () => {
    stop();
    if (transcript.trim()) onFinish(transcript.trim());
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
        お使いのブラウザは音声認識に対応していません。Chrome または Edge をご利用ください。
      </div>
    );
  }

  return (
    <RecorderUI
      isActive={isListening}
      elapsed={elapsed}
      transcript={transcript}
      interimTranscript={interimTranscript}
      error={error}
      accentColor={accentColor}
      activeLabel="話してください... リアルタイムで文字起こしされます"
      inactiveLabel="マイクボタンを押して録音を開始"
      onToggle={handleToggle}
      onFinish={handleFinish}
      canFinish={!isListening && !!transcript.trim()}
      isProcessing={false}
      iconType="mic"
    />
  );
}

function BrowserAudioMode({ onFinish, accentColor, apiKey }: { onFinish: (t: string) => void; accentColor: string; apiKey: string }) {
  const { isRecording, isTranscribing, transcript, error, start, stopAndTranscribe, reset } = useBrowserAudioRecorder();
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const handleToggle = async () => {
    if (isRecording) {
      await stopAndTranscribe(apiKey);
    } else {
      reset();
      await start();
    }
  };

  const handleFinish = () => {
    if (transcript.trim()) onFinish(transcript.trim());
  };

  return (
    <RecorderUI
      isActive={isRecording}
      elapsed={elapsed}
      transcript={transcript}
      interimTranscript=""
      error={error}
      accentColor={accentColor}
      activeLabel="ブラウザ音声を録音中... 停止すると文字起こしされます"
      inactiveLabel="ボタンを押してブラウザ音声の録音を開始（画面共有ダイアログが表示されます）"
      onToggle={handleToggle}
      onFinish={handleFinish}
      canFinish={!isRecording && !isTranscribing && !!transcript.trim()}
      isProcessing={isTranscribing}
      iconType="browser"
    />
  );
}

function RecorderUI({
  isActive, elapsed, transcript, interimTranscript, error, accentColor,
  activeLabel, inactiveLabel, onToggle, onFinish, canFinish, isProcessing, iconType,
}: {
  isActive: boolean; elapsed: number; transcript: string; interimTranscript: string;
  error: string | null; accentColor: string; activeLabel: string; inactiveLabel: string;
  onToggle: () => void; onFinish: () => void; canFinish: boolean; isProcessing: boolean;
  iconType: 'mic' | 'browser';
}) {
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onToggle}
          disabled={isProcessing}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
            isActive ? `${accentColor} scale-110 shadow-lg` : 'bg-zinc-200 hover:bg-zinc-300'
          }`}
          style={isActive ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
        >
          {isActive ? (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : iconType === 'mic' ? (
            <svg className="w-7 h-7 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
              <path d="M10 8v6l4.5-3z" />
            </svg>
          )}
        </button>

        {isActive && (
          <span className="text-lg font-mono text-zinc-600">{formatTime(elapsed)}</span>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full" />
          <span className="text-sm text-zinc-500">文字起こし中...</span>
        </div>
      )}

      <p className="text-center text-sm text-zinc-500">
        {isProcessing ? '' : isActive ? activeLabel : inactiveLabel}
      </p>

      {(transcript || interimTranscript) && (
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 min-h-[80px] max-h-[200px] overflow-y-auto">
          <span className="text-zinc-800">{transcript}</span>
          {interimTranscript && <span className="text-zinc-400">{interimTranscript}</span>}
        </div>
      )}

      {canFinish && (
        <button
          onClick={onFinish}
          className={`w-full py-3 text-white font-semibold rounded-xl transition-colors ${accentColor} hover:opacity-90`}
        >
          この内容で確定する
        </button>
      )}
    </div>
  );
}
