/**
 * StockBook - 매매 일지 컴포넌트
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Holding, TradeJournalEntry } from '../types/stockbook';
import { formatCurrency } from '../utils/formatters';

interface TradeJournalProps {
  holdings: Holding[];
  journals: TradeJournalEntry[];
  onAddJournal: (entry: Omit<TradeJournalEntry, 'id'>) => void;
  onDeleteJournal: (id: string) => void;
}

export const TradeJournal: React.FC<TradeJournalProps> = ({
  holdings,
  journals,
  onAddJournal,
  onDeleteJournal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  // Form states
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currency, setCurrency] = useState('KRW');
  const [thesis, setThesis] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const defaultJournals: TradeJournalEntry[] = [
    {
      id: 'journal-1',
      ticker: '005930',
      name: '삼성전자',
      type: 'BUY',
      date: '2024-01-15',
      price: 68000,
      quantity: 240,
      currency: 'KRW',
      thesis: 'HBM3E 엔비디아 퀄 테스트 통과 기대감 및 메모리 사이클 바닥 통과 확인. 68,000원 지지선 분할 매수 진입.',
      targetPrice: 85000,
      stopLoss: 62000,
    },
    {
      id: 'journal-2',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      type: 'BUY',
      date: '2024-02-10',
      price: 175.20,
      quantity: 50,
      currency: 'USD',
      thesis: '온디바이스 AI 사이클에 따른 아이폰 슈퍼사이클 예상. 서비스 부문 마진 확대 지속.',
      targetPrice: 220.00,
      stopLoss: 165.00,
    },
    {
      id: 'journal-3',
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      type: 'BUY',
      date: '2024-05-20',
      price: 220.00,
      quantity: 15,
      currency: 'USD',
      thesis: 'FSD V12 종단간 신경망 배포 및 8월 로보택시 공개 기대감. 단기 변동성 높으나 장기 성장성 베팅.',
      targetPrice: 260.00,
      stopLoss: 180.00,
    },
  ];

  const activeJournals = journals && journals.length > 0 ? journals : defaultJournals;

  const filteredJournals = activeJournals.filter((j) => {
    if (filterType === 'ALL') return true;
    return j.type === filterType;
  });

  const handleHoldingSelect = (id: string) => {
    const h = holdings.find((item) => item.id === id);
    if (h) {
      setTicker(h.ticker);
      setName(h.name);
      setCurrency(h.currency);
      setPrice(String(h.buyPrice));
      setQuantity(String(h.quantity));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ticker.trim() || !price || !quantity || !thesis.trim()) {
      alert('필수 입력 항목을 모두 입력해주세요.');
      return;
    }

    onAddJournal({
      ticker: ticker.trim().toUpperCase(),
      name: name.trim(),
      type,
      date,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      currency,
      thesis: thesis.trim(),
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
    });

    // 폼 초기화
    setThesis('');
    setTargetPrice('');
    setStopLoss('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* 헤더 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-book-bookmark text-indigo-500"></i>
            투자 매매 일지 &amp; 아이디어 기록
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            매수/매도 시점의 가설과 목표가, 원칙을 기록하여 감정 매매를 방지하고 복기를 지원합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 타입 필터 */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              전체 ({activeJournals.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('BUY')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'BUY'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              매수 기록
            </button>
            <button
              type="button"
              onClick={() => setFilterType('SELL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === 'SELL'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              매도 기록
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <i className={`fa-solid ${showAddForm ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
            <span>{showAddForm ? '작성 닫기' : '새 일지 작성'}</span>
          </button>
        </div>
      </div>

      {/* 새 일지 작성 폼 슬라이드 */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-4 text-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
            <span>매매 일지 등록</span>
            <span className="text-[11px] text-slate-400 font-normal">투자 근거를 기록하세요</span>
          </div>

          {holdings.length > 0 && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                보유 종목에서 빠른 선택
              </label>
              <select
                onChange={(e) => handleHoldingSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="">종목 선택 (직접 입력 가능)</option>
                {holdings.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.ticker}) - {h.market}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                구분
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
              >
                <option value="BUY">매수 (BUY)</option>
                <option value="SELL">매도 (SELL)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                종목명 *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 삼성전자"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                티커 *
              </label>
              <input
                type="text"
                required
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="예: 005930"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                매매 일자
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                단가 *
              </label>
              <input
                type="number"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                수량 *
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                목표가 (Target)
              </label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="선택 사항"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                손절가 (Stop Loss)
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="선택 사항"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              매매 가설 및 진입/청산 근거 (Investment Thesis) *
            </label>
            <textarea
              rows={3}
              required
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="왜 이 가격에 진입했는지, 어떤 이벤트나 지표를 확인했는지, 포트폴리오 내 역할은 무엇인지 구체적으로 기록하세요."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs resize-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/20 active:scale-95"
            >
              일지 저장
            </button>
          </div>
        </form>
      )}

      {/* 일지 리스트 */}
      <div className="space-y-3">
        {filteredJournals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
            기록된 매매 일지가 없습니다. '새 일지 작성' 버튼을 눌러 첫 매매 기록을 남겨보세요.
          </div>
        ) : (
          filteredJournals.map((j) => (
            <div
              key={j.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                      j.type === 'BUY'
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {j.type === 'BUY' ? '매수 체결' : '매도 체결'}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{j.name}</span>
                      <span className="text-xs text-slate-400 tabular-nums">({j.ticker})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      체결일: {j.date} • {j.quantity}주 @ {formatCurrency(j.price, j.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDeleteJournal(j.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    title="일지 삭제"
                  >
                    <i className="fa-regular fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>

              {/* 매매 가설 내용 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">
                  투자 근거 &amp; 전략
                </div>
                <p>{j.thesis}</p>
              </div>

              {/* 목표가 / 손절가 바 */}
              {(j.targetPrice || j.stopLoss) && (
                <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-500">
                  {j.targetPrice && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        목표가:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(j.targetPrice, j.currency)}
                      </span>
                    </div>
                  )}
                  {j.stopLoss && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-red-500 font-bold">
                        손절가:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(j.stopLoss, j.currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
