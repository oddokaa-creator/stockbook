/**
 * StockBook - 요약 카드 컴포넌트
 * 총 매수금액, 총 평가금액, 총 평가손익 (통화 분리 규칙 엄수)
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { CurrencySummary } from '../types/stockbook';
import { formatCurrency, formatProfitAmount, formatProfitRate } from '../utils/formatters';

interface SummaryCardsProps {
  currencySummaries: CurrencySummary[];
  selectedCurrency: 'ALL' | 'KRW' | 'USD';
  setSelectedCurrency: (curr: 'ALL' | 'KRW' | 'USD') => void;
  totalHoldingsCount: number;
}

/**
 * 투자 요약 정보 카드 컴포넌트
 */
export const SummaryCards: React.FC<SummaryCardsProps> = ({
  currencySummaries,
  selectedCurrency,
  setSelectedCurrency,
  totalHoldingsCount,
}) => {
  // 사용 가능한 통화 목록
  const availableCurrencies = currencySummaries.map((s) => s.currency);
  
  // 현재 표시할 통화 선택 (selectedCurrency가 'ALL'이면 기본적으로 첫 번째 통화 또는 KRW 우선)
  const defaultCurrency =
    selectedCurrency !== 'ALL'
      ? selectedCurrency
      : availableCurrencies.includes('KRW')
      ? 'KRW'
      : availableCurrencies[0] || 'KRW';

  const [activeSummaryCurrency, setActiveSummaryCurrency] = useState<string>(defaultCurrency);

  // 선택된 통화 상태 동기화
  const currentSummary =
    currencySummaries.find((s) => s.currency === (selectedCurrency !== 'ALL' ? selectedCurrency : activeSummaryCurrency)) ||
    currencySummaries[0] || {
      currency: 'KRW',
      symbol: '₩',
      totalBuyAmount: 0,
      totalCurrentValue: 0,
      totalProfit: 0,
      profitRate: 0,
      holdingCount: 0,
    };

  const isProfit = currentSummary.totalProfit > 0;
  const isLoss = currentSummary.totalProfit < 0;

  return (
    <section aria-label="투자 요약 정보" className="space-y-2.5">
      {/* 여러 통화가 존재할 때 통화별 분리 탭 바 (환율 자동 변환 금지 규칙 준수) */}
      {currencySummaries.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <i className="fa-solid fa-scale-balanced text-indigo-500 text-[11px]"></i>
            <span className="font-semibold text-slate-700 dark:text-slate-300">통화별 독립 요약</span>
            <span className="text-[11px] text-slate-400">(이종 통화 자동 합산 금지 원칙)</span>
          </div>

          <div className="inline-flex items-center gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            {currencySummaries.map((s) => (
              <button
                key={s.currency}
                type="button"
                onClick={() => {
                  setActiveSummaryCurrency(s.currency);
                  if (selectedCurrency !== 'ALL') {
                    setSelectedCurrency(s.currency as any);
                  }
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  (selectedCurrency !== 'ALL' ? selectedCurrency : activeSummaryCurrency) === s.currency
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {s.currency} ({s.holdingCount}개)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3대 요약 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* 총 매수금액 카드 (id="summary-invest") */}
        <div
          id="summary-invest"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              총 매수금액 ({currentSummary.currency})
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-receipt"></i>
            </div>
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(currentSummary.totalBuyAmount, currentSummary.currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{currentSummary.holdingCount}개 종목 보유중</span>
              {currencySummaries.length > 1 && (
                <span>(전체 {totalHoldingsCount}개 중)</span>
              )}
            </div>
          </div>
        </div>

        {/* 총 평가금액 카드 (id="summary-value") */}
        <div
          id="summary-value"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              총 평가금액 ({currentSummary.currency})
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(currentSummary.totalCurrentValue, currentSummary.currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{currentSummary.currency} 실시간 현재가 기준</span>
            </div>
          </div>
        </div>

        {/* 총 손익 (금액 + 수익률) 카드 (id="summary-profit") */}
        <div
          id="summary-profit"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              총 평가손익 ({currentSummary.currency})
            </span>
            {/* 수익률 배지: 이익은 빨강, 손실은 파랑 (한국 관례) */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                isProfit
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                  : isLoss
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {formatProfitRate(currentSummary.profitRate, true)}
            </span>
          </div>

          <div className="mt-1">
            <div
              className={`text-2xl font-bold tabular-nums tracking-tight flex items-baseline gap-1 ${
                isProfit
                  ? 'text-red-600 dark:text-red-400'
                  : isLoss
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              <span>{formatProfitAmount(currentSummary.totalProfit, currentSummary.currency, false)}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span
                className={`font-medium ${
                  isProfit
                    ? 'text-red-600 dark:text-red-400'
                    : isLoss
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500'
                }`}
              >
                {isProfit ? '▲ 수익 상태' : isLoss ? '▼ 손실 상태' : '— 보합 상태'}
              </span>
              <span>• 누적 배당 미포함</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
