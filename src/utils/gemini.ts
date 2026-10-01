/**
 * StockBook - Gemini API 포트폴리오 어드바이저 연동 모듈
 * @license Apache-2.0
 */

import { CurrencySummary, Holding } from '../types/stockbook';

/**
 * Gemini API 요청 결과 인터페이스
 */
export interface GeminiAdviceResult {
  success: boolean;
  content?: string;
  error?: string;
  errorCode?: 400 | 403 | 404 | 429 | 500 | 'TIMEOUT' | 'NETWORK';
  canOpenSettings?: boolean;
  canRetry?: boolean;
}

/**
 * Gemini API 호출 시 systemInstruction 생성 함수
 */
export const getGeminiSystemInstruction = (theme: string = '종합 분석') => {
  let focus = '객관적으로 분석하고 개선 아이디어를 2~3가지 제시하세요.';
  if (theme === '리스크 점검') {
    focus = '포트폴리오의 리스크(집중도, 하방 경직성, 시장 위험)를 철저히 분석하고 방어적인 리밸런싱 아이디어를 제시하세요.';
  } else if (theme === '배당금 중심 전략') {
    focus = '배당수익률, 현금흐름 창출 능력, 배당 성장성을 중심으로 분석하고 현금흐름을 극대화할 수 있는 배당 중심 리밸런싱 아이디어를 제시하세요.';
  } else if (theme === '성장성 중심 전략') {
    focus = '포트폴리오의 성장 동력, 섹터 전망, 주가 상승 모멘텀을 중심으로 분석하고 공격적인 성장 위주의 리밸런싱 아이디어를 제시하세요.';
  }

  return `당신은 신중하고 객관적인 개인 자산관리 코치입니다. 한국어로 답하세요.
제공된 포트폴리오 데이터만 근거로 분석하고, 모르는 시장 정보나 실시간 주가를 추측해 지어내지 마세요.
현재 사용자가 요청한 분석 테마는 [${theme}] 입니다. 이에 맞춰 다음 순서로 답하세요:
(1) 한 줄 총평
(2) 현재 포트폴리오 진단: 종목/섹터 집중도, 손익 분포
(3) 리스크 요인 및 테마 집중 분석: ${focus}
(4) 개선 아이디어 2~3가지
(5) 점검할 질문 (사용자가 스스로 생각해볼 질문).
특정 종목의 매수/매도를 단정적으로 지시하지 말고, 근거와 함께 '고려해볼 점' 형태로 제시하세요.
마지막에 '이 내용은 참고용이며 투자 판단과 책임은 본인에게 있습니다.'를 한 줄로 덧붙이세요.`;
};

/**
 * Gemini API를 호출하여 포트폴리오 리밸런싱 및 투자 조언을 생성합니다.
 * @param {string} apiKey - Gemini API 키
 * @param {string} model - 모델명 (기본: gemini-3.6-flash)
 * @param {Holding[]} holdings - 보유 종목 배열
 * @param {CurrencySummary[]} currencySummaries - 통화별 요약 데이터
 * @param {string} theme - 분석 테마 (기본: 종합 분석)
 * @returns {Promise<GeminiAdviceResult>} AI 분석 결과 객체
 */
