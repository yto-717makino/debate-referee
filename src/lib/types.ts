export type DebateStage = 'topic' | 'affirmative' | 'negative' | 'judging' | 'result';

export type Side = 'affirmative' | 'negative';

export interface CriterionScore {
  criterion: string;
  affirmativeScore: number;
  negativeScore: number;
  comment: string;
}

export interface JudgmentResult {
  winner: Side | 'draw';
  summary: string;
  criteria: CriterionScore[];
  affirmativeSummary: string;
  negativeSummary: string;
  overallReasoning: string;
}

export interface JudgeRequest {
  topic: string;
  affirmativeArgument: string;
  negativeArgument: string;
}
