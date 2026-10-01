/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * StockBook - 스마트 주식 가계부 메인 애플리케이션
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AIDeepReport } from './components/AIDeepReport';
import { AdviceSection } from './components/AdviceSection';
import { AllocationChart } from './components/AllocationChart';
import { DividendCalendar } from './components/DividendCalendar';
import { DividendModal } from './components/DividendModal';
import { Header } from './components/Header';
import { HoldingModal } from './components/HoldingModal';
import { HoldingsSection } from './components/HoldingsSection';
import { SettingsModal } from './components/SettingsModal';
import { SummaryCards } from './components/SummaryCards';
import { ToastContainer, ToastMessage } from './components/Toast';
import { TradeJournal } from './components/TradeJournal';
import {
  AdviceHistoryItem,
  AppSettings,
  CurrencySummary,
  DEFAULT_MODEL,
  DividendRecord,
  Holding,
  StockBookState,
  TradeJournalEntry,
} from './types/stockbook';
import { formatDateWithDay } from './utils/formatters';
import { fetchPortfolioAdvice } from './utils/gemini';
import {
  exportBackupJSON,
  loadStockBookState,
  saveStockBookState,
  validateBackupData,
} from './utils/storage';

/**
 * 중앙 앱 상태 객체 레퍼런스
 * (요구사항: const AppState = {} 객체로 상태를 중앙 관리)
 */
export const AppState = {
  state: null as StockBookState | null,
};

/**
 * StockBook 메인 컴포넌트
 */
