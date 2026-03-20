'use client';

import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/lib/transcribe';

export function useBrowserAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');
    chunksRef.current = [];

    try {
      // getDisplayMedia to capture browser/tab audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true, // Required by some browsers, but we only use audio
      });

      // Check if audio track exists
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(t => t.stop());
        setError('音声が選択されていません。画面共有時に「タブの音声を共有」にチェックを入れてください。');
        return;
      }

      // Stop video tracks, keep only audio
      stream.getVideoTracks().forEach(t => t.stop());

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(new MediaStream(audioTracks), { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000); // Collect chunks every second
      setIsRecording(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('画面共有がキャンセルされました。');
      } else {
        setError('ブラウザ音声の取得に失敗しました。');
      }
    }
  }, []);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Stop all tracks
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }, []);

  const stopAndTranscribe = useCallback(async (apiKey: string) => {
    const blob = await stop();
    if (!blob || blob.size === 0) {
      setError('録音データが空です。');
      return;
    }

    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(apiKey, blob);
      setTranscript(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文字起こしに失敗しました');
    } finally {
      setIsTranscribing(false);
    }
  }, [stop]);

  const reset = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setIsTranscribing(false);
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    start,
    stop,
    stopAndTranscribe,
    reset,
    setTranscript,
  };
}
