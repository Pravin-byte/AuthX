import React, { useState, useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  const updateOtp = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, '');
    if (!digit) return;

    updateOtp(digit[0], index);

    // Move focus to next input
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        updateOtp('', index);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  // Automatically call onComplete when all digits are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== '')) {
      onComplete?.(otp.join(''));
    }
  }, [otp]);

  return (
    <div className="otp-input-box">
      {otp.map((value, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="otp-digit"
        />
      ))}
    </div>
  );
};

export default OtpInput;
