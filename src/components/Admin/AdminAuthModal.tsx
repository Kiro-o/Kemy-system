import React, { useState } from 'react';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  correctPin: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  correctPin = '1980',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (candidatePin: string) => {
    const targetPin = (correctPin && correctPin.trim()) ? correctPin.trim() : '1980';
    if (candidatePin === targetPin) {
      onAuthenticated();
      setPin('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl relative z-10">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black text-white">لوحة تحكم إدارة التوريدات</h3>
          <p className="text-xs text-slate-400 mt-1">
            أدخل رمز المرور السري (الافتراضي: <span className="font-mono text-amber-400 font-bold">{correctPin || '1980'}</span>)
          </p>

          {/* PIN Indicators */}
          <div className="flex justify-center gap-3 my-6">
            {[0, 1, 2, 3].map((idx) => {
              const filled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    error
                      ? 'bg-red-500 scale-110'
                      : filled
                      ? 'bg-brand-500 scale-110 ring-4 ring-brand-500/30'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-red-400 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>رمز المرور غير صحيح! حاول مرة أخرى</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto select-none" dir="ltr">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-13 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white transition-all border border-slate-700/60 shadow-sm"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-13 py-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-400 active:scale-95 transition-all"
            >
              مسح
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-13 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white transition-all border border-slate-700/60 shadow-sm"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="h-13 py-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-400 active:scale-95 transition-all"
            >
              ⌫
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            🔒 مخصصة لصاحب العمل ومدير المستودع لتحديث الأسعار ومتابعة سيارات التوزيع
          </div>
        </div>
      </div>
    </div>
  );
};

