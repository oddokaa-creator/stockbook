/**
 * StockBook - 상단 헤더 컴포넌트
 * @license Apache-2.0
 */

import React from 'react';

interface HeaderProps {
  activeTab: 'portfolio' | 'dividend' | 'journal' | 'aiReport';
  setActiveTab: (tab: 'portfolio' | 'dividend' | 'journal' | 'aiReport') => void;
  selectedCurrency: 'ALL' | 'KRW' | 'USD';
  setSelectedCurrency: (curr: 'ALL' | 'KRW' | 'USD') => void;
  isDark: boolean;
  toggleTheme: () => void;
  openSettings: () => void;
}

/**
 * 상단 헤더 컴포넌트
 */
export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCurrency,
  setSelectedCurrency,
  isDark,
  toggleTheme,
  openSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* 좌측 로고 및 브랜드 */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveTab('portfolio')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <i className="fa-solid fa-chart-pie text-base"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent">
              StockBook
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:inline">
              스마트 주식 가계부
            </span>
          </div>
        </div>

        {/* 중앙 메인 네비게이션 탭 (데스크톱 및 태블릿) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'portfolio'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            포트폴리오
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dividend')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'dividend'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            배당금 캘린더
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'journal'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            매매 일지
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aiReport')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'aiReport'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            AI 심층 리포트
          </button>
        </nav>

        {/* 우측 컨트롤 도구들 */}
        <div className="flex items-center gap-2">
          {/* 통화 선택기 */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedCurrency('ALL')}
              className={`px-2 py-1 rounded-lg transition-colors text-[11px] ${
                selectedCurrency === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency('KRW')}
              className={`px-2 py-1 rounded-lg transition-colors text-[11px] ${
                selectedCurrency === 'KRW'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              KRW
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency('USD')}
              className={`px-2 py-1 rounded-lg transition-colors text-[11px] ${
                selectedCurrency === 'USD'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              USD
            </button>
          </div>

          {/* 테마 전환 버튼 (id="theme-toggle") */}
          <button
            id="theme-toggle"
            type="button"
            aria-label="테마 전환"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            {isDark ? (
              <i className="fa-regular fa-sun text-base text-amber-400"></i>
            ) : (
              <i className="fa-regular fa-moon text-base text-slate-600"></i>
            )}
          </button>

          {/* 환경설정 버튼 (id="settings-btn") */}
          <button
            id="settings-btn"
            type="button"
            aria-label="설정 열기"
            onClick={openSettings}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <i className="fa-solid fa-gear text-base"></i>
          </button>
        </div>

      </div>

      {/* 모바일 하단 탭 메뉴 */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 py-1 px-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 py-1.5 text-center font-medium rounded-lg ${
            activeTab === 'portfolio'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          포트폴리오
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dividend')}
          className={`flex-1 py-1.5 text-center font-medium rounded-lg ${
            activeTab === 'dividend'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          배당금
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-1.5 text-center font-medium rounded-lg ${
            activeTab === 'journal'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          매매일지
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('aiReport')}
          className={`flex-1 py-1.5 text-center font-medium rounded-lg ${
            activeTab === 'aiReport'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          AI 리포트
        </button>
      </div>
    </header>
  );
};
