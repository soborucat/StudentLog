import React, { useState, useEffect } from 'react';
import { FormConfig } from '../types';
import { extractEntryKeys } from '../services/formService';
import { Settings, HelpCircle, Link as LinkIcon, Check, AlertCircle, ArrowDown } from 'lucide-react';

interface ConfigScreenProps {
  initialConfig: FormConfig | null;
  onSave: (config: FormConfig) => void;
  onCancel: () => void;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ initialConfig, onSave, onCancel }) => {
  const [prefilledUrl, setPrefilledUrl] = useState('');
  const [detectedEntries, setDetectedEntries] = useState<string[]>([]);
  
  const [formUrl, setFormUrl] = useState(initialConfig?.formUrl || '');
  const [studentIdEntry, setStudentIdEntry] = useState(initialConfig?.studentIdEntry || '');
  const [typeEntry, setTypeEntry] = useState(initialConfig?.typeEntry || '');
  const [reasonEntry, setReasonEntry] = useState(initialConfig?.reasonEntry || '');
  
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);

  const handleParseUrl = () => {
    setError(null);
    const urlToProcess = prefilledUrl.trim();

    if (!urlToProcess) {
      setError("링크를 입력해주세요.");
      return;
    }

    try {
      // Common mistake check: User copied the browser address bar instead of clicking "Get Link" button
      if (urlToProcess.includes('/prefill') && !urlToProcess.includes('entry.')) {
        setError("입력하신 링크는 '작성 화면'의 주소입니다. 화면 하단의 [링크 복사] 버튼을 눌러서 클립보드에 복사된 긴 링크를 붙여넣어주세요.");
        return;
      }

      const keys = extractEntryKeys(urlToProcess);
      if (keys.length === 0) {
        setError("링크에서 항목 정보를 찾을 수 없습니다. '미리 채워진 링크 가져오기' 화면에서 값을 입력 후 하단의 [링크 복사] 버튼을 누르셨나요?");
        return;
      }

      let baseUrl = urlToProcess.split('?')[0];
      if (baseUrl.endsWith('/viewform')) {
        baseUrl = baseUrl.replace('/viewform', '/formResponse');
      } else if (baseUrl.endsWith('/prefill')) {
        baseUrl = baseUrl.replace('/prefill', '/formResponse');
      }

      setFormUrl(baseUrl);
      setDetectedEntries(keys);
      
      // Auto-assign if we have exactly 3 keys, just to be helpful, 
      // but let user confirm.
      if (keys.length >= 1) setStudentIdEntry(keys[0]);
      if (keys.length >= 2) setTypeEntry(keys[1]);
      if (keys.length >= 3) setReasonEntry(keys[2]);

      setStep(2);
    } catch (e) {
      setError("URL 형식이 올바르지 않습니다.");
    }
  };

  const handleSave = () => {
    if (!formUrl || !studentIdEntry || !typeEntry || !reasonEntry) {
      setError("모든 항목을 선택해야 합니다.");
      return;
    }
    onSave({
      formUrl,
      studentIdEntry,
      typeEntry,
      reasonEntry
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-auto">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">앱 설정</h2>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 space-y-2 border border-blue-100">
            <h3 className="font-bold flex items-center gap-2 text-base">
              <HelpCircle className="w-5 h-5" /> 설정 방법 (중요!)
            </h3>
            <ol className="list-decimal list-inside space-y-2 ml-1">
              <li>구글 설문지 편집 화면 우측 상단 <strong>⋮ (더보기)</strong> 클릭</li>
              <li><strong>'미리 채워진 링크 가져오기'</strong> 메뉴 선택</li>
              <li>각 질문에 임의의 값(예: 1234, 결석, 질병)을 대충 입력</li>
              <li className="font-bold text-blue-700 bg-blue-100 p-1 rounded">
                 화면 맨 아래의 [링크 복사] 버튼 클릭
              </li>
              <li>
                복사된 링크(주소창 주소 아님!)를 아래 칸에 붙여넣기
              </li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              복사한 링크 붙여넣기
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={prefilledUrl}
                onChange={(e) => setPrefilledUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/...usp=pp_url..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {error ? (
              <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                <span>{error}</span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                * 주소창의 링크가 아니라, 버튼을 눌러 복사된 링크여야 합니다.
              </p>
            )}
          </div>

          <button
            onClick={handleParseUrl}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            분석하기 <ArrowDown className="w-4 h-4" />
          </button>
          
          {initialConfig && (
            <button
               onClick={onCancel}
               className="w-full mt-2 text-gray-500 hover:text-gray-700 py-2 text-sm underline"
            >
              취소하고 돌아가기
            </button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-green-50 p-3 rounded-lg text-green-800 text-sm mb-4 border border-green-100">
            <p className="flex items-center gap-2 font-bold text-base">
              <Check className="w-5 h-5" /> 링크 분석 성공!
            </p>
            <p className="mt-1 pl-7">아래에서 각 항목에 맞는 질문을 연결해주세요.</p>
          </div>

          {error && (
             <p className="text-sm text-red-600 flex items-center gap-1 mb-2 bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" /> {error}
             </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">1. 학번 (단답형)</label>
              <select 
                value={studentIdEntry} 
                onChange={(e) => setStudentIdEntry(e.target.value)}
                className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택해주세요</option>
                {detectedEntries.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">2. 출결 신청 (객관식)</label>
              <select 
                value={typeEntry} 
                onChange={(e) => setTypeEntry(e.target.value)}
                className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택해주세요</option>
                {detectedEntries.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">3. 출결 사유 (객관식)</label>
              <select 
                value={reasonEntry} 
                onChange={(e) => setReasonEntry(e.target.value)}
                className="w-full border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택해주세요</option>
                {detectedEntries.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors"
            >
              다시 링크 입력
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              저장 및 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigScreen;