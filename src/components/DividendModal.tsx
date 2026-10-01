/**
 * StockBook - 배당 내역 수동 추가 모달
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { DividendRecord, Holding } from '../types/stockbook';

interface DividendModalProps {
  isOpen: boolean;
  holdings: Holding[];
  onClose: () => void;
  onSave: (record: Omit<DividendRecord, 'id'>) => void;
}

export const DividendModal: React.FC<DividendModalProps> = ({
  isOpen,
  holdings,
  onClose,
  onSave,
}) => {
  const [selectedStockId, setSelectedStockId] = useState('');
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [market, setMarket] = useState('KOSPI');
  const [currency, setCurrency] = useState('KRW');
  const [exDate, setExDate] = useState('');
  const [payDate, setPayDate] = useState('');
  const [dps, setDps] = useState('');
  const [quantity, setQuantity] = useState('');
  const [applyStandardTax, setApplyStandardTax] = useState(true);

  if (!isOpen) return null;

  // 종목 선택 시 자동완성
  const handleSelectStock = (stockId: string) => {
    setSelectedStockId(stockId);
    const stock = holdings.find((h) => h.id === stockId);
    if (stock) {
      setTicker(stock.ticker);
      setName(stock.name);
      setMarket(stock.market);
      setCurrency(stock.currency);
      setQuantity(String(stock.quantity));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || !name.trim() || !dps || !quantity) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const taxRate = applyStandardTax ? (currency === 'USD' ? 0.15 : 0.154) : 0;

    onSave({
      holdingId: selectedStockId || undefined,
      ticker: ticker.trim().toUpperCase(),
      name: name.trim(),
      market,
      currency,
      exDate: exDate || new Date().toISOString().slice(0, 10),
      payDate: payDate || new Date().toISOString().slice(0, 10),
      dps: parseFloat(dps) || 0,
      quantity: parseFloat(quantity) || 0,
      isPaid: false,
      taxRate,
      memo: '수동 등록',
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-coins"></i>
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">배당 내역 수동 등록</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 기존 보유 종목에서 빠른 불러오기 */}
          {holdings.length > 0 && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                기존 보유 종목에서 자동 채우기
              </label>
              <select
                value={selectedStockId}
                onChange={(e) => handleSelectStock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="">직접 입력 또는 종목 선택</option>
                {holdings.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.ticker}) - 보유 {h.quantity}주
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                종목명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 삼성전자"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                티커 (Ticker) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="예: 005930, AAPL"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                배당락일 (Ex-Date)
              </label>
              <input
                type="date"
                value={exDate}
                onChange={(e) => setExDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                지급 예정일 (Pay-Date)
              </label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                주당 배당금 (DPS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={dps}
                onChange={(e) => setDps(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                보유 주식수 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <input
              type="checkbox"
              id="tax-deduct-modal"
              checked={applyStandardTax}
              onChange={(e) => setApplyStandardTax(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <label htmlFor="tax-deduct-modal" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              표준 원천징수세(국내 15.4% / 해외 15.0%) 자동 차감 적용
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
            >
              배당 스케줄 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
