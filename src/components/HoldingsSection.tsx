/**
 * StockBook - 보유 종목 테이블 및 모바일 카드 뷰 컴포넌트
 * 인라인 현재가 수정 및 CRUD 상호작용 지원
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Holding } from '../types/stockbook';
import { formatCurrency, formatProfitAmount, formatProfitRate } from '../utils/formatters';

interface HoldingsSectionProps {
  holdings: Holding[];
  selectedCurrency: 'ALL' | 'KRW' | 'USD';
  onUpdateCurrentPrice: (id: string, newPrice: number) => void;
  onEditHolding: (holding: Holding) => void;
  onDeleteHolding: (id: string, name: string) => void;
  onOpenAddModal: () => void;
}

/**
 * 종목 아이콘 배지 렌더러
 */
function renderStockBadge(name: string, ticker: string) {
  const upper = ticker.toUpperCase();
  if (upper === 'AAPL' || name.toLowerCase().includes('apple')) {
    return (
      <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
        <i className="fa-brands fa-apple text-sm"></i>
      </span>
    );
  }
  if (name.includes('삼성') || upper === '005930') {
    return (
      <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
        삼성
      </span>
    );
  }
  if (name.includes('하이닉스') || upper === '000660') {
    return (
      <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
        SK
      </span>
    );
  }
  if (upper === 'TSLA' || name.toLowerCase().includes('tesla')) {
    return (
      <span className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
        TSLA
      </span>
    );
  }
  if (upper === 'NVDA' || name.toLowerCase().includes('nvidia')) {
    return (
      <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
        NVDA
      </span>
    );
  }
  // 기본 배지: 이름 앞 2글자
  return (
    <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
      {name.slice(0, 2)}
    </span>
  );
}

/**
 * 보유 종목 내역 컴포넌트
 */
