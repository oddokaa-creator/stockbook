/**
 * StockBook - Gemini AI 포트폴리오 어드바이저 섹션
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { AdviceHistoryItem } from '../types/stockbook';
import { renderSafeMarkdown } from '../utils/formatters';

interface AdviceSectionProps {
  currentAdvice: AdviceHistoryItem | null;
  adviceHistory: AdviceHistoryItem[];
  isLoading: boolean;
  errorMessage: string | null;
  canOpenSettings: boolean;
  canRetry: boolean;
  onGetAdvice: (theme: string) => void;
  onOpenSettings: () => void;
  onSelectHistory: (item: AdviceHistoryItem) => void;
}

/**
 * Gemini AI 포트폴리오 어드바이저 컴포넌트
 */
export const AdviceSection: React.FC<AdviceSectionProps> = ({
  currentAdvice,
  adviceHistory,
  isLoading,
  errorMessage,
  canOpenSettings,
  canRetry,
  onGetAdvice,
  onOpenSettings,
  onSelectHistory,
}) => {
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('종합 분석');
  
  const themes = ['종합 분석', '리스크 점검', '배당금 중심 전략', '성장성 중심 전략'];

  return (
    <section className="bg-gradient-to-br from-indigo-500/5 via-white to-indigo-500/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl p-5 sm:p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-4">
      
      {/* 헤더 및 조언 받기 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
            <i className="fa-solid fa-wand-magic-sparkles text-base"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Gemini AI 포트폴리오 어드바이저
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  PRO
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              보유 종목 비중과 손익 데이터를 기반으로 리밸런싱 조언을 분석합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* 이전 조언 기록 보기 드롭다운 (최대 10개) */}
          {adviceHistory.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm transition-all"
              >
                <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
                <span>히스토리 ({adviceHistory.length})</span>
                <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
              </button>

              {showHistoryDropdown && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 space-y-1 animate-in fade-in duration-150">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    최근 AI 분석 이력 (최대 10개)
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {adviceHistory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectHistory(item);
                          setShowHistoryDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex flex-col ${
                          currentAdvice?.id === item.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">
                          {item.summaryTitle || '포트폴리오 리밸런싱 인사이트'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {item.dateStr}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 분석 테마 선택 드롭다운 */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            disabled={isLoading}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>

          {/* AI 조언 받기 버튼 (id="advice-btn") */}
          <button
            id="advice-btn"
            type="button"
            disabled={isLoading}
            onClick={() => onGetAdvice(selectedTheme)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-sm shadow-indigo-500/30 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>AI 조언 받기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 로딩 스켈레톤 UI (id="advice-loading") */}
      {isLoading && (
        <div
          id="advice-loading"
          className="p-5 rounded-xl bg-white/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 animate-pulse space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-300 dark:bg-indigo-700"></div>
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="space-y-2.5 pt-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-11/12"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      )}

      {/* 에러 메시지 영역 (id="advice-error") */}
      {errorMessage && (
        <div
          id="advice-error"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <i className="fa-solid fa-circle-exclamation mt-0.5 text-sm shrink-0"></i>
            <div>
              <span className="font-bold">분석 요청 중 오류가 발생했습니다.</span>
              <p className="text-[11px] opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {canOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-[11px]"
              >
                설정 열기
              </button>
            )}
            {canRetry && (
              <button
                type="button"
                onClick={() => onGetAdvice(selectedTheme)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold hover:bg-red-50 transition-colors text-[11px]"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI 조언 결과 카드 영역 (id="advice-result") */}
      {currentAdvice && !isLoading && (
        <div
          id="advice-result"
          className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/90 border border-indigo-100/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-3 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <i className="fa-regular fa-comment-dots text-indigo-500"></i>
              {currentAdvice.summaryTitle || '포트폴리오 리밸런싱 인사이트'}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>{currentAdvice.dateStr}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                {currentAdvice.model}
              </span>
            </div>
          </div>

          {/* 안전하게 렌더링된 마크다운 내용 */}
          <div
            className="space-y-2 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderSafeMarkdown(currentAdvice.content),
            }}
          />
        </div>
      )}

      {/* 면책 고지 문구 */}
      <p className="text-[11px] text-slate-400 text-center pt-1">
        <i className="fa-solid fa-shield-halved mr-1 text-[10px]"></i>
        투자 판단의 책임은 본인에게 있습니다. AI 분석 결과는 단순 참고용 정보입니다.
      </p>
    </section>
  );
};
