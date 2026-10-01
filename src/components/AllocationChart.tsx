/**
 * StockBook - 포트폴리오 비중 SVG 도넛 차트 및 범례 컴포넌트
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { CurrencySummary, Holding } from '../types/stockbook';
import { formatCompactKRW, formatCurrency } from '../utils/formatters';

interface AllocationChartProps {
  holdings: Holding[];
  currencySummaries: CurrencySummary[];
}

/**
 * 차트 슬라이스 색상 팔레트
 */
const SLICE_COLORS = [
  '#6366F1', // Royal Indigo
  '#38BDF8', // Sky Blue
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#64748B', // Slate
];

/**
 * 포트폴리오 비중 도넛 차트 컴포넌트
 */
export const AllocationChart: React.FC<AllocationChartProps> = ({
  holdings,
  currencySummaries,
}) => {
  // 사용 가능한 통화 목록 확인
  const currencies = Array.from(new Set(holdings.map((h) => (h.currency || 'KRW').toUpperCase())));
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    currencies.includes('KRW') ? 'KRW' : currencies[0] || 'KRW'
  );
  const [hoveredHoldingId, setHoveredHoldingId] = useState<string | null>(null);

  // 선택된 통화의 종목들만 필터링 (통화 합산 금지 원칙 준수)
  const activeHoldings = holdings.filter(
    (h) => (h.currency || 'KRW').toUpperCase() === selectedCurrency
  );

  // 총 평가금액 계산
  const totalValue = activeHoldings.reduce(
    (sum, h) => sum + (h.currentPrice || h.buyPrice) * h.quantity,
    0
  );

  // 비중 순으로 정렬
  const sortedHoldings = [...activeHoldings]
    .map((h) => {
      const val = (h.currentPrice || h.buyPrice) * h.quantity;
      const weight = totalValue > 0 ? (val / totalValue) * 100 : 0;
      return {
        ...h,
        evaluatedValue: val,
        weight,
      };
    })
    .sort((a, b) => b.evaluatedValue - a.evaluatedValue);

  // SVG 도넛 차트 원형 파라미터 (r=38, 둘레 C = 2 * PI * 38 ≈ 238.761)
  const RADIUS = 38;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  let accumulatedPercent = 0;
  const slices = sortedHoldings.map((item, index) => {
    const percent = totalValue > 0 ? item.weight : 0;
    const strokeDash = (percent / 100) * CIRCUMFERENCE;
    const strokeOffset = -(accumulatedPercent / 100) * CIRCUMFERENCE;
    accumulatedPercent += percent;

    return {
      id: item.id,
      name: item.name,
      ticker: item.ticker,
      evaluatedValue: item.evaluatedValue,
      weight: percent,
      strokeDash,
      strokeOffset,
      color: SLICE_COLORS[index % SLICE_COLORS.length],
    };
  });

  return (
    <section
      id="allocation-chart"
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all"
    >
      {/* 헤더 및 통화 전환 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-indigo-500"></i>
            포트폴리오 비중
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">평가금액 기준 자산 배분 현황</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currencies.length > 1 && (
            <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
              {currencies.map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedCurrency === curr
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {curr} 기준
                </button>
              ))}
            </div>
          )}

          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {sortedHoldings.length}개 보유 종목
          </span>
        </div>
      </div>

      {sortedHoldings.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <i className="fa-solid fa-chart-pie text-2xl mb-2 opacity-50 block"></i>
          {selectedCurrency} 통화의 보유 종목이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* 도넛 차트 그래픽 영역 (SVG Donut Chart) */}
          <div className="md:col-span-5 flex justify-center py-2 relative">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* 배경 트랙 원 */}
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100 dark:text-slate-800"
                />

                {/* 개별 종목 슬라이스 원호들 */}
                {slices.map((slice) => {
                  const isHovered = hoveredHoldingId === slice.id;
                  return (
                    <circle
                      key={slice.id}
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 14 : 12}
                      strokeDasharray={`${slice.strokeDash} ${CIRCUMFERENCE}`}
                      strokeDashoffset={slice.strokeOffset}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        opacity: hoveredHoldingId ? (isHovered ? 1 : 0.5) : 0.95,
                        filter: isHovered ? 'drop-shadow(0 0 4px rgba(0,0,0,0.15))' : 'none',
                      }}
                      onMouseEnter={() => setHoveredHoldingId(slice.id)}
                      onMouseLeave={() => setHoveredHoldingId(null)}
                    />
                  );
                })}
              </svg>

              {/* 도넛 중앙 텍스트 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">총 자산</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {selectedCurrency === 'KRW'
                    ? formatCompactKRW(totalValue)
                    : formatCurrency(totalValue, selectedCurrency, true)}
                </span>
                <span className="text-[10px] text-indigo-500 font-semibold mt-0.5">
                  {selectedCurrency} 기준
                </span>
              </div>
            </div>
          </div>

          {/* 범례 목록 (Legend) */}
          <div className="md:col-span-7 space-y-2">
            {slices.map((item) => {
              const isHovered = hoveredHoldingId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredHoldingId(item.id)}
                  onMouseLeave={() => setHoveredHoldingId(null)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-300 dark:ring-indigo-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <div className="truncate">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5 tabular-nums">
                        {item.ticker}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 tabular-nums shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(item.evaluatedValue, selectedCurrency, true)}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 w-12 text-right">
                      {item.weight.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </section>
  );
};
