import React, { useState, useEffect } from 'react';
import '../App.css';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import OtpInput from '../util/OtpInput';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

function ChangePassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { backendUrl } = useAppContext();
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  // Fetch CSRF token on mount
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(res.data.csrfToken);
      } catch (error) {
        toast.error('Failed to load CSRF token');
      }
    };
    getCsrfToken();
  }, [backendUrl]);

  const handleSendOTP = async () => {
    if (!email) return toast.error('Email is required');
    setLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email },
        {
          headers: { 'CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setStep(2);
        setCooldown(15 * 60);
        toast.success('OTP sent (valid for 15 minutes)');
      } else toast.error(res.data.message || 'Failed to send OTP');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (enteredOtp) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/verify-reset-otp`,
        { email, otp: enteredOtp },
        {
          headers: { 'CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setOtp(enteredOtp);
        setStep(3);
        toast.success('OTP verified');
      } else toast.error(res.data.message || 'OTP verification failed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (newPassword !== confirmPass) {
      return toast.error('Password did not match');
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword },
        {
          headers: { 'CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success('Password reset successful! Please login.');
        navigate('/login');
      } else {
        toast.error(res.data.message || 'Password reset failed');
        setStep(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email },
        {
          headers: { 'CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setCooldown(60); // 1 min cooldown
        toast.success('OTP resent to your email');
      } else toast.error(res.data.message || 'Failed to resend OTP');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="auth-container">
      {step === 1 && (
        <div className="auth-form">
          <h1>Reset Password</h1>
          <div className="input-group">
            <input
              type="email"
              placeholder=" "
              className="inputField"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="input-label"><FaEnvelope /> Email</label>
          </div>
          <button onClick={handleSendOTP} className="auth-btn" disabled={loading || !email}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="otp-container">
          <h2>Verify Your Email</h2>
          <p>Enter the OTP sent to {email}</p>
          <p className="otp-timer">OTP expires in: {formatTime(cooldown)}</p>
          <OtpInput length={6} onComplete={handleVerifyOTP} />
          <button onClick={resendOTP} disabled={cooldown > 0 || loading} className="auth-link">
            {cooldown > 0 ? `Resend OTP in ${formatTime(cooldown)}` : 'Resend OTP'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="auth-form">
          <h1>Set New Password</h1>
          <div className="input-group">
            <input
              type="password"
              placeholder=" "
              className="inputField"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
            <label className="input-label"><FaLock /> New Password</label>
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder=" "
              className="inputField"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              minLength="6"
            />
            <label className="input-label"><FaLock /> Confirm Password</label>
          </div>
          <button onClick={handleResetPassword} className="auth-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ChangePassword;
