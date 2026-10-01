/**
 * StockBook - 포맷터 및 한국어 현지화 유틸리티
 * @license Apache-2.0
 */

/**
 * 요일 배열 (한국어)
 */
const KOREAN_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 한국어 원화 금액 포맷팅 (Intl.NumberFormat ko-KR 사용)
 * @param {number} amount - 금액
 * @param {boolean} [includeSymbol=true] - 원화 기호(₩) 포함 여부
 * @returns {string} 포맷팅된 원화 문자열
 */
export function formatKRW(amount: number, includeSymbol: boolean = true): string {
  const rounded = Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('ko-KR').format(rounded);
  return includeSymbol ? `₩${formatted}` : formatted;
}

/**
 * 미국 달러 금액 포맷팅
 * @param {number} amount - 금액
 * @param {boolean} [includeSymbol=true] - 달러 기호($) 포함 여부
 * @returns {string} 포맷팅된 달러 문자열
 */
export function formatUSD(amount: number, includeSymbol: boolean = true): string {
  const val = Number(amount || 0);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
  return includeSymbol ? `$${formatted}` : formatted;
}

/**
 * 통화에 따른 유연한 금액 포맷팅
 * @param {number} amount - 금액
 * @param {string} currency - 통화 코드 ('KRW', 'USD', 'JPY' 등)
 * @param {boolean} [includeSymbol=true] - 기호 포함 여부
 * @returns {string} 포맷팅된 금액 문자열
 */
export function formatCurrency(amount: number, currency: string, includeSymbol: boolean = true): string {
  const curr = (currency || 'KRW').toUpperCase();
  if (curr === 'USD') {
    return formatUSD(amount, includeSymbol);
  }
  if (curr === 'JPY') {
    const formatted = new Intl.NumberFormat('ja-JP').format(Math.round(amount || 0));
    return includeSymbol ? `¥${formatted}` : formatted;
  }
  return formatKRW(amount, includeSymbol);
}

/**
 * 통화 기호 반환
 * @param {string} currency - 통화 코드
 * @returns {string} 통화 기호 (₩, $, ¥ 등)
 */
export function getCurrencySymbol(currency: string): string {
  const curr = (currency || 'KRW').toUpperCase();
  switch (curr) {
    case 'USD':
      return '$';
    case 'JPY':
      return '¥';
    case 'EUR':
      return '€';
    default:
      return '₩';
  }
}

/**
 * 수익률 포맷팅 (+ / - 기호 및 소수점 둘째 자리 표시)
 * @param {number} rate - 수익률 (%)
 * @param {boolean} [includeSignSymbol=false] - ▲ / ▼ 심볼 포함 여부
 * @returns {string} 예: "+15.13%", "▲ +15.13%"
 */
export function formatProfitRate(rate: number, includeSignSymbol: boolean = false): string {
  const val = Number(rate || 0);
  const sign = val > 0 ? '+' : val < 0 ? '-' : '';
  const absVal = Math.abs(val).toFixed(2);
  const symbol = includeSignSymbol ? (val > 0 ? '▲ ' : val < 0 ? '▼ ' : '') : '';
  return `${symbol}${sign}${absVal}%`;
}

/**
 * 손익 금액 포맷팅 (통화 반영, 항상 + / - 기호 포함)
 * @param {number} profit - 손익 금액
 * @param {string} currency - 통화
 * @param {boolean} [includeSymbol=true] - ▲ / ▼ 심볼 포함 여부
 * @returns {string} 예: "▲ +₩1,296,000", "▼ -$55.50"
 */
export function formatProfitAmount(profit: number, currency: string, includeSymbol: boolean = true): string {
  const val = Number(profit || 0);
  const prefixSign = val > 0 ? '+' : val < 0 ? '-' : '';
  const arrow = includeSymbol ? (val > 0 ? '▲ ' : val < 0 ? '▼ ' : '') : '';
  const currSymbol = getCurrencySymbol(currency);
  const absVal = Math.abs(val);

  let formattedNum = '';
  if (currency.toUpperCase() === 'USD') {
    formattedNum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absVal);
  } else {
    formattedNum = new Intl.NumberFormat('ko-KR').format(Math.round(absVal));
  }

  return `${arrow}${prefixSign}${currSymbol}${formattedNum}`;
}

