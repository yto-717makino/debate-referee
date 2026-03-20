export type DebateStage =
  | 'topic'
  | 'affirmative-argument'   // 肯定側の立論
  | 'negative-argument'      // 否定側の立論
  | 'cross-examination'      // 反対尋問
  | 'rebuttal'               // 反駁
  | 'closing-statement'      // 最終弁論
  | 'judging'                // 判定中
  | 'result';                // 結果

export type Side = 'affirmative' | 'negative';

export interface SideNames {
  affirmative: string;
  negative: string;
}

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

export interface ChatMessage {
  side: Side;
  text: string;
}

export interface DebateTranscripts {
  affirmativeArgument: string;
  negativeArgument: string;
  crossExamination: ChatMessage[];
  rebuttal: ChatMessage[];
  closingStatement: string;
}

export interface JudgeRequest {
  topic: string;
  transcripts: DebateTranscripts;
  apiKey: string;
}
