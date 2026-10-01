/**
 * StockBook - 배당금 캘린더 & 현금흐름 리포트 컴포넌트
 * Image 3의 디자인 및 인터랙션을 완벽하게 구현
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { DividendRecord, Holding } from '../types/stockbook';
import { formatCurrency, formatKRW } from '../utils/formatters';

interface DividendCalendarProps {
  holdings: Holding[];
  dividends: DividendRecord[];
  onAddDividend: () => void;
  onToggleDividendStatus: (id: string) => void;
  onDeleteDividend: (id: string) => void;
}

/**
 * 기본 예시 배당 스케줄 데이터
 */
export const DEFAULT_DIVIDENDS: DividendRecord[] = [
  {
    id: 'div-samsung-10',
    ticker: '005930',
    name: '삼성전자',
    market: 'KOSPI',
    currency: 'KRW',
    exDate: '2024-09-26',
    payDate: '2024-10-18',
    dps: 361,
    quantity: 240,
    isPaid: false,
    taxRate: 0.154,
    memo: '분기배당 (D-3)',
  },
  {
    id: 'div-aapl-10',
    ticker: 'AAPL',
    name: '애플 (Apple Inc.)',
    market: 'NASDAQ',
    currency: 'USD',
    exDate: '2024-10-02',
    payDate: '2024-10-25',
    dps: 0.25,
    quantity: 50,
    isPaid: false,
    taxRate: 0.15,
    memo: '분기배당 (D-10)',
  },
  {
    id: 'div-o-11',
    ticker: 'O',
    name: '리얼티인컴 (Realty Income)',
    market: 'NYSE',
    currency: 'USD',
    exDate: '2024-10-31',
    payDate: '2024-11-15',
    dps: 0.263,
    quantity: 320,
    isPaid: false,
    taxRate: 0.15,
    memo: '월배당 REITs',
  },
  {
    id: 'div-msft-09',
    ticker: 'MSFT',
    name: '마이크로소프트 (Microsoft)',
    market: 'NASDAQ',
    currency: 'USD',
    exDate: '2024-08-14',
    payDate: '2024-09-12',
    dps: 0.75,
    quantity: 45,
    isPaid: true,
    taxRate: 0.15,
    memo: '계좌 입금 확인됨',
  },
  {
    id: 'div-schd-09',
    ticker: 'SCHD',
    name: 'Schwab US Dividend ETF',
    market: 'NYSE',
    currency: 'USD',
    exDate: '2024-09-25',
    payDate: '2024-09-30',
    dps: 0.704,
    quantity: 150,
    isPaid: true,
    taxRate: 0.15,
    memo: '계좌 입금 확인됨',
  },
];

/**
 * 배당금 캘린더 및 DRIP 복리 시뮬레이터
 */
