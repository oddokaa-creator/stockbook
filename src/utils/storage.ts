/**
 * StockBook - 데이터 관리 및 로컬스토리지 지속성 관리 모듈
 * @license Apache-2.0
 */

import {
  DEFAULT_MODEL,
  Holding,
  STORAGE_BACKUP_KEY,
  STORAGE_KEY,
  StockBookState,
} from '../types/stockbook';

/**
 * 기본 초기 보유 종목 데이터 (초기 사용자 경험을 위해 제공)
 */
export const INITIAL_HOLDINGS: Holding[] = [
  {
    id: 'stock-samsung-005930',
    name: '삼성전자',
    ticker: '005930',
    market: 'KOSPI',
    currency: 'KRW',
    sector: 'IT/반도체',
    buyPrice: 68000,
    quantity: 240,
    buyDate: '2024-01-15',
    currentPrice: 73400,
    memo: 'HBM 및 파운드리 실적 개선 기대, 분기 배당 수령 목적',
    status: 'active',
  },
  {
    id: 'stock-apple-aapl',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    market: 'NASDAQ',
    currency: 'USD',
    sector: '빅테크',
    buyPrice: 175.2,
    quantity: 50,
    buyDate: '2024-02-10',
    currentPrice: 203.4,
    memo: 'Apple Intelligence 및 강력한 생태계 해자',
    status: 'active',
  },
  {
    id: 'stock-skhynix-000660',
    name: 'SK하이닉스',
    ticker: '000660',
    market: 'KOSPI',
    currency: 'KRW',
    sector: 'IT/반도체',
    buyPrice: 140000,
    quantity: 45,
    buyDate: '2024-03-05',
    currentPrice: 173973,
    memo: 'HBM3E 독점적 지위 및 AI 서버향 메모리 공급',
    status: 'active',
  },
  {
    id: 'stock-nvidia-nvda',
    name: 'NVIDIA Corp.',
    ticker: 'NVDA',
    market: 'NASDAQ',
    currency: 'USD',
    sector: '반도체/AI',
    buyPrice: 110.0,
    quantity: 38,
    buyDate: '2024-04-12',
    currentPrice: 112.5,
    memo: 'Blackwell 아키텍처 출시 및 데이터센터 수요 가속',
    status: 'active',
  },
  {
    id: 'stock-tesla-tsla',
    name: 'Tesla Inc.',
    ticker: 'TSLA',
    market: 'NASDAQ',
    currency: 'USD',
    sector: '전기차/자율주행',
    buyPrice: 220.0,
    quantity: 15,
    buyDate: '2024-05-20',
    currentPrice: 192.5,
    memo: 'FSD V12 및 로보택시 비전 점검',
    status: 'active',
  },
];

/**
 * 기본 앱 상태 생성
 * @returns {StockBookState} 기본 구조를 가진 상태 객체
 */
export function getDefaultState(): StockBookState {
  return {
    version: 1,
    settings: {
      apiKey: '',
      model: DEFAULT_MODEL,
    },
    holdings: INITIAL_HOLDINGS,
    adviceHistory: [
      {
        id: 'init-advice-sample',
        timestamp: new Date().toISOString(),
        dateStr: '2025-01-15 (수) 14:30',
        model: DEFAULT_MODEL,
        summaryTitle: '포트폴리오 리밸런싱 인사이트',
        content: `현재 전체 포트폴리오에서 **삼성전자(36%)**와 **Apple(28%)**의 대형 IT 비중이 **64%**로 집중되어 있습니다.
- **테슬라(-12.50%)**의 경우 지지선 부근 분할 매수 또는 비중 조절을 검토할 수 있습니다.
- 경기 방어주 또는 고배당 ETF를 소폭 편입하여 변동성 위험을 분산하는 전략을 추천합니다.

이 내용은 참고용이며 투자 판단과 책임은 본인에게 있습니다.`,
      },
    ],
  };
}

/**
 * 로컬스토리지에서 StockBook 데이터를 안전하게 로드합니다.
 * JSON.parse 에러 발생 시 원본을 stockbook_v1_backup 에 백업 후 기본값 초기화.
 * @param {(msg: string, type: 'error' | 'warning' | 'info') => void} [onNotify] - 사용자 알림 콜백
 * @returns {StockBookState} 로드된 상태 객체
 */