export const HoldingsSection: React.FC<HoldingsSectionProps> = ({
  holdings,
  selectedCurrency,
  onUpdateCurrentPrice,
  onEditHolding,
  onDeleteHolding,
  onOpenAddModal,
}) => {
  // Empty State 토글 상태
  const [forceShowEmpty, setForceShowEmpty] = useState(false);
  // 인라인 가격 수정 임시 입력 상태 관리 { [id]: string }
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

  // 통화 필터링
  const filteredHoldings = holdings.filter((h) => {
    if (selectedCurrency === 'ALL') return true;
    return (h.currency || 'KRW').toUpperCase() === selectedCurrency;
  });

  const isEmpty = filteredHoldings.length === 0 || forceShowEmpty;

  const handlePriceChange = (id: string, val: string) => {
    setPriceInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handlePriceBlur = (id: string, currentVal: number) => {
    const inputVal = priceInputs[id];
    if (inputVal === undefined) return;
    
    // 쉼표 제거 후 숫자로 변환
    const cleanNum = parseFloat(inputVal.replace(/,/g, ''));
    if (!isNaN(cleanNum) && cleanNum >= 0) {
      onUpdateCurrentPrice(id, cleanNum);
    } else {
      // 잘못된 입력 시 원래 가격으로 복원
      setPriceInputs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, currentVal: number) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <section className="space-y-4">
      {/* 섹션 상단 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-list-check text-indigo-500"></i>
            보유 종목 내역
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">
            {filteredHoldings.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setForceShowEmpty(!forceShowEmpty)}
            className="text-xs font-medium text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <i className="fa-solid fa-repeat"></i>
            <span className="hidden sm:inline">Empty/List 뷰 토글</span>
          </button>
        </div>
      </div>

      {/* 보유 종목 목록 컨테이너 (id="holdings-list") */}
      {!isEmpty ? (
        <div id="holdings-list" className="space-y-3">
          
          {/* [데스크톱 전용 테이블 (md 이상)] */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">종목명 / 티커</th>
                  <th className="py-3.5 px-3 text-right">수량</th>
                  <th className="py-3.5 px-3 text-right">평균 매수가</th>
                  <th className="py-3.5 px-3 text-right">현재가 (인라인 수정)</th>
                  <th className="py-3.5 px-3 text-right">평가금액</th>
                  <th className="py-3.5 px-3 text-right">손익</th>
                  <th className="py-3.5 px-3 text-right">수익률</th>
                  <th className="py-3.5 px-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredHoldings.map((h) => {
                  const buyAmount = h.buyPrice * h.quantity;
                  const currentPrice = h.currentPrice ?? h.buyPrice;
                  const currentVal = currentPrice * h.quantity;
                  const profit = currentVal - buyAmount;
                  const profitRate = buyAmount > 0 ? (profit / buyAmount) * 100 : 0;
                  const isProfit = profit > 0;
                  const isLoss = profit < 0;

                  const inputValue =
                    priceInputs[h.id] !== undefined
                      ? priceInputs[h.id]
                      : (h.currency || 'KRW') === 'USD'
                      ? currentPrice.toFixed(2)
                      : new Intl.NumberFormat('ko-KR').format(currentPrice);

                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 종목명 / 티커 */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          {renderStockBadge(h.name, h.ticker)}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {h.name}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal">
                                {h.market}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 tabular-nums">
                              {h.ticker} {h.sector ? `• ${h.sector}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 보유 수량 */}
                      <td className="py-4 px-3 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {h.quantity}주
                      </td>

                      {/* 평균 매수가 */}
                      <td className="py-4 px-3 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatCurrency(h.buyPrice, h.currency)}
                      </td>

                      {/* 현재가 인라인 수정 인풋 */}
                      <td className="py-4 px-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <input
                            type="text"
                            value={inputValue}
                            aria-label={`${h.name} 현재가`}
                            onChange={(e) => handlePriceChange(h.id, e.target.value)}
                            onBlur={() => handlePriceBlur(h.id, currentPrice)}
                            onKeyDown={(e) => handleKeyDown(e, h.id, currentPrice)}
                            className="w-24 text-right px-2 py-1 text-xs font-semibold tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                          />
                          <span className="text-slate-400 text-[10px]">
                            {h.currency === 'USD' ? '$' : '원'}
                          </span>
                        </div>
                      </td>

                      {/* 평가금액 */}
                      <td className="py-4 px-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(currentVal, h.currency)}
                      </td>

                      {/* 손익: 한국 관례 (이익 빨강, 손실 파랑) */}
                      <td
                        className={`py-4 px-3 text-right font-bold tabular-nums ${
                          isProfit
                            ? 'text-red-600 dark:text-red-400'
                            : isLoss
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {formatProfitAmount(profit, h.currency, true)}
                      </td>

                      {/* 수익률 */}
                      <td
                        className={`py-4 px-3 text-right font-bold tabular-nums ${
                          isProfit
                            ? 'text-red-600 dark:text-red-400'
                            : isLoss
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {formatProfitRate(profitRate, true)}
                      </td>

                      {/* 관리 (수정 / 삭제) */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            aria-label={`${h.name} 수정`}
                            onClick={() => onEditHolding(h)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </button>
                          <button
                            type="button"
                            aria-label={`${h.name} 삭제`}
                            onClick={() => onDeleteHolding(h.id, h.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* [모바일 전용 카드 리스트 (md 미만)] */}
          <div className="space-y-3 md:hidden">
            {filteredHoldings.map((h) => {
              const buyAmount = h.buyPrice * h.quantity;
              const currentPrice = h.currentPrice ?? h.buyPrice;
              const currentVal = currentPrice * h.quantity;
              const profit = currentVal - buyAmount;
              const profitRate = buyAmount > 0 ? (profit / buyAmount) * 100 : 0;
              const isProfit = profit > 0;
              const isLoss = profit < 0;

              const inputValue =
                priceInputs[h.id] !== undefined
                  ? priceInputs[h.id]
                  : (h.currency || 'KRW') === 'USD'
                  ? currentPrice.toFixed(2)
                  : new Intl.NumberFormat('ko-KR').format(currentPrice);

              return (
                <div
                  key={h.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      {renderStockBadge(h.name, h.ticker)}
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          {h.name}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal">
                            {h.market}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          보유 {h.quantity}주 • 매수가 {formatCurrency(h.buyPrice, h.currency)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="수정"
                        onClick={() => onEditHolding(h)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <i className="fa-regular fa-pen-to-square text-sm"></i>
                      </button>
                      <button
                        type="button"
                        aria-label="삭제"
                        onClick={() => onDeleteHolding(h.id, h.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <i className="fa-regular fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>

                  {/* 현재가 인라인 수정 바 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      현재가 수정 ({h.currency})
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={inputValue}
                        aria-label={`${h.name} 모바일 현재가 수정`}
                        onChange={(e) => handlePriceChange(h.id, e.target.value)}
                        onBlur={() => handlePriceBlur(h.id, currentPrice)}
                        onKeyDown={(e) => handleKeyDown(e, h.id, currentPrice)}
                        className="w-24 text-right px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold tabular-nums focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <span className="text-slate-400 text-[10px]">
                        {h.currency === 'USD' ? '$' : '원'}
                      </span>
                    </div>
                  </div>

                  {/* 손익 및 평가금액 */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        평가금액
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(currentVal, h.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        손익 (수익률)
                      </span>
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          isProfit
                            ? 'text-red-600 dark:text-red-400'
                            : isLoss
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {formatProfitAmount(profit, h.currency, true)} (
                        {formatProfitRate(profitRate, false)})
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* [종목이 없을 때 보여주는 Empty State 컨테이너 id="empty-state"] */
        <div id="empty-state-toggle-wrapper">
          <div
            id="empty-state"
            className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-dashed border-slate-300 dark:border-slate-800 shadow-sm text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              등록된 보유 종목이 없습니다
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              우측 하단의 '+' 버튼을 누르거나 아래 버튼으로 첫 종목을 등록하여 주식 가계부 관리를 시작해보세요.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-plus"></i>
              첫 종목 등록하기
            </button>
          </div>
        </div>
      )}

      {/* 우측 하단 종목 추가 FAB 버튼 (id="add-holding-fab") */}
      <button
        id="add-holding-fab"
        type="button"
        aria-label="종목 추가"
        onClick={onOpenAddModal}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-all duration-200 group"
      >
        <i className="fa-solid fa-plus text-xl transition-transform group-hover:rotate-90"></i>
      </button>
    </section>
  );
};