export async function fetchPortfolioAdvice(
  apiKey: string,
  model: string,
  holdings: Holding[],
  currencySummaries: CurrencySummary[],
  theme: string = '종합 분석'
): Promise<GeminiAdviceResult> {
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: 'Gemini API 키가 등록되지 않았습니다. 설정에서 키를 먼저 등록해주세요.',
      errorCode: 400,
      canOpenSettings: true,
    };
  }

  if (!holdings || holdings.length === 0) {
    return {
      success: false,
      error: '분석할 보유 종목이 없습니다. 먼저 종목을 1개 이상 추가해주세요.',
    };
  }

  // 30초 타임아웃 AbortController 구성
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  // 포트폴리오 데이터 요약 전송용 포맷 구성
  const formattedSummary = currencySummaries.map((s) => ({
    currency: s.currency,
    totalBuyAmount: s.totalBuyAmount,
    totalCurrentValue: s.totalCurrentValue,
    totalProfit: s.totalProfit,
    profitRate: `${s.profitRate.toFixed(2)}%`,
    holdingCount: s.holdingCount,
  }));

  // 통화별 총 평가금액 계산 (비중 산출용)
  const currencyTotals: Record<string, number> = {};
  holdings.forEach((h) => {
    const curr = (h.currency || 'KRW').toUpperCase();
    const val = (h.currentPrice || h.buyPrice) * h.quantity;
    currencyTotals[curr] = (currencyTotals[curr] || 0) + val;
  });

  const formattedHoldings = holdings.map((h) => {
    const curr = (h.currency || 'KRW').toUpperCase();
    const currVal = (h.currentPrice || h.buyPrice) * h.quantity;
    const buyVal = h.buyPrice * h.quantity;
    const profit = currVal - buyVal;
    const profitRate = buyVal > 0 ? (profit / buyVal) * 100 : 0;
    const totalInCurr = currencyTotals[curr] || 1;
    const weight = ((currVal / totalInCurr) * 100).toFixed(1);

    return {
      name: h.name,
      ticker: h.ticker,
      market: h.market,
      currency: h.currency,
      sector: h.sector || '기타',
      buyPrice: h.buyPrice,
      quantity: h.quantity,
      currentPrice: h.currentPrice,
      weight: `${weight}% (${curr} 내)`,
      profitRate: `${profitRate.toFixed(2)}%`,
      memo: h.memo || '없음',
    };
  });

  const requestPayload = {
    systemInstruction: {
      parts: [
        {
          text: getGeminiSystemInstruction(theme),
        },
      ],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `다음은 사용자의 실시간 포트폴리오 데이터입니다. 규칙에 따라 객관적으로 분석해주세요.

[포트폴리오 요약]
${JSON.stringify(formattedSummary, null, 2)}

[보유 종목 명세]
${JSON.stringify(formattedHoldings, null, 2)}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  };

  try {
    const targetModel = (model || 'gemini-3.6-flash').trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      targetModel
    )}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      if (status === 400 || status === 403) {
        return {
          success: false,
          errorCode: status as 400 | 403,
          error: 'API 키가 올바르지 않거나 권한이 없습니다. 설정에서 키를 확인해주세요.',
          canOpenSettings: true,
        };
      }
      if (status === 404) {
        return {
          success: false,
          errorCode: 404,
          error: `모델명(${targetModel})을 찾을 수 없습니다. 설정에서 모델명을 확인해주세요.`,
          canOpenSettings: true,
        };
      }
      if (status === 429) {
        return {
          success: false,
          errorCode: 429,
          error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          canRetry: true,
        };
      }

      let errorMsg = `API 요청 실패 (HTTP ${status})`;
      try {
        const errJson = await response.json();
        if (errJson?.error?.message) {
          errorMsg += `: ${errJson.error.message}`;
        }
      } catch {
        // ignore
      }

      return {
        success: false,
        errorCode: 500,
        error: errorMsg,
        canRetry: true,
      };
    }

    const data = await response.json();

    // promptFeedback 차단 여부 검사
    if (data.promptFeedback?.blockReason) {
      return {
        success: false,
        error: `콘텐츠 정책에 의해 요청이 차단되었습니다 (사유: ${data.promptFeedback.blockReason}).`,
      };
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      return {
        success: false,
        error: 'AI로부터 응답을 수신하지 못했습니다. 다시 시도해주세요.',
        canRetry: true,
      };
    }

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.warn('Finish reason not STOP:', candidate.finishReason);
    }

    const parts = candidate.content?.parts || [];
    const textOutput = parts
      .map((p: any) => p.text || '')
      .join('\n')
      .trim();

    if (!textOutput) {
      return {
        success: false,
        error: '생성된 조언 내용이 비어 있습니다. 잠시 후 다시 시도해주세요.',
        canRetry: true,
      };
    }

    return {
      success: true,
      content: textOutput,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        errorCode: 'TIMEOUT',
        error: '네트워크 요청 시간이 30초를 초과했습니다. 연결을 확인하고 다시 시도해주세요.',
        canRetry: true,
      };
    }
    return {
      success: false,
      errorCode: 'NETWORK',
      error: '네트워크 연결을 확인하고 다시 시도해주세요.',
      canRetry: true,
    };
  }
}
