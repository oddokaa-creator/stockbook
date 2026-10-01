/**
 * StockBook - 스마트 주식 가계부 타입 정의
 * @license Apache-2.0
 */

/**
 * 기본 AI 모델명 상수 (한 곳에서만 정의)
 */
export const DEFAULT_MODEL = 'gemini-3.6-flash';

/**
 * 로컬 스토리지 키 상수
 */
export const STORAGE_KEY = 'stockbook_v1';
export const STORAGE_BACKUP_KEY = 'stockbook_v1_backup';

/**
 * 지원 시장 구분
 */
export type MarketType = 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE' | 'ETC';

/**
 * 지원 통화 구분
 */
export type CurrencyType = 'KRW' | 'USD' | 'JPY';

/**
 * 보유 종목 상태
 */
export type HoldingStatus = 'active' | 'sold';

/**
 * 개별 보유 종목 데이터 모델
 */
export interface Holding {
  id: string; // crypto.randomUUID()
  name: string;
  ticker: string;
  market: MarketType | string;
  currency: CurrencyType | string;
  sector: string;
  buyPrice: number;
  quantity: number;
  buyDate: string; // YYYY-MM-DD
  currentPrice: number;
  memo: string;
  status: HoldingStatus;
}

/**
 * AI 어드바이저 조언 기록 모델
 */
export interface AdviceHistoryItem {
  id: string;
  timestamp: string; // ISO 8601
  dateStr: string; // YYYY-MM-DD (요일) HH:mm
  model: string;
  content: string; // 마크다운 원문
  summaryTitle?: string;
}

/**
 * 앱 환경설정 모델
 */
export interface AppSettings {
  apiKey: string;
  model: string;
}

/**
 * 배당 내역 모델 (배당금 캘린더 & DRIP 기능용)
 */
export interface DividendRecord {
  id: string;
  holdingId?: string;
  ticker: string;
  name: string;
  market: string;
  currency: string;
  exDate: string; // YYYY-MM-DD
  payDate: string; // YYYY-MM-DD
  dps: number; // 주당 배당금
  quantity: number; // 보유 주식수
  isPaid: boolean; // 지급 완료 여부
  taxRate: number; // 0.154 or 0.15
  memo?: string;
}

/**
 * 매매 일지 기록 모델
 */
export interface TradeJournalEntry {
  id: string;
  ticker: string;
  name: string;
  type: 'BUY' | 'SELL';
  date: string;
  price: number;
  quantity: number;
  currency: string;
  thesis: string;
  targetPrice?: number;
  stopLoss?: number;
}

/**
 * StockBook v1 중앙 데이터 스토리지 구조
 */
export interface StockBookState {
  version: 1;
  settings: AppSettings;
  holdings: Holding[];
  adviceHistory: AdviceHistoryItem[];
  dividends?: DividendRecord[];
  journals?: TradeJournalEntry[];
}

/**
 * 통화별 집계 요약 모델
 */
export interface CurrencySummary {
  currency: string;
  symbol: string;
  totalBuyAmount: number;
  totalCurrentValue: number;
  totalProfit: number;
  profitRate: number;
  holdingCount: number;
}
