/**
 * StockBook - 종목 추가 및 수정 모달 컴포넌트
 * 인라인 에러 검증 규칙 완벽 지원
 * @license Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CurrencyType, Holding, MarketType } from '../types/stockbook';

interface HoldingModalProps {
  isOpen: boolean;
  editingHolding: Holding | null;
  onClose: () => void;
  onSave: (holdingData: Omit<Holding, 'id'>, id?: string) => void;
}

interface FormErrors {
  name?: string;
  ticker?: string;
  buyPrice?: string;
  quantity?: string;
  buyDate?: string;
  currentPrice?: string;
}

/**
 * 종목 추가 / 수정 모달
 */
export const HoldingModal: React.FC<HoldingModalProps> = ({
  isOpen,
  editingHolding,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [market, setMarket] = useState<MarketType>('KOSPI');
  const [currency, setCurrency] = useState<CurrencyType>('KRW');
  const [sector, setSector] = useState('');
  const [buyDate, setBuyDate] = useState('');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [memo, setMemo] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // 오늘 날짜 YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (isOpen) {
      if (editingHolding) {
        setName(editingHolding.name);
        setTicker(editingHolding.ticker);
        setMarket((editingHolding.market as MarketType) || 'KOSPI');
        setCurrency((editingHolding.currency as CurrencyType) || 'KRW');
        setSector(editingHolding.sector || '');
        setBuyDate(editingHolding.buyDate || today);
        setBuyPrice(String(editingHolding.buyPrice));
        setQuantity(String(editingHolding.quantity));
        setCurrentPrice(String(editingHolding.currentPrice ?? editingHolding.buyPrice));
        setMemo(editingHolding.memo || '');
      } else {
        // 새 종목 등록 기본값
        setName('');
        setTicker('');
        setMarket('KOSPI');
        setCurrency('KRW');
        setSector('');
        setBuyDate(today);
        setBuyPrice('');
        setQuantity('');
        setCurrentPrice('');
        setMemo('');
      }
      setErrors({});
    }
  }, [isOpen, editingHolding]);

  if (!isOpen) return null;

  // 시장 변경 시 통화 자동 추론 편의 제공
  const handleMarketChange = (newMarket: MarketType) => {
    setMarket(newMarket);
    if (newMarket === 'KOSPI' || newMarket === 'KOSDAQ') {
      setCurrency('KRW');
    } else if (newMarket === 'NASDAQ' || newMarket === 'NYSE') {
      setCurrency('USD');
    }
  };

  /**
   * 폼 유효성 검사 (인라인 에러 메시지 표시)
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. 종목명 필수
    if (!name.trim()) {
      newErrors.name = '종목명을 입력해주세요.';
    }

    // 2. 티커/코드 필수
    if (!ticker.trim()) {
      newErrors.ticker = '티커 또는 종목코드를 입력해주세요.';
    }

    // 3. 매수가 > 0
    const priceNum = parseFloat(buyPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.buyPrice = '평균 매수가는 0보다 큰 숫자여야 합니다.';
    }

    // 4. 수량 > 0 (소수점 허용)
    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = '수량은 0보다 큰 숫자여야 합니다 (소수점 가능).';
    }

    // 5. 매수일 미래 불가
    if (buyDate && buyDate > today) {
      newErrors.buyDate = '매수일은 미래 날짜일 수 없습니다.';
    }

    // 6. 현재가 검사 (입력된 경우 >= 0)
    if (currentPrice.trim() !== '') {
      const curNum = parseFloat(currentPrice);
      if (isNaN(curNum) || curNum < 0) {
        newErrors.currentPrice = '현재가는 0 이상이어야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedBuyPrice = parseFloat(buyPrice);
    const parsedQty = parseFloat(quantity);
    const parsedCurrentPrice =
      currentPrice.trim() !== '' ? parseFloat(currentPrice) : parsedBuyPrice;

    onSave(
      {
        name: name.trim(),
        ticker: ticker.trim().toUpperCase(),
        market,
        currency,
        sector: sector.trim(),
        buyPrice: parsedBuyPrice,
        quantity: parsedQty,
        buyDate: buyDate || today,
        currentPrice: parsedCurrentPrice,
        memo: memo.trim(),
        status: 'active',
      },
      editingHolding ? editingHolding.id : undefined
    );

    onClose();
  };

  return (
    <div
      id="holding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-plus"></i>
            </div>
            <h3
              id="holding-modal-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              {editingHolding ? '보유 종목 수정' : '보유 종목 추가'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* 폼 콘텐츠 (id="holding-form") */}
        <form id="holding-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 종목명 (id="input-stock-name") */}
            <div>
              <label
                htmlFor="input-stock-name"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                종목명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="input-stock-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="예: 삼성전자, Apple"
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.name
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-xs`}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  {errors.name}
                </p>
              )}
            </div>

            {/* 티커 / 코드 (id="input-stock-ticker") */}
            <div>
              <label
                htmlFor="input-stock-ticker"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                티커 / 종목코드 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="input-stock-ticker"
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value);
                  if (errors.ticker) setErrors((prev) => ({ ...prev, ticker: undefined }));
                }}
                placeholder="예: 005930, AAPL"
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.ticker
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-xs uppercase`}
              />
              {errors.ticker && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  {errors.ticker}
                </p>
              )}
            </div>

            {/* 시장 구분 (id="select-stock-market") */}
            <div>
              <label
                htmlFor="select-stock-market"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                시장 구분
              </label>
              <select
                id="select-stock-market"
                value={market}
                onChange={(e) => handleMarketChange(e.target.value as MarketType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="KOSPI">한국 KOSPI</option>
                <option value="KOSDAQ">한국 KOSDAQ</option>
                <option value="NASDAQ">미국 NASDAQ</option>
                <option value="NYSE">미국 NYSE</option>
                <option value="ETC">기타</option>
              </select>
            </div>

            {/* 거래 통화 (id="select-stock-currency") */}
            <div>
              <label
                htmlFor="select-stock-currency"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                거래 통화
              </label>
              <select
                id="select-stock-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="KRW">KRW (원화 ₩)</option>
                <option value="USD">USD (달러 $)</option>
                <option value="JPY">JPY (엔화 ¥)</option>
              </select>
            </div>

            {/* 섹터 / 업종 (id="input-stock-sector") */}
            <div>
              <label
                htmlFor="input-stock-sector"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                섹터 / 업종
              </label>
              <input
                type="text"
                id="input-stock-sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="예: IT/반도체, 전기차, 헬스케어"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            {/* 최초 매수일 (id="input-stock-date") */}
            <div>
              <label
                htmlFor="input-stock-date"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                최초 매수일
              </label>
              <input
                type="date"
                id="input-stock-date"
                value={buyDate}
                max={today}
                onChange={(e) => {
                  setBuyDate(e.target.value);
                  if (errors.buyDate) setErrors((prev) => ({ ...prev, buyDate: undefined }));
                }}
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.buyDate
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-xs`}
              />
              {errors.buyDate && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  {errors.buyDate}
                </p>
              )}
            </div>

            {/* 평균 매수가 (id="input-stock-price") */}
            <div>
              <label
                htmlFor="input-stock-price"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                평균 매수가 ({currency === 'USD' ? '$' : '원'}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="input-stock-price"
                step="any"
                value={buyPrice}
                onChange={(e) => {
                  setBuyPrice(e.target.value);
                  if (errors.buyPrice) setErrors((prev) => ({ ...prev, buyPrice: undefined }));
                }}
                placeholder="0"
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.buyPrice
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-xs tabular-nums`}
              />
              {errors.buyPrice && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  {errors.buyPrice}
                </p>
              )}
            </div>

            {/* 보유 수량 (id="input-stock-qty") */}
            <div>
              <label
                htmlFor="input-stock-qty"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                보유 수량 (주) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="input-stock-qty"
                step="any"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
                }}
                placeholder="0"
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.quantity
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-xs tabular-nums`}
              />
              {errors.quantity && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* 현재가 (선택 입력, 미입력 시 매수가 적용) */}
            <div className="sm:col-span-2">
              <label
                htmlFor="input-current-price"
                className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                현재가 ({currency === 'USD' ? '$' : '원'}) <span className="text-slate-400 font-normal">(미입력 시 매수가와 동일하게 저장)</span>
              </label>
              <input
                type="number"
                id="input-current-price"
                step="any"
                value={currentPrice}
                onChange={(e) => {
                  setCurrentPrice(e.target.value);
                  if (errors.currentPrice) setErrors((prev) => ({ ...prev, currentPrice: undefined }));
                }}
                placeholder="현재 평가 가격"
                className={`w-full px-3 py-2 rounded-xl border ${
                  errors.currentPrice
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 text-xs tabular-nums`}
              />
              {errors.currentPrice && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  {errors.currentPrice}
                </p>
              )}
            </div>
          </div>

          {/* 투자 메모 / 매수 이유 (id="input-stock-memo") */}
          <div>
            <label
              htmlFor="input-stock-memo"
              className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              투자 메모 / 매수 이유
            </label>
            <textarea
              id="input-stock-memo"
              rows={2.5}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="매수 근거, 목표가, 손절가, 주요 일정 등"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
            ></textarea>
          </div>

          {/* 저장 / 취소 버튼 */}
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
              {editingHolding ? '수정 내용 저장' : '종목 저장'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
