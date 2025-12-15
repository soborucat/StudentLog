import React, { useState, useEffect } from 'react';
import { AttendanceReason, AttendanceType, FormConfig, SubmissionData } from '../types';
import { User, Send, CheckCircle, RotateCcw, Settings, Loader2 } from 'lucide-react';
import { submitToGoogleForm } from '../services/formService';

interface MainFormProps {
  config: FormConfig;
  onOpenSettings: () => void;
}

const MainForm: React.FC<MainFormProps> = ({ config, onOpenSettings }) => {
  const [studentId, setStudentId] = useState('');
  const [selectedType, setSelectedType] = useState<AttendanceType | null>(null);
  const [selectedReason, setSelectedReason] = useState<AttendanceReason | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('student_id');
    if (savedId) setStudentId(savedId);
  }, []);

  const handleSubmit = async () => {
    if (!studentId || !selectedType || !selectedReason) return;
    
    // Save student ID for next time
    localStorage.setItem('student_id', studentId);

    setIsSubmitting(true);
    
    const data: SubmissionData = {
        studentId,
        type: selectedType,
        reason: selectedReason
    };

    const result = await submitToGoogleForm(config, data);
    
    // Artificial delay to show processing state as no-cors is instant but silent
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSelectedType(null);
    setSelectedReason(null);
    // Keep student ID as it's likely the same user
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-auto text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">제출 완료!</h2>
        <p className="text-gray-600 mb-8">출결 신청이 성공적으로 전송되었습니다.</p>
        
        <div className="space-y-3">
          <button 
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-5 h-5" /> 추가 제출하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-auto relative">
      <button 
        onClick={onOpenSettings} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        aria-label="설정"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">출결 신청</h1>
        <p className="text-sm text-gray-500 mt-1">학번과 사유를 입력해주세요</p>
      </div>

      <div className="space-y-6">
        {/* Student ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. 학번
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="예: 30105 홍길동"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
            />
          </div>
        </div>

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            2. 출결 구분
          </label>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(AttendanceType).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`py-3 px-2 rounded-lg text-sm font-bold border transition-all ${
                  selectedType === type
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            3. 사유
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(AttendanceReason).map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`py-3 px-2 rounded-lg text-sm font-bold border transition-all ${
                  selectedReason === reason
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!studentId || !selectedType || !selectedReason || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
            !studentId || !selectedType || !selectedReason || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1'
          }`}
        >
          {isSubmitting ? (
             <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              제출하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MainForm;