export function loadStockBookState(
  onNotify?: (msg: string, type: 'error' | 'warning' | 'info') => void
): StockBookState {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      const defaultState = getDefaultState();
      saveStockBookState(defaultState);
      return defaultState;
    }

    try {
      const parsed = JSON.parse(rawData);
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
        throw new Error('데이터 버전이 일치하지 않거나 유효하지 않은 데이터 구조입니다.');
      }

      // 안전한 기본값 병합
      return {
        version: 1,
        settings: {
          apiKey: parsed.settings?.apiKey || '',
          model: parsed.settings?.model || DEFAULT_MODEL,
        },
        holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
        adviceHistory: Array.isArray(parsed.adviceHistory) ? parsed.adviceHistory : [],
        dividends: Array.isArray(parsed.dividends) ? parsed.dividends : undefined,
        journals: Array.isArray(parsed.journals) ? parsed.journals : undefined,
      };
    } catch (parseError: any) {
      // JSON 파싱 실패 시 원본 백업
      console.error('StockBook JSON.parse failure:', parseError);
      localStorage.setItem(STORAGE_BACKUP_KEY, rawData);
      
      const fallbackState = getDefaultState();
      saveStockBookState(fallbackState);

      if (onNotify) {
        onNotify(
          '기존 데이터 파싱 중 오류가 발생하여 원본을 백업(stockbook_v1_backup)하고 기본값으로 초기화했습니다.',
          'error'
        );
      }
      return fallbackState;
    }
  } catch (error: any) {
    console.error('Error accessing localStorage:', error);
    return getDefaultState();
  }
}

/**
 * 로컬스토리지에 StockBook 상태를 저장합니다.
 * @param {StockBookState} state - 저장할 상태 객체
 * @returns {boolean} 저장 성공 여부
 */
export function saveStockBookState(state: StockBookState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * 데이터를 JSON 파일로 내보내기 (백업)
 * 요구사항: 백업 파일에서 apiKey는 제외한다.
 * @param {StockBookState} state - 현재 앱 상태
 */
export function exportBackupJSON(state: StockBookState): void {
  try {
    const sanitizedState = {
      version: state.version,
      exportedAt: new Date().toISOString(),
      settings: {
        apiKey: '', // API 키는 백업 파일에서 엄격히 제외
        model: state.settings.model || DEFAULT_MODEL,
      },
      holdings: state.holdings,
      adviceHistory: state.adviceHistory,
      dividends: state.dividends,
      journals: state.journals,
    };

    const jsonString = JSON.stringify(sanitizedState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `stockbook_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export backup JSON:', error);
    throw error;
  }
}

/**
 * 불러온 백업 JSON 데이터의 유효성을 검증합니다.
 * @param {any} data - 파싱된 JSON 데이터
 * @returns {{ valid: boolean; error?: string; state?: StockBookState }}
 */
export function validateBackupData(data: any): {
  valid: boolean;
  error?: string;
  state?: StockBookState;
} {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '유효한 JSON 객체가 아닙니다.' };
    }
    if (data.version !== 1) {
      return { valid: false, error: '지원되지 않는 백업 버전입니다. (version: 1 필요)' };
    }
    if (!Array.isArray(data.holdings)) {
      return { valid: false, error: '보유 종목(holdings) 목록이 누락되었거나 배열이 아닙니다.' };
    }

    // 각 종목 필수 필드 검증
    for (let i = 0; i < data.holdings.length; i++) {
      const h = data.holdings[i];
      if (!h.name || typeof h.name !== 'string') {
        return { valid: false, error: `${i + 1}번째 종목의 이름이 유효하지 않습니다.` };
      }
      if (typeof h.buyPrice !== 'number' || isNaN(h.buyPrice)) {
        return { valid: false, error: `${h.name} 종목의 매수가가 숫자가 아닙니다.` };
      }
      if (typeof h.quantity !== 'number' || isNaN(h.quantity)) {
        return { valid: false, error: `${h.name} 종목의 수량이 숫자가 아닙니다.` };
      }
    }

    const validatedState: StockBookState = {
      version: 1,
      settings: {
        apiKey: '', // 복원 시 기존 키 유지 또는 공백 처리
        model: data.settings?.model || DEFAULT_MODEL,
      },
      holdings: data.holdings.map((h: any) => ({
        id: h.id || crypto.randomUUID(),
        name: String(h.name).trim(),
        ticker: String(h.ticker || '').trim().toUpperCase(),
        market: h.market || 'KOSPI',
        currency: h.currency || 'KRW',
        sector: String(h.sector || '').trim(),
        buyPrice: Number(h.buyPrice) || 0,
        quantity: Number(h.quantity) || 0,
        buyDate: h.buyDate || new Date().toISOString().slice(0, 10),
        currentPrice: Number(h.currentPrice ?? h.buyPrice) || 0,
        memo: String(h.memo || '').trim(),
        status: h.status || 'active',
      })),
      adviceHistory: Array.isArray(data.adviceHistory) ? data.adviceHistory : [],
      dividends: Array.isArray(data.dividends) ? data.dividends : undefined,
      journals: Array.isArray(data.journals) ? data.journals : undefined,
    };

    return { valid: true, state: validatedState };
  } catch (err: any) {
    return { valid: false, error: `데이터 검증 오류: ${err.message}` };
  }
}