export const DividendCalendar: React.FC<DividendCalendarProps> = ({
  holdings,
  dividends,
  onAddDividend,
  onToggleDividendStatus,
  onDeleteDividend,
}) => {
  const [taxMode, setTaxMode] = useState<'net' | 'gross'>('net');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'KR' | 'US'>('ALL');

  // 활성 배당 목록 (전달된 목록 또는 기본 예시)
  const activeDividends = dividends && dividends.length > 0 ? dividends : DEFAULT_DIVIDENDS;

  // 필터링 적용
  const filteredList = activeDividends.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterMarket === 'KR') {
      return item.market === 'KOSPI' || item.market === 'KOSDAQ' || item.currency === 'KRW';
    }
    if (filterMarket === 'US') {
      return item.market === 'NASDAQ' || item.market === 'NYSE' || item.currency === 'USD';
    }
    return true;
  });

  // 월별 가상 배당 분배 데이터 (히스토그램용)
  const monthlyData = [
    { month: '1월', amount: 54000, height: 18, isPaid: true },
    { month: '2월', amount: 72000, height: 24, isPaid: true },
    { month: '3월', amount: 98000, height: 33, isPaid: true },
    { month: '4월', amount: 140000, height: 48, isPaid: true },
    { month: '5월', amount: 245000, height: 82, isPaid: true, tag: '국내결산' },
    { month: '6월', amount: 68000, height: 23, isPaid: true },
    { month: '7월', amount: 85000, height: 29, isPaid: true },
    { month: '8월', amount: 115000, height: 40, isPaid: true },
    { month: '9월', amount: 92000, height: 31, isPaid: true },
    { month: '10월', amount: 245000, height: 85, isPaid: false, isCurrent: true, tag: '245K' },
    { month: '11월', amount: 190000, height: 65, isPaid: false },
    { month: '12월', amount: 110000, height: 38, isPaid: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* 상단 히어로 배너 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              2024 배당 회계연도 실시간 집계
            </span>
            <span className="text-[11px] text-slate-400">환율 기준 1 USD = 1,365 KRW (참고용)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            배당금 캘린더 &amp; 현금흐름 리포트
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            체계적인 배당 주기 관리와 복리 재투자(DRIP) 복셀 플래너로 완성하는 지속 가능한 수동 소득 파이프라인.
          </p>
        </div>

        {/* 액션 및 세후/세전 스위처 */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTaxMode('net')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                taxMode === 'net'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              세후 기준 (15.4%)
            </button>
            <button
              type="button"
              onClick={() => setTaxMode('gross')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                taxMode === 'gross'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              세전 기준
            </button>
          </div>

          <button
            type="button"
            onClick={onAddDividend}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-plus-circle"></i>
            <span>배당 내역 수동 추가</span>
          </button>
        </div>
      </div>

      {/* 4단 KPI 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: 연간 예상 총 배당금 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">연간 예상 총 배당금</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-piggy-bank"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white tracking-tight">
              {taxMode === 'net' ? '₩1,556,640' : '₩1,840,000'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {taxMode === 'net' ? '세전 ₩1,840,000 (15.4% 원천징수 반영)' : '원천징수 전 총액 기준'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-red-500 font-bold tabular-nums">▲ +14.2%</span>
            <span>전년 실적 대비 성장</span>
          </div>
        </div>

        {/* KPI 2: 포트폴리오 배당수익률 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">포트폴리오 배당수익률</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-percent"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white tracking-tight">
              3.76%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">현재 평가액 기준 연환산</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between">
            <span className="text-slate-400">매수가 기준 (YOC)</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">4.33%</span>
          </div>
        </div>

        {/* KPI 3: 월평균 배당 수령액 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">월평균 배당 수령액</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-calendar-days"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white tracking-tight">
              {taxMode === 'net' ? '₩129,720' : '₩153,333'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">매달 수령하는 실질 현금 파이프</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center gap-1.5">
            <span className="text-red-500 font-bold tabular-nums">▲ +18.4%</span>
            <span className="text-slate-500">전년 대비 고속 증가</span>
          </div>
        </div>

        {/* KPI 4: 이번 달 지급 예정 */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 dark:from-indigo-950/50 dark:to-slate-900 rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                이번 달 (10월) 지급 예정
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
              2건 대기
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400 tracking-tight">
              {taxMode === 'net' ? '₩245,000' : '₩289,598'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">배당락 통과 완료 • 지급 확정</p>
          </div>
          <div className="mt-3 pt-2 border-t border-indigo-100 dark:border-slate-800/80 text-[11px] flex items-center justify-between text-slate-500">
            <span>10/18 삼성전자, 10/25 AAPL</span>
            <span className="text-indigo-500 font-bold">타임라인 →</span>
          </div>
        </div>

      </div>

      {/* 중단 그리드: 월별 배당금 수령 추이 + DRIP 복리 재투자 시뮬레이터 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 좌측 7단: 월별 히스토그램 차트 */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">월별 배당금 수령 추이</h2>
              <p className="text-xs text-slate-400 mt-0.5">2024년 정기/특별 배당금 분배 스케줄 (최고 배당월: 5월, 10월, 11월)</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span> 지급 완료
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 dark:bg-indigo-700"></span> 지급 예정
              </span>
            </div>
          </div>

          {/* 히스토그램 차트 */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 pt-6 relative">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 border-b border-dashed border-slate-200 dark:border-slate-700 pb-1">
              <span>최대 ₩300,000</span>
              <span>월별 최고 피크</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-end h-48 pt-4 pb-1">
              {monthlyData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 group h-full justify-end">
                  {d.tag && (
                    <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {d.tag}
                    </span>
                  )}
                  <div
                    style={{ height: `${d.height}%` }}
                    className={`w-full rounded-t transition-all duration-300 cursor-pointer ${
                      d.isCurrent
                        ? 'bg-indigo-500 shadow-md shadow-indigo-500/40'
                        : d.isPaid
                        ? 'bg-indigo-400/80 hover:bg-indigo-500'
                        : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                    title={`${d.month}: ${formatKRW(d.amount)}`}
                  ></div>
                  <span
                    className={`text-[10px] tabular-nums ${
                      d.isCurrent
                        ? 'font-bold text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 분기별 실적 지표 */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-[11px] text-slate-400">Q1 수령 실적</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">₩224,000</p>
              <span className="text-[10px] text-slate-400">달성률 102%</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-[11px] text-slate-400">Q2 수령 실적</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">₩462,000</p>
              <span className="text-[10px] text-red-500 font-semibold">전년비 +21.4% ▲</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-[11px] text-slate-400">Q3 수령 실적</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">₩292,000</p>
              <span className="text-[10px] text-slate-400">안정적 분기 배당</span>
            </div>
          </div>
        </div>

        {/* 우측 5단: DRIP 복리 재투자 시뮬레이터 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-arrows-rotate text-indigo-500 text-lg"></i>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                DRIP 복리 재투자 시뮬레이터
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
              자동 퀀트 계산
            </span>
          </div>

          {/* 즉시 재매수 추천 카드 */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">
                  이번 달 배당금 자동 재매수 가용
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  삼성전자 (005930) 1주 즉시 추가 매수 가능
                </p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                KR
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span>10월 배당 수령액 ₩245,000</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                현재가 ₩68,200 (잔액 ₩176,800)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '27.8%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              배당금 1회분으로 보유 주식수를 즉시 늘려 다음 분기 배당금이 누적 상승합니다.
            </p>
          </div>

          {/* 5년 / 10년 복리 시나리오 */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              100% 배당금 재투자 시 자산 누적 시나리오 (연 7% 기준)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    5년 후 복리
                  </span>
                  <i className="fa-solid fa-arrow-trend-up text-slate-400 text-xs"></i>
                </div>
                <div className="my-2">
                  <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    ₩10,480,000
                  </div>
                  <p className="text-[11px] text-red-500 font-semibold tabular-nums">
                    +₩2,280,000 증식효과
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
                  월 배당액 ₩210,000으로 상승
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    10년 후 복리
                  </span>
                  <i className="fa-solid fa-rocket text-slate-400 text-xs"></i>
                </div>
                <div className="my-2">
                  <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    ₩26,850,000
                  </div>
                  <p className="text-[11px] text-red-500 font-semibold tabular-nums">
                    +₩8,450,000 초과수익
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
                  월 배당액 ₩485,000으로 자가증식
                </div>
              </div>
            </div>
          </div>

          {/* 팁 콜아웃 */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
            <i className="fa-regular fa-lightbulb text-amber-500 text-base shrink-0"></i>
            <span>SCHD 및 리츠(O) 등 월배당 자산을 혼합하면 현금 흐름의 변동성을 더욱 낮출 수 있습니다.</span>
          </div>

        </div>

      </div>

      {/* 하단 상세 섹션: 배당 캘린더 & 종목별 타임라인 테이블 */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              배당 캘린더 &amp; 종목별 타임라인
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              배당락일(Ex-Date)과 실지급일(Pay-Date)을 기준으로 관리되는 자산별 상세 명세표
            </p>
          </div>

          {/* 검색 및 필터 바 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="종목명 또는 티커 검색..."
                className="w-48 sm:w-56 px-3 py-1.5 pl-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            </div>

            <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterMarket('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterMarket === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                전체 보기
              </button>
              <button
                type="button"
                onClick={() => setFilterMarket('KR')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterMarket === 'KR'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                국내주식
              </button>
              <button
                type="button"
                onClick={() => setFilterMarket('US')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterMarket === 'US'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                미국주식
              </button>
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-4">상태</th>
                <th className="py-3 px-4">종목 코드 / 자산명</th>
                <th className="py-3 px-4">배당락일 (Ex-Div)</th>
                <th className="py-3 px-4">지급 예정일 (Pay-Date)</th>
                <th className="py-3 px-4 text-right">주당 배당금 (DPS)</th>
                <th className="py-3 px-4 text-right">보유 수량</th>
                <th className="py-3 px-4 text-right">
                  예상 수령액 ({taxMode === 'net' ? '세후' : '세전'})
                </th>
                <th className="py-3 px-4 text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredList.map((item) => {
                const totalGross = item.dps * item.quantity;
                const totalNet = totalGross * (1 - item.taxRate);
                const displayAmount = taxMode === 'net' ? totalNet : totalGross;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* 상태 (지급 예정 / 지급 완료) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                          <i className="fa-regular fa-circle-check text-indigo-500"></i>
                          지급 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                          지급 예정
                        </span>
                      )}
                    </td>

                    {/* 종목 코드 / 자산명 */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          {item.ticker.slice(0, 4)}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 tabular-nums">
                            {item.market} • {item.memo || '정기배당'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 배당락일 */}
                    <td className="py-3.5 px-4 whitespace-nowrap tabular-nums text-slate-500 dark:text-slate-400">
                      {item.exDate}
                    </td>

                    {/* 지급 예정일 */}
                    <td className="py-3.5 px-4 whitespace-nowrap tabular-nums font-semibold text-slate-900 dark:text-white">
                      {item.payDate}
                    </td>

                    {/* DPS */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.dps, item.currency)}
                    </td>

                    {/* 수량 */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {item.quantity}주
                    </td>

                    {/* 예상 수령액 */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right tabular-nums">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(displayAmount, item.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {taxMode === 'net'
                          ? `세전 ${formatCurrency(totalGross, item.currency)}`
                          : `세율 ${(item.taxRate * 100).toFixed(1)}%`}
                      </div>
                    </td>

                    {/* 액션 */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title={item.isPaid ? '미지급으로 변경' : '지급 완료로 체크'}
                          onClick={() => onToggleDividendStatus(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <i
                            className={
                              item.isPaid
                                ? 'fa-solid fa-circle-check text-indigo-500'
                                : 'fa-regular fa-circle'
                            }
                          ></i>
                        </button>
                        <button
                          type="button"
                          title="삭제"
                          onClick={() => onDeleteDividend(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
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

      </div>

    </div>
  );
};
