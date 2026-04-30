import React, { useState } from 'react';
import Modal from './Modal';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  variant = "primary", 
  isLoading = false,
  withInput = false,
  inputPlaceholder = "Enter notes here...",
  inputDefault = ""
}) {
  const [inputValue, setInputValue] = useState(inputDefault);

  const handleConfirm = () => {
    if (withInput) {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  const getConfirmButtonClasses = () => {
    if (variant === 'danger') return 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20';
    if (variant === 'success') return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20';
    if (variant === 'warning') return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20';
    return 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'; // primary
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-8 space-y-6">
        <div className="flex items-start gap-4">
          <AlertCircle className={`w-8 h-8 shrink-0 ${variant === 'danger' ? 'text-rose-500' : 'text-slate-400'}`} />
          <div className="space-y-4 w-full">
            <p className="text-slate-600 font-medium text-[15px] leading-relaxed">{message}</p>
            
            {withInput && (
              <div className="w-full">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-50">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            disabled={isLoading} 
            className={`flex-[1.5] py-3 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-70 ${getConfirmButtonClasses()}`}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
