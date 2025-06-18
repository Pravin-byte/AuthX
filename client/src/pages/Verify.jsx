import React, { useState, useEffect } from 'react';
import '../App.css';
import OtpInput from '../util/OtpInput';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import Swal from 'sweetalert2';

function Verify() {
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const { backendUrl } = useAppContext();
  const navigate = useNavigate();

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(res.data.csrfToken);
      } catch (err) {
        toast.error('Failed to fetch CSRF token');
      }
    };
    fetchCsrf();
  }, [backendUrl]);

  // Prevent tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isVerified) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isVerified]);

  // Warn on back navigation
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      Swal.fire({
        title: 'Are you sure?',
        text: 'Your verification process may be interrupted.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Leave',
        cancelButtonText: 'Stay on page',
      }).then((result) => {
        if (result.isConfirmed) {
          window.removeEventListener('beforeunload', () => {}); // optional
          window.history.back();
        }
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('registerEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error('No email found. Please register again.');
      navigate('/register');
    }
  }, [navigate]);

  // Cooldown for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOTPSubmit = async (otp) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/verify-otp`,
        { email, otp },
        {
          headers: { 'CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success('Verification successful! Please log in.');
        localStorage.removeItem('registerEmail');
        setIsVerified(true);
        navigate('/login');
      } else {
        throw new Error(res.data.message || 'Verification failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/auth/send-otp`,
        { email },
        {
          headers: { 'CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      toast.success('New OTP sent to your email');
      setCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="otp-container">
        <h2>Email Verification</h2>
        <p>Enter the OTP sent to <strong>{email}</strong></p>

        <OtpInput length={6} onComplete={handleOTPSubmit} />

        <button
          onClick={resendOTP}
          disabled={cooldown > 0 || loading}
          className="auth-link"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}

export default Verify;
