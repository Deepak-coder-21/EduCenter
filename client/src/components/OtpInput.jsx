import React, { useRef, useEffect } from 'react';

/**
 * Modern 6-digit OTP Input component with auto-focus, backspace jumping,
 * and clipboard paste support.
 */
const OtpInput = ({ value = '', onChange, length = 6, disabled = false, autoFocus = true }) => {
  const inputRefs = useRef([]);

  // Ensure value is padded/sliced to length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    // Only accept numeric digits
    const cleaned = rawVal.replace(/\D/g, '');

    if (!cleaned) {
      // Clear current digit
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    // If user typed or pasted single/multiple digits
    const newDigits = [...digits];
    if (cleaned.length === 1) {
      newDigits[index] = cleaned;
      onChange(newDigits.join(''));
      // Move focus to next input if available
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      // Handle paste directly in input
      const pasteChars = cleaned.slice(0, length);
      for (let i = 0; i < pasteChars.length; i++) {
        if (index + i < length) {
          newDigits[index + i] = pasteChars[i];
        }
      }
      onChange(newDigits.join(''));
      const nextIndex = Math.min(index + pasteChars.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move back and clear previous
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    onChange(newDigits.join(''));

    const focusIdx = Math.min(pasteData.length, length - 1);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-2" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all outline-none shadow-sm ${
            digit
              ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 ring-2 ring-indigo-500/20'
              : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
