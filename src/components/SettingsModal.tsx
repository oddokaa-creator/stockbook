/**
 * StockBook - 환경설정 모달 컴포넌트
 * Gemini API 키 및 모델명 관리
 * @license Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppSettings, DEFAULT_MODEL } from '../types/stockbook';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (newSettings: AppSettings) => void;
  onDeleteKey: () => void;
}

/**
 * 환경설정 모달 컴포넌트
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
  onDeleteKey,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || DEFAULT_MODEL);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey || '');
      setModel(settings.model || DEFAULT_MODEL);
      setShowKey(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      apiKey: apiKey.trim(),
      model: model.trim() || DEFAULT_MODEL,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('저장된 Gemini API 키를 삭제하시겠습니까?')) {
      setApiKey('');
      onDeleteKey();
    }
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">API 및 앱 설정</h3>
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

        {/* 폼 콘텐츠 */}
        <div className="space-y-4 text-xs">
          
          {/* Gemini API 키 입력창 (id="api-key-input") */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="api-key-input"
                className="font-semibold text-slate-700 dark:text-slate-300"
              >
                Gemini API 키 <span className="text-red-500">*</span>
              </label>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-[11px] text-red-500 hover:text-red-600 dark:text-red-400 flex items-center gap-1 font-medium transition-colors"
                >
                  <i className="fa-regular fa-trash-can text-[10px]"></i>
                  키 삭제
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                id="api-key-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs pr-10 font-mono"
              />
              {/* 키 보기/숨기기 토글 (id="toggle-key-visibility") */}
              <button
                type="button"
                id="toggle-key-visibility"
                aria-label="API 키 보기 토글"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showKey ? (
                  <i className="fa-regular fa-eye-slash"></i>
                ) : (
                  <i className="fa-regular fa-eye"></i>
                )}
              </button>
            </div>

            {/* 안내 문구 필수 요구사항 */}
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 leading-relaxed">
              <i className="fa-solid fa-shield-halved text-[10px] text-emerald-500 shrink-0"></i>
              API 키는 이 브라우저의 localStorage에만 저장되며, 공용 PC에서는 사용 후 삭제하세요.
            </p>
          </div>

          {/* 모델명 입력창 (id="model-input") */}
          <div>
            <label
              htmlFor="model-input"
              className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              모델명 (Gemini Model)
            </label>
            <input
              type="text"
              id="model-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="예: gemini-3.6-flash"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>기본값: {DEFAULT_MODEL}</span>
              <button
                type="button"
                onClick={() => setModel(DEFAULT_MODEL)}
                className="text-indigo-500 hover:underline"
              >
                기본값으로 재설정
              </button>
            </div>
          </div>

        </div>

        {/* 모달 푸터 버튼 */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            id="save-settings-btn"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
          >
            저장하기
          </button>
        </div>

      </div>
    </div>
  );
};
