/**
 * StockBook - AI 심층 리포트 & 어드바이저 아카이브 컴포넌트
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { AdviceHistoryItem, CurrencySummary, Holding } from '../types/stockbook';
import { renderSafeMarkdown } from '../utils/formatters';

interface AIDeepReportProps {
  holdings: Holding[];
  currencySummaries: CurrencySummary[];
  adviceHistory: AdviceHistoryItem[];
  isLoading: boolean;
  onGetAdvice: () => void;
  onOpenSettings: () => void;
}

export const AIDeepReport: React.FC<AIDeepReportProps> = ({
  holdings,
  currencySummaries,
  adviceHistory,
  isLoading,
  onGetAdvice,
  onOpenSettings,
}) => {
  const [selectedAdviceIndex, setSelectedAdviceIndex] = useState(0);

  const activeAdvice = adviceHistory[selectedAdviceIndex] || adviceHistory[0] || null;

  return (
    <div className="space-y-6">
      
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-200">
            <i className="fa-solid fa-sparkles text-amber-300"></i>
            Gemini 3.6 Flash 기반 포트폴리오 심층 분석
          </span>
          <h1 className="text-2xl font-bold tracking-tight">AI 자산관리 코치 심층 리포트</h1>
          <p className="text-xs text-indigo-200 leading-relaxed">
            객관적 데이터 기반의 포트폴리오 진단, 리스크 요인 탐색, 2~3가지 개선 아이디어 및 스스로 점검할 질문을 분석합니다.
          </p>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onGetAdvice}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-indigo-50 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>분석 진행 중...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles text-indigo-600"></i>
                  <span>새로운 AI 심층 조언 받기</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              API 키 설정
            </button>
          </div>
        </div>
      </div>

      {/* 조언 히스토리 네비게이션 & 상세 뷰어 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* 좌측: 조언 목록 타임라인 (최대 10개) */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
            <span>분석 리포트 기록</span>
            <span className="text-slate-400 font-normal">최근 {adviceHistory.length}개</span>
          </div>

          {adviceHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              저장된 리포트 기록이 없습니다.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {adviceHistory.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedAdviceIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${
                    selectedAdviceIndex === idx
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="truncate">{item.summaryTitle || `리포트 #${adviceHistory.length - idx}`}</span>
                    <span className="text-[10px] text-slate-400 font-normal shrink-0">{item.dateStr.split(' ')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.content.replace(/[*#]/g, '')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 우측: 선택된 리포트 상세 본문 */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          {activeAdvice ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-file-lines text-indigo-500"></i>
                    {activeAdvice.summaryTitle || '포트폴리오 리밸런싱 인사이트'}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>분석 일시: {activeAdvice.dateStr}</span>
                    <span>•</span>
                    <span>모델: {activeAdvice.model}</span>
                  </div>
                </div>
              </div>

              {/* 안전하게 렌더링된 마크다운 내용 */}
              <div
                className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderSafeMarkdown(activeAdvice.content),
                }}
              />

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-400 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-indigo-500 text-xs shrink-0"></i>
                <span>이 분석은 참고용이며 최종 투자 결정과 책임은 이용자 본인에게 있습니다.</span>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              상단의 '새로운 AI 심층 조언 받기' 버튼을 눌러 첫 포트폴리오 분석을 시작해보세요.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