/**
 * 날짜를 YYYY-MM-DD (요일) 형식으로 포맷팅
 * @param {string | Date} dateInput - 날짜 문자열 또는 Date 객체
 * @returns {string} 예: "2025-01-15 (수)"
 */
export function formatDateWithDay(dateInput: string | Date): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00`) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dayName = KOREAN_DAY_NAMES[d.getDay()];

    return `${year}-${month}-${day} (${dayName})`;
  } catch {
    return String(dateInput);
  }
}

/**
 * 한국어 축약 표기 (예: 4,893만)
 * @param {number} amount - 원화 금액
 * @returns {string} 예: "4,893만"
 */
export function formatCompactKRW(amount: number): string {
  const val = Math.round(amount || 0);
  if (Math.abs(val) >= 100000000) {
    // 억 단위
    const eok = (val / 100000000).toFixed(1).replace(/\.0$/, '');
    return `${eok}억`;
  }
  if (Math.abs(val) >= 10000) {
    // 만 단위
    const man = Math.round(val / 10000);
    return `${new Intl.NumberFormat('ko-KR').format(man)}만`;
  }
  return formatKRW(val, false);
}

/**
 * XSS 방지를 위한 HTML 특수문자 이스케이프 함수
 * @param {string} str - 원본 문자열
 * @returns {string} 안전하게 이스케이프된 문자열
 */
export function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 안전한 마크다운을 HTML로 변환하는 파서
 * XSS 공격 방지를 위해 먼저 전체를 escapeHTML 처리한 후 치환 진행
 * @param {string} markdown - 마크다운 원문
 * @returns {string} 안전하게 변환된 HTML 문자열
 */
export function renderSafeMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // 1단계: HTML 문자열 완전 이스케이프 (XSS 차단)
  let safe = escapeHTML(markdown);

  // 2단계: 줄바꿈 정규화
  const lines = safe.split(/\r?\n/);
  const outputLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // 빈 줄
    if (!line) {
      if (inList) {
        outputLines.push('</ul>');
        inList = false;
      }
      outputLines.push('<div class="h-2"></div>');
      continue;
    }

    // 헤더 h1, h2, h3, h4
    if (line.startsWith('#### ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h5 class="text-xs font-bold text-slate-900 dark:text-white mt-3 mb-1">${parseInlineStyles(line.slice(5))}</h5>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h4 class="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3 mb-1 flex items-center gap-1.5"><i class="fa-solid fa-circle-chevron-right text-[10px]"></i> ${parseInlineStyles(line.slice(4))}</h4>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h3 class="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">${parseInlineStyles(line.slice(3))}</h3>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<h2 class="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">${parseInlineStyles(line.slice(2))}</h2>`);
      continue;
    }

    // 순서 없는 목록 (- or *)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        outputLines.push('<ul class="list-disc pl-5 space-y-1 my-1.5 text-slate-700 dark:text-slate-300">');
        inList = true;
      }
      const itemContent = line.slice(2);
      outputLines.push(`<li>${parseInlineStyles(itemContent)}</li>`);
      continue;
    }

    // 순서 있는 목록 (1. 2. 등)
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (inList) { outputLines.push('</ul>'); inList = false; }
      outputLines.push(`<div class="flex items-start gap-2 my-1 text-slate-700 dark:text-slate-300"><span class="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">${orderedMatch[1]}</span><span class="flex-1">${parseInlineStyles(orderedMatch[2])}</span></div>`);
      continue;
    }

    // 일반 문단
    if (inList) {
      outputLines.push('</ul>');
      inList = false;
    }
    outputLines.push(`<p class="leading-relaxed text-slate-700 dark:text-slate-300 mb-1.5">${parseInlineStyles(line)}</p>`);
  }

  if (inList) {
    outputLines.push('</ul>');
  }

  return outputLines.join('\n');
}

/**
 * 인라인 마크다운 스타일 파싱 (굵게, 기울임꼴, 인라인 코드, 하이라이트)
 * @param {string} text - 이스케이프된 텍스트
 * @returns {string} 인라인 태그가 적용된 HTML
 */
function parseInlineStyles(text: string): string {
  return text
    // 굵게: **텍스트**
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    // 기울임: *텍스트*
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // 인라인 코드: `코드`
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">$1</code>');
}
