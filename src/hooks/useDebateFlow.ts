'use client';

import { useState, useCallback } from 'react';
import type { DebateStage, JudgmentResult } from '@/lib/types';

export function useDebateFlow() {
  const [stage, setStage] = useState<DebateStage>('topic');
  const [topic, setTopic] = useState('');
  const [affirmativeTranscript, setAffirmativeTranscript] = useState('');
  const [negativeTranscript, setNegativeTranscript] = useState('');
  const [judgment, setJudgment] = useState<JudgmentResult | null>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTopic = useCallback((t: string) => {
    setTopic(t);
    setStage('affirmative');
  }, []);

  const submitAffirmative = useCallback((transcript: string) => {
    setAffirmativeTranscript(transcript);
    setStage('negative');
  }, []);

  const submitNegative = useCallback(async (transcript: string) => {
    setNegativeTranscript(transcript);
    setStage('judging');
    setIsJudging(true);
    setError(null);

    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          affirmativeArgument: affirmativeTranscript,
          negativeArgument: transcript,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const result: JudgmentResult = await res.json();
      setJudgment(result);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '判定中にエラーが発生しました');
      setStage('negative'); // Allow retry
    } finally {
      setIsJudging(false);
    }
  }, [topic, affirmativeTranscript]);

  const reset = useCallback(() => {
    setStage('topic');
    setTopic('');
    setAffirmativeTranscript('');
    setNegativeTranscript('');
    setJudgment(null);
    setError(null);
    setIsJudging(false);
  }, []);

  return {
    stage,
    topic,
    affirmativeTranscript,
    negativeTranscript,
    judgment,
    isJudging,
    error,
    submitTopic,
    submitAffirmative,
    submitNegative,
    reset,
  };
}
