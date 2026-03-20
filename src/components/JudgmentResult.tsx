'use client';

import type { JudgmentResult as JudgmentResultType, SideNames } from '@/lib/types';

interface JudgmentResultProps {
  result: JudgmentResultType;
  sideNames: SideNames;
  onReset: () => void;
}

const winnerColors = {
  affirmative: 'from-blue-500 to-blue-700',
  negative: 'from-rose-500 to-rose-700',
  draw: 'from-amber-500 to-amber-700',
};

export default function JudgmentResult({ result, sideNames, onReset }: JudgmentResultProps) {
  const winnerLabels = {
    affirmative: `${sideNames.affirmative}の勝利`,
    negative: `${sideNames.negative}の勝利`,
    draw: '引き分け',
  };
  const totalAff = result.criteria.reduce((sum, c) => sum + c.affirmativeScore, 0);
  const totalNeg = result.criteria.reduce((sum, c) => sum + c.negativeScore, 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Winner Banner */}
      <div className={`bg-gradient-to-r ${winnerColors[result.winner]} rounded-2xl p-8 text-center text-white shadow-lg`}>
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-2xl font-bold">{winnerLabels[result.winner]}</h2>
        <p className="text-white/80 mt-2">{result.summary}</p>
      </div>

      {/* Score Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
          <h3 className="font-bold text-zinc-800">採点結果</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-6 py-3 text-sm text-zinc-500">評価基準</th>
                <th className="text-center px-4 py-3 text-sm text-blue-600">{sideNames.affirmative}</th>
                <th className="text-center px-4 py-3 text-sm text-rose-600">{sideNames.negative}</th>
              </tr>
            </thead>
            <tbody>
              {result.criteria.map((c, i) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="px-6 py-3">
                    <div className="font-medium text-zinc-800">{c.criterion}</div>
                    <div className="text-xs text-zinc-500 mt-1">{c.comment}</div>
                  </td>
                  <td className="text-center px-4 py-3">
                    <ScoreBadge score={c.affirmativeScore} isHigher={c.affirmativeScore > c.negativeScore} color="blue" />
                  </td>
                  <td className="text-center px-4 py-3">
                    <ScoreBadge score={c.negativeScore} isHigher={c.negativeScore > c.affirmativeScore} color="rose" />
                  </td>
                </tr>
              ))}
              <tr className="bg-zinc-50 font-bold">
                <td className="px-6 py-3 text-zinc-800">合計</td>
                <td className="text-center px-4 py-3 text-blue-600">{totalAff}</td>
                <td className="text-center px-4 py-3 text-rose-600">{totalNeg}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Argument Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
          <h4 className="font-bold text-blue-700 mb-2">{sideNames.affirmative}の評価</h4>
          <p className="text-sm text-zinc-700">{result.affirmativeSummary}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-rose-200 p-6">
          <h4 className="font-bold text-rose-700 mb-2">{sideNames.negative}の評価</h4>
          <p className="text-sm text-zinc-700">{result.negativeSummary}</p>
        </div>
      </div>

      {/* Overall Reasoning */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <h4 className="font-bold text-zinc-800 mb-2">📝 総合講評</h4>
        <p className="text-sm text-zinc-700 leading-relaxed">{result.overallReasoning}</p>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-900 transition-colors"
      >
        もう一度ディベートする
      </button>
    </div>
  );
}

function ScoreBadge({ score, isHigher, color }: { score: number; isHigher: boolean; color: 'blue' | 'rose' }) {
  const bgColor = isHigher
    ? color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
    : 'bg-zinc-100 text-zinc-600';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${bgColor}`}>
      {score}
    </span>
  );
}
