import React, { useState, useEffect } from 'react';
import '../App.css';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import OtpInput from '../util/OtpInput';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Register() {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [csrfToken, setCsrfToken] = useState('');
  const { backendUrl } = useAppContext();
  const navigate = useNavigate();

  // 🧠 Warn on tab close during registration
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 🔐 Fetch CSRF token
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

  // ⏳ Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { name, email, password } = user;
      if (!name || !email || !password) throw new Error('All fields are required');

      const res = await axios.post(`${backendUrl}/api/auth/register`, {
        name, email, password
      }, {
        headers: { 'csrf-token': csrfToken },
        withCredentials: true
      });

      if (res.data.success || res.data.otpAllowed) {
        toast.success(res.data.message);
        setStep(2);
        setCooldown(30);
      } else {
        throw new Error(res.data.message || 'Failed to register');
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (otp) => {
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email: user.email,
        otp
      }, {
        headers: { 'csrf-token': csrfToken },
        withCredentials: true
      });

      if (res.data.success) {
        toast.success('Verification success. Account has been created.');
        navigate('/login');
      } else {
        throw new Error('OTP verification failed');
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/send-otp`, {
        email: user.email
      }, {
        headers: { 'csrf-token': csrfToken },
        withCredentials: true
      });

      setCooldown(30);
      toast.success('OTP resent to your email');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-container">
      {step === 1 ? (
        <form className="auth-form" onSubmit={handleRegistration}>
          <h1>Sign Up</h1>

          <div className="input-group">
            <input
              type="text"
              placeholder=" "
              className="inputField"
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              required
              minLength="3"
            />
            <label className="input-label">
              <FaUser /> Name
            </label>
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder=" "
              className="inputField"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
            <label className="input-label">
              <FaEnvelope /> Email
            </label>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder=" "
              className="inputField"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
              minLength="6"
            />
            <label className="input-label">
              <FaLock /> Password
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <Link to="/login">
            <button className="login-link">Already have an account?</button>
          </Link>
        </form>
      ) : (
        <div className="otp-container">
          <h2>Verify Your Email</h2>
          <p>Enter the OTP sent to <strong>{user.email}</strong></p>

          <OtpInput length={6} onComplete={handleVerifyAndRegister} />

          <button
            onClick={resendOTP}
            disabled={cooldown > 0 || loading}
            className="auth-link"
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;