export default function App() {
  // 토스트 메시지 상태
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * 사용자 알림 토스트 추가 헬퍼
   * @param {string} message - 표시할 메시지
   * @param {'success' | 'error' | 'warning' | 'info'} type - 알림 종류
   */
  const addToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // 초기 상태 로드 (localStorage 'stockbook_v1' 연동 및 파싱 오류 시 자동 복구)
  const [data, setData] = useState<StockBookState>(() => {
    const loaded = loadStockBookState((msg, type) => addToast(msg, type));
    AppState.state = loaded;
    return loaded;
  });

  // 상태 변경 시마다 로컬스토리지 저장 및 전역 AppState 동기화
  useEffect(() => {
    AppState.state = data;
    saveStockBookState(data);
  }, [data]);

  // 다크모드 상태 관리
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('stockbook_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('stockbook_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('stockbook_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // 탭 네비게이션: 'portfolio' | 'dividend' | 'journal' | 'aiReport'
  const [activeTab, setActiveTab] = useState<'portfolio' | 'dividend' | 'journal' | 'aiReport'>('portfolio');

  // 통화 필터: 'ALL' | 'KRW' | 'USD'
  const [selectedCurrency, setSelectedCurrency] = useState<'ALL' | 'KRW' | 'USD'>('ALL');

  // 모달 제어 상태
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);

  // 백업 파일 인풋 레퍼런스
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 어드바이저 상태
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [canOpenSettings, setCanOpenSettings] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [activeAdvice, setActiveAdvice] = useState<AdviceHistoryItem | null>(() => {
    return data.adviceHistory[0] || null;
  });

  /**
   * 통화별 독립 요약 계산 (KRW와 USD 합산 금지 원칙 준수)
   */
  const currencySummaries = useMemo<CurrencySummary[]>(() => {
    const groups: Record<
      string,
      { buyAmount: number; currentVal: number; count: number }
    > = {};

    data.holdings.forEach((h) => {
      const curr = (h.currency || 'KRW').toUpperCase();
      if (!groups[curr]) {
        groups[curr] = { buyAmount: 0, currentVal: 0, count: 0 };
      }
      const buy = h.buyPrice * h.quantity;
      const current = (h.currentPrice ?? h.buyPrice) * h.quantity;
      groups[curr].buyAmount += buy;
      groups[curr].currentVal += current;
      groups[curr].count += 1;
    });

    const currencies = Object.keys(groups);
    if (currencies.length === 0) {
      return [
        {
          currency: 'KRW',
          symbol: '₩',
          totalBuyAmount: 0,
          totalCurrentValue: 0,
          totalProfit: 0,
          profitRate: 0,
          holdingCount: 0,
        },
      ];
    }

    return currencies.map((curr) => {
      const { buyAmount, currentVal, count } = groups[curr];
      const profit = currentVal - buyAmount;
      const profitRate = buyAmount > 0 ? (profit / buyAmount) * 100 : 0;
      const symbol = curr === 'USD' ? '$' : curr === 'JPY' ? '¥' : '₩';

      return {
        currency: curr,
        symbol,
        totalBuyAmount: buyAmount,
        totalCurrentValue: currentVal,
        totalProfit: profit,
        profitRate,
        holdingCount: count,
      };
    });
  }, [data.holdings]);

  // ==================== 보유 종목 CRUD ====================

  /**
   * 인라인 현재가 수정 핸들러
   * @param {string} id - 종목 ID
   * @param {number} newPrice - 새 현재가
   */
  const handleUpdateCurrentPrice = (id: string, newPrice: number) => {
    setData((prev) => ({
      ...prev,
      holdings: prev.holdings.map((h) =>
        h.id === id ? { ...h, currentPrice: newPrice } : h
      ),
    }));
  };

  /**
   * 보유 종목 저장 (추가 또는 수정)
   */
  const handleSaveHolding = (
    holdingData: Omit<Holding, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      // 수정
      setData((prev) => ({
        ...prev,
        holdings: prev.holdings.map((h) =>
          h.id === existingId ? { ...holdingData, id: existingId } : h
        ),
      }));
      addToast(`'${holdingData.name}' 종목 정보가 수정되었습니다.`, 'success');
    } else {
      // 신규 추가
      const newHolding: Holding = {
        ...holdingData,
        id: crypto.randomUUID(),
      };
      setData((prev) => ({
        ...prev,
        holdings: [newHolding, ...prev.holdings],
      }));
      addToast(`'${holdingData.name}' 종목이 포트폴리오에 추가되었습니다.`, 'success');
    }
    setEditingHolding(null);
  };

  /**
   * 보유 종목 삭제
   */
  const handleDeleteHolding = (id: string, name: string) => {
    if (confirm(`'${name}' 종목을 정말 삭제하시겠습니까?`)) {
      setData((prev) => ({
        ...prev,
        holdings: prev.holdings.filter((h) => h.id !== id),
      }));
      addToast(`'${name}' 종목이 삭제되었습니다.`, 'info');
    }
  };

  // ==================== 환경설정 관리 ====================

  /**
   * 환경설정 저장
   */
  const handleSaveSettings = (newSettings: AppSettings) => {
    setData((prev) => ({
      ...prev,
      settings: newSettings,
    }));
    addToast('환경설정이 안전하게 저장되었습니다.', 'success');
  };

  /**
   * API 키 삭제
   */
  const handleDeleteApiKey = () => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        apiKey: '',
      },
    }));
    addToast('Gemini API 키가 안전하게 삭제되었습니다.', 'info');
  };

  // ==================== Gemini AI 어드바이저 호출 ====================

  /**
   * AI 조언 받기 요청 처리
   */
  const handleGetAdvice = async () => {
    setAiError(null);
    setCanOpenSettings(false);
    setCanRetry(false);

    const apiKey = data.settings.apiKey?.trim();
    if (!apiKey) {
      setIsSettingsOpen(true);
      addToast('Gemini API 키가 필요합니다. 설정창에서 API 키를 입력해주세요.', 'warning');
      return;
    }

    if (data.holdings.length === 0) {
      setAiError('분석할 보유 종목이 없습니다. 먼저 종목을 1개 이상 등록해주세요.');
      addToast('보유 종목이 없어 AI 분석을 진행할 수 없습니다.', 'warning');
      return;
    }

    setIsAiLoading(true);

    try {
      const result = await fetchPortfolioAdvice(
        apiKey,
        data.settings.model || DEFAULT_MODEL,
        data.holdings,
        currencySummaries
      );

      if (result.success && result.content) {
        const now = new Date();
        const newAdviceItem: AdviceHistoryItem = {
          id: crypto.randomUUID(),
          timestamp: now.toISOString(),
          dateStr: formatDateWithDay(now),
          model: data.settings.model || DEFAULT_MODEL,
          content: result.content,
          summaryTitle: '포트폴리오 리밸런싱 인사이트',
        };

        // 최대 10개까지 히스토리 보관
        setData((prev) => ({
          ...prev,
          adviceHistory: [newAdviceItem, ...prev.adviceHistory.slice(0, 9)],
        }));
        setActiveAdvice(newAdviceItem);
        addToast('AI 포트폴리오 분석 조언이 도착했습니다!', 'success');
      } else {
        setAiError(result.error || 'AI 조언 요청 중 오류가 발생했습니다.');
        setCanOpenSettings(Boolean(result.canOpenSettings));
        setCanRetry(Boolean(result.canRetry));
      }
    } catch (err: any) {
      setAiError(`네트워크 오류가 발생했습니다: ${err.message}`);
      setCanRetry(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ==================== 백업 & 복원 ====================

  /**
   * 백업 파일 다운로드 (apiKey 제외)
   */
  const handleExportBackup = () => {
    try {
      exportBackupJSON(data);
      addToast('JSON 백업 파일이 다운로드되었습니다. (보안을 위해 API 키 제외)', 'success');
    } catch {
      addToast('백업 파일 생성 중 오류가 발생했습니다.', 'error');
    }
  };

  /**
   * 백업 파일 불러오기 트리거
   */
  const handleTriggerRestore = () => {
    fileInputRef.current?.click();
  };

  /**
   * 파일 선택 시 복원 처리
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const validation = validateBackupData(parsed);

        if (!validation.valid || !validation.state) {
          addToast(validation.error || '유효하지 않은 백업 파일입니다.', 'error');
          return;
        }

        if (confirm('백업 데이터를 불러오시겠습니까? 기존 보유 종목 데이터가 덮어씌워집니다.')) {
          // 기존 API 키는 유지
          const restoredState: StockBookState = {
            ...validation.state,
            settings: {
              ...validation.state.settings,
              apiKey: data.settings.apiKey, // 기존 키 보존
            },
          };

          setData(restoredState);
          setActiveAdvice(restoredState.adviceHistory[0] || null);
          addToast('데이터가 성공적으로 복원되었습니다!', 'success');
        }
      } catch (err) {
        addToast('JSON 파일 파싱에 실패했습니다. 올바른 백업 파일을 선택해주세요.', 'error');
      } finally {
        // 인풋 초기화
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // ==================== 배당금 캘린더 CRUD ====================

  const handleAddDividend = (record: Omit<DividendRecord, 'id'>) => {
    const newDiv: DividendRecord = {
      ...record,
      id: crypto.randomUUID(),
    };
    setData((prev) => ({
      ...prev,
      dividends: [newDiv, ...(prev.dividends || [])],
    }));
    addToast(`${record.name} 배당 스케줄이 추가되었습니다.`, 'success');
  };

  const handleToggleDividendStatus = (id: string) => {
    setData((prev) => ({
      ...prev,
      dividends: (prev.dividends || []).map((d) =>
        d.id === id ? { ...d, isPaid: !d.isPaid } : d
      ),
    }));
  };

  const handleDeleteDividend = (id: string) => {
    if (confirm('해당 배당 내역을 삭제하시겠습니까?')) {
      setData((prev) => ({
        ...prev,
        dividends: (prev.dividends || []).filter((d) => d.id !== id),
      }));
      addToast('배당 내역이 삭제되었습니다.', 'info');
    }
  };

  // ==================== 매매 일지 CRUD ====================

  const handleAddJournal = (entry: Omit<TradeJournalEntry, 'id'>) => {
    const newJournal: TradeJournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setData((prev) => ({
      ...prev,
      journals: [newJournal, ...(prev.journals || [])],
    }));
    addToast(`${entry.name} 매매 일지가 등록되었습니다.`, 'success');
  };

  const handleDeleteJournal = (id: string) => {
    if (confirm('해당 매매 일지를 삭제하시겠습니까?')) {
      setData((prev) => ({
        ...prev,
        journals: (prev.journals || []).filter((j) => j.id !== id),
      }));
      addToast('매매 일지가 삭제되었습니다.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 pb-24">
      
      {/* 토스트 알림 컨테이너 */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* 숨겨진 JSON 파일 업로드 인풋 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* ==================== HEADER ==================== */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        isDark={isDark}
        toggleTheme={toggleTheme}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* ==================== MAIN CONTENT CONTAINER ==================== */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* 탭 1: 포트폴리오 (Image 1 메인 대시보드) */}
        {activeTab === 'portfolio' && (
          <>
            {/* 1. 요약 카드 섹션 (총 매수금액, 총 평가금액, 총 평가손익) */}
            <SummaryCards
              currencySummaries={currencySummaries}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              totalHoldingsCount={data.holdings.length}
            />

            {/* 2. 포트폴리오 비중 차트 섹션 (SVG Donut Chart + 범례) */}
            <AllocationChart
              holdings={data.holdings}
              currencySummaries={currencySummaries}
            />

            {/* 3. 보유 종목 내역 섹션 (데스크톱 테이블 + 모바일 카드 + 인라인 현재가 수정) */}
            <HoldingsSection
              holdings={data.holdings}
              selectedCurrency={selectedCurrency}
              onUpdateCurrentPrice={handleUpdateCurrentPrice}
              onEditHolding={(holding) => {
                setEditingHolding(holding);
                setIsHoldingModalOpen(true);
              }}
              onDeleteHolding={handleDeleteHolding}
              onOpenAddModal={() => {
                setEditingHolding(null);
                setIsHoldingModalOpen(true);
              }}
            />

            {/* 4. Gemini AI 포트폴리오 어드바이저 패널 */}
            <AdviceSection
              currentAdvice={activeAdvice}
              adviceHistory={data.adviceHistory}
              isLoading={isAiLoading}
              errorMessage={aiError}
              canOpenSettings={canOpenSettings}
              canRetry={canRetry}
              onGetAdvice={handleGetAdvice}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSelectHistory={(item) => setActiveAdvice(item)}
            />
          </>
        )}

        {/* 탭 2: 배당금 캘린더 (Image 3 현금흐름 리포트 & DRIP 복리 시뮬레이터) */}
        {activeTab === 'dividend' && (
          <DividendCalendar
            holdings={data.holdings}
            dividends={data.dividends || []}
            onAddDividend={() => setIsDividendModalOpen(true)}
            onToggleDividendStatus={handleToggleDividendStatus}
            onDeleteDividend={handleDeleteDividend}
          />
        )}

        {/* 탭 3: 매매 일지 & 투자 가설 기록 */}
        {activeTab === 'journal' && (
          <TradeJournal
            holdings={data.holdings}
            journals={data.journals || []}
            onAddJournal={handleAddJournal}
            onDeleteJournal={handleDeleteJournal}
          />
        )}

        {/* 탭 4: AI 심층 리포트 */}
        {activeTab === 'aiReport' && (
          <AIDeepReport
            holdings={data.holdings}
            currencySummaries={currencySummaries}
            adviceHistory={data.adviceHistory}
            isLoading={isAiLoading}
            onGetAdvice={handleGetAdvice}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* ==================== FOOTER / DATA TOOLS ==================== */}
        <footer className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <i className="fa-solid fa-database text-[11px]"></i>
              <span>데이터 관리 및 로컬 백업:</span>
            </div>
            
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* 데이터 백업 (JSON 내보내기, id="backup-btn") */}
              <button
                type="button"
                id="backup-btn"
                onClick={handleExportBackup}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all"
              >
                <i className="fa-solid fa-file-export text-slate-400"></i>
                데이터 백업 (JSON)
              </button>

              {/* 복원 (JSON 불러오기, id="restore-btn") */}
              <button
                type="button"
                id="restore-btn"
                onClick={handleTriggerRestore}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all"
              >
                <i className="fa-solid fa-file-import text-slate-400"></i>
                복원 (JSON 불러오기)
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 mt-6">
            © 2025 StockBook. 미니멀 개인 주식 자산관리. 본 서비스의 정보는 참고용이며 투자 판단의 책임은 본인에게 있습니다.
          </div>
        </footer>

      </main>

      {/* ==================== MODALS ==================== */}

      {/* 1. 환경설정 모달 (id="settings-modal") */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={data.settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onDeleteKey={handleDeleteApiKey}
      />

      {/* 2. 종목 추가/수정 모달 (id="holding-modal") */}
      <HoldingModal
        isOpen={isHoldingModalOpen}
        editingHolding={editingHolding}
        onClose={() => {
          setIsHoldingModalOpen(false);
          setEditingHolding(null);
        }}
        onSave={handleSaveHolding}
      />

      {/* 3. 배당 스케줄 등록 모달 */}
      <DividendModal
        isOpen={isDividendModalOpen}
        holdings={data.holdings}
        onClose={() => setIsDividendModalOpen(false)}
        onSave={handleAddDividend}
      />

    </div>
  );
}
